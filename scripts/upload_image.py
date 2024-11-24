import requests
import os
import time
# Path configurations
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_FOLDER = os.path.join(SCRIPT_DIR, '../public/backup_img')  # public/img folder


def send_new_image(image_file_path):
    """Send a new image to the server."""
    url = 'http://localhost:5000/api/upload-image'  # Adjust the endpoint as necessary
    files = {'image': open(image_file_path, 'rb')}  # Open the image file in binary mode

    try:
        response = requests.post(url, files=files)  # Send the POST request with the image file
        response.raise_for_status()  # Raise an error for HTTP error codes
        
        result = response.json()  # Parse the response as JSON
        print('Image uploaded successfully:', result)
    except requests.exceptions.HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')
    except Exception as err:
        print(f'An error occurred: {err}')
    finally:
        files['image'].close()  # Close the file to free resources

# Main function to call send_new_image every 5 seconds
def main():
    for i in range(1, 26):  # Loop from 01 to 25
        image_path = f"{IMG_FOLDER}/{i:02}.jpg"  # Format image name with leading zeros
        send_new_image(image_path)
        print(f"Status: Sent image {i:02}.jpg")  # Print status
        time.sleep(5)  # Wait for 5 seconds

    print("All images have been sent.")

# Run the main function
if __name__ == "__main__":
    main()