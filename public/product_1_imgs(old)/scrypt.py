from PIL import Image, ImageFile
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def compress_image(input_path, output_path, max_size_mb=1, quality=85, max_dimensions=None):
    """
    Compresses an image to ensure it is under a specified size in MB.
    
    :param input_path: Path to the input image file.
    :param output_path: Path to save the compressed image.
    :param max_size_mb: Maximum allowed size in MB (default is 1MB).
    :param quality: Initial quality for compression (default is 85).
    :param max_dimensions: Optional tuple (width, height) to resize the image.
    """
    try:
        with Image.open(input_path) as img:
            # Convert to RGB if the image has an alpha channel
            if img.mode in ('RGBA', 'LA'):
                img = img.convert('RGB')
            
            # Resize the image if max_dimensions is provided
            if max_dimensions:
                img.thumbnail(max_dimensions, Image.Resampling.LANCZOS)
            
            # Binary search for optimal quality
            low, high = 5, quality
            while low <= high:
                mid = (low + high) // 2
                img.save(output_path, quality=mid, optimize=True)
                size_mb = os.path.getsize(output_path) / (1024 * 1024)
                
                if size_mb <= max_size_mb:
                    low = mid + 1  # Try higher quality
                else:
                    high = mid - 1  # Try lower quality
            
            logging.info(f"Compressed {input_path} to {output_path} (Quality: {high}, Size: {size_mb:.2f} MB)")
    
    except Exception as e:
        logging.error(f"Failed to compress {input_path}: {e}")

def batch_compress_images(input_folder, output_folder, max_size_mb=1, quality=85, max_dimensions=None):
    """
    Compresses all images in a folder.
    
    :param input_folder: Folder containing the input images.
    :param output_folder: Folder to save the compressed images.
    :param max_size_mb: Maximum allowed size in MB (default is 1MB).
    :param quality: Initial quality for compression (default is 85).
    :param max_dimensions: Optional tuple (width, height) to resize the images.
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    for filename in os.listdir(input_folder):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif')):
            input_path = os.path.join(input_folder, filename)
            output_path = os.path.join(output_folder, filename)
            compress_image(input_path, output_path, max_size_mb, quality, max_dimensions)

# Example usage
input_folder = "D:/Cursor Projects/Dar-Koftan/public/product_2_imgs(old)"
output_folder = "D:/Cursor Projects/Dar-Koftan/public/products_2_imgs"
max_size_mb = 2  # Target maximum size in MB
initial_quality = 85  # Initial compression quality
max_dimensions = (1200, 1200)  # Optional: Resize images to a maximum of 1200x1200 pixels

batch_compress_images(input_folder, output_folder, max_size_mb, initial_quality, max_dimensions)