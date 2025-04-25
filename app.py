from flask import Flask, render_template, request
from detect_emotion import detect_emotion_from_image
from moviepy.editor import AudioFileClip

app = Flask(__name__)

emotion_to_song = {
    'happy': 'static/songs/happy.mp3',
    'sad': 'static/songs/sad.mp3',
    'angry': 'static/songs/angry.mp3'
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/detect', methods=['POST'])
def detect():
    
    file = request.files['image']
    file_path = f'static/{file.filename}'
    file.save(file_path)

    emotion = detect_emotion_from_image(file_path)

    song_path = emotion_to_song.get(emotion, None)

    if song_path:
        audio = AudioFileClip(song_path)
        audio.preview()

    return f"Detected Emotion: {emotion}, Song Played: {song_path}"

if __name__ == '__main__':
    app.run(debug=True)
