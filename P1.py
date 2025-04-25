from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
from fer import FER

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


emotion_to_songs = {
    "happy": ["Happy Song 1", "Happy Song 2", "Happy Song 3"],
    "sad": ["Sad Song 1", "Sad Song 2", "Sad Song 3"],
    "neutral": ["Neutral Song 1", "Neutral Song 2", "Neutral Song 3"],
    "surprise": ["Surprise Song 1", "Surprise Song 2", "Surprise Song 3"],
    "angry": ["Angry Song 1", "Angry Song 2", "Angry Song 3"],
    "disgust": ["Disgust Song 1", "Disgust Song 2", "Disgust Song 3"],
    "fear": ["Fear Song 1", "Fear Song 2", "Fear Song 3"],
}


detector = FER()

def preprocess_and_detect_emotion(image):
   
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

    if len(faces) == 0:
        print("No faces detected.")
        return "neutral"  

    
    (x, y, w, h) = faces[0]
    face = image[y:y + h, x:x + w]

    
    face_rgb = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
    emotions = detector.detect_emotions(face_rgb)

    if not emotions:
        return "neutral"
    emotion, score = detector.top_emotion(face_rgb)
    return emotion if emotion and score >= 0.5 else "neutral"

@app.post("/analyze")
async def analyze_emotion(request: Request):
    try:
        
        data = await request.json()
        image_data = data.get("image", "").split(",")[1]  
        image_bytes = base64.b64decode(image_data)
        image = np.array(Image.open(BytesIO(image_bytes)))

        
        if image.shape[-1] == 4:
            image = cv2.cvtColor(image, cv2.COLOR_RGBA2BGR)

        
        emotion = preprocess_and_detect_emotion(image)

        
        emotion_songs = emotion_to_songs.get(emotion, [])
        return {"detected_emotion": emotion, "songs": emotion_songs}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
