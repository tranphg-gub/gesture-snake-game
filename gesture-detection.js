// This file handles hand gesture detection using TensorFlow.js
// Integration with webcam feed

let detector = null;
let video = null;
let canvas = null;
let ctx = null;

async function initializeGestureDetection() {
    try {
        // Load the hand pose detection model
        const model = await handPoseDetection.SupportedModels.MediaPipe;
        const detectorConfig = {
            runtime: 'tfjs',
            modelType: 'full'
        };

        detector = await handPoseDetection.createDetector(model, detectorConfig);
        console.log('Hand pose detector initialized');

        // Request webcam access
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 }
        });

        if (!video) {
            video = document.createElement('video');
            video.style.display = 'none';
        }
        video.srcObject = stream;
        video.play();

        // Start detection loop
        detectGestures();
    } catch (error) {
        console.error('Error initializing gesture detection:', error);
    }
}

async function detectGestures() {
    if (!detector) return;

    const hands = await detector.estimateHands(video);

    if (hands.length > 0) {
        const hand = hands[0];
        const gesture = recognizeGesture(hand.keypoints);
        if (gesture) {
            onGestureDetected(gesture);
        }
    }

    requestAnimationFrame(detectGestures);
}

function recognizeGesture(keypoints) {
    // Get relevant finger positions
    const thumbTip = keypoints[4];      // Thumb
    const indexTip = keypoints[8];      // Index finger
    const middleTip = keypoints[12];    // Middle finger
    const ringTip = keypoints[16];      // Ring finger
    const pinkyTip = keypoints[20];     // Pinky

    const palmBase = keypoints[0];      // Wrist

    // Thumb up (Y decreasing)
    if (thumbTip.y < palmBase.y - 50 && thumbTip.x > palmBase.x - 30 && thumbTip.x < palmBase.x + 30) {
        return 'up';
    }

    // Thumb down (Y increasing)
    if (thumbTip.y > palmBase.y + 50 && thumbTip.x > palmBase.x - 30 && thumbTip.x < palmBase.x + 30) {
        return 'down';
    }

    // Thumb left (X decreasing)
    if (thumbTip.x < palmBase.x - 50 && thumbTip.y > palmBase.y - 30 && thumbTip.y < palmBase.y + 30) {
        return 'left';
    }

    // Thumb right (X increasing)
    if (thumbTip.x > palmBase.x + 50 && thumbTip.y > palmBase.y - 30 && thumbTip.y < palmBase.y + 30) {
        return 'right';
    }

    return null;
}