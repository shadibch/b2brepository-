#!/usr/bin/env python
"""
Test script to verify Cloudinary configuration
Run this with: python manage.py shell < test_cloudinary.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'b2b_platform.settings')
django.setup()

from django.conf import settings
from cloudinary import uploader

def test_cloudinary_config():
    """Test if Cloudinary is properly configured"""
    print("Testing Cloudinary configuration...")
    
    # Check if environment variables are set
    cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME')
    api_key = os.getenv('CLOUDINARY_API_KEY')
    api_secret = os.getenv('CLOUDINARY_API_SECRET')
    
    print(f"CLOUDINARY_CLOUD_NAME: {'✓ Set' if cloud_name else '✗ Missing'}")
    print(f"CLOUDINARY_API_KEY: {'✓ Set' if api_key else '✗ Missing'}")
    print(f"CLOUDINARY_API_SECRET: {'✓ Set' if api_secret else '✗ Missing'}")
    
    # Check Django settings
    print(f"DEFAULT_FILE_STORAGE: {settings.DEFAULT_FILE_STORAGE}")
    print(f"CLOUDINARY_STORAGE config: {settings.CLOUDINARY_STORAGE}")
    
    # Test upload (optional - uncomment to test actual upload)
    # try:
    #     result = uploader.upload("https://via.placeholder.com/150", public_id="test_image")
    #     print(f"✓ Upload test successful: {result['secure_url']}")
    # except Exception as e:
    #     print(f"✗ Upload test failed: {e}")

if __name__ == "__main__":
    test_cloudinary_config() 