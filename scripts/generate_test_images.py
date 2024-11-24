import os
import random
from PIL import Image, ImageDraw, ImageFont
import json

# Path configurations
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_FOLDER = os.path.join(SCRIPT_DIR, '../public/img')  # public/img folder
JSON_PATH = os.path.join(SCRIPT_DIR, '../src/photos.json')

# Constants
NUM_IMAGES = 25  # Define how many images you want to generate
PORTRAIT_SIZE = (1350, 1850)
LANDSCAPE_SIZE = (1850, 1350)
BORDER_COLOR = (0, 0, 255)  # Blue border color
BORDER_WIDTH = 50
CIRCLE_COLOR = (0, 0, 0)  # Black circle color
TEXT_COLOR = (255, 255, 255)  # White text color
CIRCLE_RATIO = 2 / 3  # Circle diameter ratio based on width

font_path = '/usr/share/fonts/truetype/fonts-deva-extra/chandas1-2.ttf'
def create_checkerboard(size, cell_size=50):
    """Create a checkerboard pattern."""
    img = Image.new('RGB', size, (255, 255, 255))
    draw = ImageDraw.Draw(img)
    num_cells_x = size[0] // cell_size
    num_cells_y = size[1] // cell_size

    for y in range(num_cells_y):
        for x in range(num_cells_x):
            if (x + y) % 2 == 0:
                draw.rectangle(
                    [(x * cell_size, y * cell_size), ((x + 1) * cell_size, (y + 1) * cell_size)],
                    fill=(200, 200, 200)
                )
    return img

def add_circle_with_text(draw, img_size, text, is_portrait):
    """Draw a centered circle with text inside."""
    circle_diameter = int(CIRCLE_RATIO * (PORTRAIT_SIZE[0] if is_portrait else LANDSCAPE_SIZE[1]))
    circle_radius = circle_diameter // 2
    center_x, center_y = img_size[0] // 2, img_size[1] // 2
    circle_bbox = [
        center_x - circle_radius, center_y - circle_radius,
        center_x + circle_radius, center_y + circle_radius
    ]
    
    draw.ellipse(circle_bbox, fill=CIRCLE_COLOR)

    # Increment font size until it fits the circle diameter
    font_size = 10
    while True:
        try:
            font = ImageFont.truetype(font_path, font_size)
        except IOError:
            font = ImageFont.load_default()
            print("OHH SHIT ! Font not found, using default.")
            break  # Exit loop if default font is used, since it cannot resize

        # Calculate the bounding box of the text with the current font size
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]

        # Stop increasing font size if it’s about 80% of the circle diameter
        if text_width >= int(0.7 * circle_diameter):
            break
        font_size += 2  # Increment font size gradually

    # Recalculate text bounding box and adjust position to center it in the circle
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    text_position = (center_x - text_width // 2, center_y - text_height // 2 - text_bbox[1])

    # Draw the text with centered position
    draw.text(text_position, text, fill=TEXT_COLOR, font=font)


def create_image(index, is_portrait=True):
    """Generate a single image with a checkerboard pattern, border, and numbered circle."""
    size = PORTRAIT_SIZE if is_portrait else LANDSCAPE_SIZE
    img = create_checkerboard(size)
    draw = ImageDraw.Draw(img)

    # Add blue border
    for i in range(BORDER_WIDTH):
        draw.rectangle(
            [(i, i), (size[0] - i - 1, size[1] - i - 1)],
            outline=BORDER_COLOR
        )

    # Add circle with index number
    add_circle_with_text(draw, size, str(index), is_portrait)

    # Save the image
    img_path = os.path.join(IMG_FOLDER, f'{index:02}.jpg')
    img.save(img_path, 'JPEG')
    print(f"Generated image: {img_path}")
    # update_json(img_path, is_portrait)
    # print(f"Add to the json")


def main():
    """Main function to generate images in the img folder."""
    os.makedirs(IMG_FOLDER, exist_ok=True)

    # Count existing images
    existing_images = [f for f in os.listdir(IMG_FOLDER) if f.endswith('.jpg')]
    existing_count = len(existing_images)

    # Calculate how many images to generate
    images_to_generate = NUM_IMAGES - existing_count
    if images_to_generate <= 0:
        print("No new images required.")
        return

    print(f"Generating {images_to_generate} new images.")

    for i in range(existing_count + 1, NUM_IMAGES + 1):
        is_portrait = random.choice([True, False])
        create_image(i, is_portrait=is_portrait)

def update_json(img_path, is_portrait):
    """Append new image info to the photos.json file."""
    photo_info = {
        "url": os.path.basename(img_path),
        "orientation": "portrait" if is_portrait else "landscape"
    }

    # Load existing data or start with an empty list
    try:
        with open(JSON_PATH, 'r') as f:
            photos = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        photos = []

    # Append new photo info and save
    photos.append(photo_info)
    with open(JSON_PATH, 'w') as f:
        json.dump(photos, f, indent=4)


if __name__ == "__main__":
    main()
