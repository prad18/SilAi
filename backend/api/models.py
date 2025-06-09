from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_save
import os
import pickle
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from django.conf import settings

class Leader(models.Model):
    name = models.CharField(max_length=100)
    bio = models.TextField()
    image = models.ImageField(upload_to='leader/', null=True, blank=True)
    pdf_file = models.FileField(upload_to='leader_pdfs/', null=True, blank=True, 
                               help_text="Upload PDF documents related to this leader")
    pkl_file_path = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

@receiver(post_save, sender=Leader)
def process_leader_pdf_to_faiss(sender, instance, **kwargs):
    """Convert uploaded PDF to FAISS index and save as pickle file"""
    if instance.pdf_file and not instance.pkl_file_path:
        # Get the PDF file path
        pdf_path = instance.pdf_file.path
        
        # Create directory for pickle files if it doesn't exist
        pkl_folder = os.path.join(settings.MEDIA_ROOT, 'leader_pkl_files')
        if not os.path.exists(pkl_folder):
            os.makedirs(pkl_folder)
        
        # Generate pickle file path with leader name for better identification
        base_filename = f"{instance.name.replace(' ', '_').lower()}"
        pkl_filename = f"{base_filename}.pkl"
        pkl_path = os.path.join(pkl_folder, pkl_filename)
        
        try:
            # Load PDF
            loader = PyPDFLoader(pdf_path)
            documents = loader.load()
            
            # Check if documents were extracted
            if not documents:
                print(f"No documents found in PDF for {instance.name}. Skipping.")
                return
            
            # Create FAISS index
            model_name = "sentence-transformers/all-mpnet-base-v2"
            embeddings = HuggingFaceEmbeddings(
                model_name=model_name, 
                encode_kwargs={"normalize_embeddings": True}
            )
            db = FAISS.from_documents(documents, embeddings)
            
            # Save as pickle file
            with open(pkl_path, "wb") as f:
                pickle.dump(db, f)
            
            # Update model with pickle file path (relative to MEDIA_ROOT)
            relative_path = os.path.join('leader_pkl_files', pkl_filename)
            instance.pkl_file_path = relative_path
            # Using update to avoid triggering the signal again
            Leader.objects.filter(id=instance.id).update(pkl_file_path=relative_path)
            os.remove(pdf_path)
            print(f"PDF file for {instance.name} has been deleted after successful processing")
            
            print(f"FAISS index created and saved for {instance.name} at {pkl_path}")
            
        except Exception as e:
            print(f"Error processing PDF for {instance.name}: {e}")