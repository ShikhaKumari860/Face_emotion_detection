from deepface import DeepFace

def detect_emotion_from_image(img_path):
    result = DeepFace.analyze(img_path=img_path, actions=['emotion'])
    dominant_emotion = result[0]['dominant_emotion']
    return dominant_emotion
