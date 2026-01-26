from django.db import migrations, models


def migrate_is_active_to_status(apps, schema_editor):
    CustomUser = apps.get_model("b2busers", "CustomUser")
    # If old boolean is_active exists, map True -> Active, False -> Pending
    for u in CustomUser.objects.all().only("id", "status", "reason"):
        # `is_active` might still exist on model state at this point
        old_active = getattr(u, "is_active", None)
        if old_active is True:
            u.status = "Active"
        elif old_active is False:
            u.status = "Pending"
        u.save(update_fields=["status"])


class Migration(migrations.Migration):
    dependencies = [
        ("b2busers", "0002_customuser_language"),
    ]

    operations = [
        migrations.AddField(
            model_name="customuser",
            name="status",
            field=models.CharField(
                choices=[
                    ("Pending", "Pending"),
                    ("Active", "Active"),
                    ("FixIssues", "Fix Issues"),
                    ("Blocked", "Blocked"),
                ],
                default="Pending",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="customuser",
            name="reason",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.RunPython(migrate_is_active_to_status, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="customuser",
            name="is_active",
        ),
    ]


