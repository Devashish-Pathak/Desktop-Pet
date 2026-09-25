import { evaluateExpression } from './reactions.js';

const CHECK_INTERVAL_MS = 2 * 60 * 1000; // ~2 minutes, per the user's choice
const INITIAL_DELAY_MS = 5000; // let the window/models settle before the first check
const CAMERA_WARMUP_MS = 600; // let the camera produce a real frame before detecting

let previousExpression = null;
let modelsReady = false;

const video = document.createElement('video');
video.autoplay = true;
video.muted = true;
video.playsInline = true;
video.width = 320;
video.height = 240;
document.body.appendChild(video);

async function loadModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
  await faceapi.nets.faceExpressionNet.loadFromUri('./models');
  modelsReady = true;
  console.log('mood camera: models loaded');
}

async function checkOnce() {
  if (!modelsReady) return;

  let stream = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
  } catch (err) {
    console.log('mood camera: camera unavailable —', err.message);
    return;
  }

  try {
    video.srcObject = stream;
    await video.play();
    await new Promise((resolve) => setTimeout(resolve, CAMERA_WARMUP_MS));

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (!detection || !detection.expressions) {
      console.log('mood camera: no face detected this check');
      return;
    }

    const { reaction, nextExpression } = evaluateExpression(detection.expressions, previousExpression);
    previousExpression = nextExpression;
    if (reaction) {
      window.moodcamAPI.reportReaction(reaction);
    }
  } catch (err) {
    console.log('mood camera: detection error —', err.message);
  } finally {
    // Always release the camera between checks — the OS camera-in-use
    // indicator only lights up for the brief moment of each check, not
    // continuously for as long as this feature is enabled.
    stream.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  }
}

loadModels()
  .then(() => {
    setTimeout(checkOnce, INITIAL_DELAY_MS);
    setInterval(checkOnce, CHECK_INTERVAL_MS);
  })
  .catch((err) => {
    console.log('mood camera: failed to load models —', err.message);
  });
