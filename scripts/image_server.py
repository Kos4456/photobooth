from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Directory to store uploaded images
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Store the list of uploaded images
uploaded_images = []

# Endpoint to upload an image
@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    # Check if the image already exists
    if file.filename in uploaded_images:
        return jsonify({'message': 'Image already uploaded'}), 200
    
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    
    # Add the image URL to the list (could be a relative URL)
    uploaded_images.append(file.filename)
    return jsonify({'message': 'Image uploaded successfully'}), 200

# Endpoint to check for new images
@app.route('/api/check-for-new-images', methods=['GET'])
def check_for_new_images():
    # Prepare the response with the current list of images
    current_images = uploaded_images.copy()  # Create a copy to return

    # Remove the last image if the list is not empty
    if uploaded_images:
        uploaded_images.pop()  # Remove the last uploaded image

    return jsonify(current_images), 200


if __name__ == '__main__':
    app.run(port=5000)  # Run on port 5000
