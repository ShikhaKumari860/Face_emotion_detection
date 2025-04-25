const webcam = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const emotionResult = document.getElementById("emotion-result");
const detectedEmotion = document.getElementById("detected-emotion");
const songRecommendations = document.getElementById("song-recommendations");
const songsList = document.getElementById("songs-list");

const emotionToSongs = {
    happy: [
        "8MYdve75LWg",  
        "MMb2mSWtuiw",
        "7BWigLk4bXI"   
    ],

    sad: [
        "aZhxgMLo7Ho",  
        "cEpIcwgC4-k",
        "vPChOUDttow"  
    ],

    neutral: [
        "vAlaUgfIDug",  
        "Qz7FKUX65lc",
        "pmDv1Gxvvdo"   
    ], 

    surprise: [
        "dXyyl9kNUBg",
        "qMNkuqYE3B8",
        "q-WDKfafy5Y"
    ],

    angry: [
        "VAJK04HOLd0",
        "jFGKJBPFdUA",
        "BiVyN2ftrrs"
    ],

    fear: [
        "Ngs2Y8VwhBY",
        "52FDBNDhx4c",
        "q5hSGt0wDWo"
    ],

    disgust: [
        "lGwDtkK6ZFY",
        "83AOwdfH1Z0",
        "otvIIDWCweo"
    ]
};

document.getElementById("start-webcam").addEventListener("click", async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcam.srcObject = stream;
        webcam.play();
    } catch (err) {
        alert("Webcam access denied or not available.");
    }
});

document.getElementById("analyze-emotion").addEventListener("click", () => {
    
    canvas.width = webcam.videoWidth;
    canvas.height = webcam.videoHeight;
    ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);

    
    const imageData = canvas.toDataURL();
    analyzeEmotion(imageData);
});

async function analyzeEmotion(imageData) {
    try {
        const response = await fetch("http://127.0.0.1:8006/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imageData }),
        });

        const result = await response.json();

        if (response.ok) {
            displayResults(result.detected_emotion);
        } else {
            console.error(result.error);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

function displayResults(emotion) {
    emotionResult.hidden = false;
    detectedEmotion.textContent = emotion;
   
    const emojiMap = {
        happy: "😊",
        sad: "😢",
        angry: "😠",
        fear: "😨",
        neutral: "😐",
        surprise: "😲",
        disgust: "🤢"
    };

    const leftEmoji = document.getElementById("emoji-left");
    const rightEmoji = document.getElementById("emoji-right");
    const emoji = emojiMap[emotion] || "🙂";

    leftEmoji.textContent = emoji;
    rightEmoji.textContent = emoji;
 
    songRecommendations.hidden = false;
    songsList.innerHTML = "";  

    const songs = emotionToSongs[emotion] || ["No songs available for this emotion."];
     
    songs.forEach(songId => {
        const li = document.createElement("li");
        li.textContent = `Song ID: ${songId}`;
        li.addEventListener("click", () => playSong(songId));  
        songsList.appendChild(li);
    });
}

function playSong(songId) {
    const youtubePlayer = document.getElementById("youtube-player");
    youtubePlayer.innerHTML = "";  

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${songId}`;
    iframe.frameborder = "0";
    iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowfullscreen = true;

    youtubePlayer.appendChild(iframe);  
}
