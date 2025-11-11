# products/management/commands/generate_embeddings.py
import math
from django.core.management.base import BaseCommand
from django.db import transaction
from sentence_transformers import SentenceTransformer
from product.models import Product

class Command(BaseCommand):
    help = "Generate and store sentence-transformers embeddings for products."

    def add_arguments(self, parser):
        parser.add_argument(
            '--batch-size',
            type=int,
            default=64,
            help='Number of products to encode per batch (default: 64).'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Regenerate embeddings even if embedding is already present.'
        )
        parser.add_argument(
            '--model',
            type=str,
            default='all-MiniLM-L6-v2',
            help='SentenceTransformer model to use (default: all-MiniLM-L6-v2).'
        )

    def handle(self, *args, **options):
        batch_size = options['batch_size']
        force = options['force']
        model_name = options['model']

        try:
            model = SentenceTransformer(model_name)
        except Exception as e:
            self.stderr.write(self.style.ERROR(
                f"Failed to load model {model_name}: {e}"
            ))
            return

        qs = Product.objects.all().order_by('id')
        if not force:
            qs = qs.filter(embedding__isnull=True)

        total = qs.count()
        if total == 0:
            self.stdout.write(self.style.SUCCESS("No products to embed."))
            return

        self.stdout.write(f"Generating embeddings for {total} products using {model_name} (batch_size={batch_size})")
        steps = math.ceil(total / batch_size)
        offset = 0

        while True:
            batch_qs = qs[offset: offset + batch_size]
            products = list(batch_qs)
            if not products:
                break

            texts = []
            for p in products:
                # Compose text that the model should embed (customize as needed)
                text = f"{p.name}. {p.description or ''}"
                texts.append(text)

            # encode yields numpy arrays
            embeddings = model.encode(texts, batch_size=batch_size, show_progress_bar=False)

            # assign embeddings and bulk_update
            for p, emb in zip(products, embeddings):
                # convert to list (pgvector accepts list)
                p.embedding = emb.tolist()

            with transaction.atomic():
                Product.objects.bulk_update(products, ['embedding'])

            offset += batch_size
            processed = min(offset, total)
            self.stdout.write(f"Processed {processed}/{total}")

        self.stdout.write(self.style.SUCCESS("Embedding generation complete."))
