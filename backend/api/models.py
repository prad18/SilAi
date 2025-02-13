from django.db import models

class Leader(models.Model):
    name=models.CharField(max_length=100)
    bio=models.TextField()
    image=models.ImageField(upload_to='leader/', null=True, blank=True)

    def __str__(self):
        return self.name
