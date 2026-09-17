# Gesture Presentation Web

A web-based evolution of the Gesture Presentation project. This application allows you to control a presentation right in your browser using hand gestures (via your webcam), processed entirely on the client side using MediaPipe. 

No local PowerPoint installation is required, making it perfect for demonstrating the computer vision concepts to HR or interviewers via a simple web link!

## Gestures
- **Open Palm (5 fingers)**: Next Slide
- **Fist (0 fingers)**: Previous Slide

## Running Locally

1. Install Python 3
2. Install dependencies:
   `ash
   pip install -r requirements.txt
   `
3. Run the Flask server:
   `ash
   python app.py
   `
4. Open your browser and go to http://localhost:5000
5. Click **INITIALIZE** and grant webcam permissions to test the gestures.

## Render Deployment Instructions

Since this uses a Flask web server, it is ready to be deployed to Render.com.

1. Create a GitHub repository (e.g., gesture-presentation-web) and push all these files to it.
2. Log in to [Render.com](https://render.com).
3. Click **New +** and select **Web Service**.
4. Connect the GitHub repository you just created.
5. Fill in the deployment settings:
   - **Name**: gesture-presentation-web (or any available name)
   - **Environment**: Python 3
   - **Build Command**: pip install -r requirements.txt
   - **Start Command**: gunicorn app:app
6. Click **Create Web Service**.
7. Render will build and deploy the app. Once it says "Live", click the provided https://...onrender.com URL to view your presentation!

> **Note on Permissions:** Web browsers require HTTPS or localhost to access the webcam. Render automatically provides an HTTPS URL, so it will work perfectly online.
