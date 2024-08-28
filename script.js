const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const playBtn = document.getElementById('playBtn');
const voiceSelect = document.getElementById('voiceSelect');
const timerDisplay = document.getElementById('timer');
const playback = document.getElementById('playback');
const feedback = document.getElementById('feedback');

let mediaRecorder;
let audioChunks = [];
let audioBlob;
let recordingInterval;
let seconds = 0;
let minutes = 0;

// Start recording
recordBtn.addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            audioChunks = [];

            recordBtn.disabled = true;
            stopBtn.disabled = false;
            playBtn.disabled = true;

            feedback.textContent = ""; // Clear previous feedback
            startTimer();

            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener("stop", () => {
                audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                playback.src = URL.createObjectURL(audioBlob);
                playBtn.disabled = false;
                feedback.textContent = "You upload right!"; // Feedback message
            });
        })
        .catch(err => console.error("Microphone access error:", err));
});

// Stop recording
stopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        stopBtn.disabled = true;
        recordBtn.disabled = false;
        stopTimer();
    }
});

// Play the recorded voice with selected effect
playBtn.addEventListener('click', () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const reader = new FileReader();

    reader.onloadend = () => {
        audioContext.decodeAudioData(reader.result, buffer => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;

            const voiceEffect = voiceSelect.value;
            const gainNode = audioContext.createGain();

            // Apply voice effects based on selection
            switch (voiceEffect) {
                case 'male':
                    source.playbackRate.value = 0.9; // Lower pitch slightly
                    break;
                case 'female':
                    source.playbackRate.value = 1.3; // Raise pitch slightly
                    break;
                case 'robot':
                    source.playbackRate.value = 1.0;
                    const robotFilter = audioContext.createBiquadFilter();
                    robotFilter.type = "bandpass";
                    robotFilter.frequency.value = 1000;
                    robotFilter.Q.value = 10;
                    source.connect(robotFilter).connect(gainNode);
                    break;
                case 'ghost':
                    source.playbackRate.value = 0.6; // Lower pitch significantly
                    break;
                case 'cartoon':
                    source.playbackRate.value = 1.8; // Very high pitch
                    break;
                case 'high_pitch':
                    source.playbackRate.value = 2.0; // Even higher pitch
                    break;
                case 'barbie':
                    source.playbackRate.value = 1.5; // High pitch, like Barbie
                    break;
                default:
                    source.playbackRate.value = 1.0; // Normal pitch
            }

            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            source.start();
            feedback.textContent = "You do task right"; // Feedback message
        });
    };

    reader.readAsArrayBuffer(audioBlob);
});

// Timer function to track recording time
function startTimer() {
    seconds = 0;
    minutes = 0;
    timerDisplay.textContent = "00:00";

    recordingInterval = setInterval(() => {
        seconds++;
        if (seconds === 60) {
            minutes++;
            seconds = 0;
        }

        if (minutes === 1) {
            mediaRecorder.stop();  // Stop recording after 1 minute
            stopBtn.disabled = true;
            recordBtn.disabled = false;
            stopTimer();
        }

        timerDisplay.textContent = `${formatTime(minutes)}:${formatTime(seconds)}`;
    }, 1000);
}

// Stop the timer
function stopTimer() {
    clearInterval(recordingInterval);
}

// Format time display as MM:SS
function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}
