# Generated migration for fix reset_token unique constraint and media_url field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('b2busers', '0002_customuser_language'),
        ('product', '0015_alter_category_file_alter_productmedia_file'),
    ]

    operations = [
        # Fix the reset_token field to allow NULL values with unique constraint
        migrations.AlterField(
            model_name='customuser',
            name='reset_token',
            field=models.CharField(blank=True, max_length=50, null=True, unique=True),
        ),
        # Fix the reset_expiary_date field to allow NULL values
        migrations.AlterField(
            model_name='customuser',
            name='reset_expiary_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        # Fix the media_url field to allow NULL values
        migrations.AlterField(
            model_name='product',
            name='media_url',
            field=models.CharField(blank=True, max_length=300, null=True),
        ),
    ]