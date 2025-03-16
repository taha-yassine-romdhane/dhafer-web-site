from PIL import Image, ImageOps
import os

# Function to compress an image while preserving orientation
def compress_image(input_path, output_path, quality=85):
    """
    Compresses an image and saves it to the output path while preserving orientation.

    :param input_path: Path to the input image.
    :param output_path: Path to save the compressed image.
    :param quality: Quality of the compressed image (1-100). Default is 85.
    """
    try:
        # Open the image
        with Image.open(input_path) as img:
            # Fix orientation using EXIF data
            img = ImageOps.exif_transpose(img)
            
            # Convert to RGB if the image is in a different mode (e.g., RGBA)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Save the compressed image
            img.save(output_path, 'JPEG', quality=quality, optimize=True)
            print(f"Compressed: {input_path} -> {output_path} (Quality: {quality})")
    except Exception as e:
        print(f"Error compressing {input_path}: {e}")

# Function to compress all images in a folder
def compress_images_in_folder(folder_path, output_folder, quality=85):
    """
    Compresses all images in a folder and saves them to the output folder.

    :param folder_path: Path to the folder containing images.
    :param output_folder: Path to save the compressed images.
    :param quality: Quality of the compressed images (1-100). Default is 85.
    """
    # Create the output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Iterate over all files in the folder
    for filename in os.listdir(folder_path):
        # Check if the file is an image
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif')):
            input_path = os.path.join(folder_path, filename)
            output_path = os.path.join(output_folder, filename)
            
            # Compress the image
            compress_image(input_path, output_path, quality)

# Example usage
if __name__ == "__main__":
    # Path to the folder containing images
    input_folder = "public"
    
    # Path to save the compressed images
    output_folder = "public/products"
    
    # Quality of the compressed images (1-100)
    quality = 85  # Adjust this value as needed (higher = better quality, larger file size)
    
    # Compress all images in the folder
    compress_images_in_folder(input_folder, output_folder, quality)