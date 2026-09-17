document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const videoElement = document.getElementById('input_video');
    const canvasElement = document.getElementById('output_canvas');
    const canvasCtx = canvasElement.getContext('2d');
    
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const systemStatus = document.getElementById('system-status');
    const statusDot = document.querySelector('.status-dot');
    const gestureText = document.getElementById('gesture-text');
    
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    const slideCounter = document.getElementById('slide-counter');
    
    // Presentation State
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    
    // Gesture Cooldown State
    let lastActionTime = 0;
    const COOLDOWN_MS = 1000; // 1 second between gestures
    
    let camera = null;
    let hands = null;

    // --- Slide Navigation ---
    function updateSlides() {
        slides.forEach((slide, index) => {
            if (index === currentSlide) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        slideCounter.textContent = ${currentSlide + 1} / ;
    }

    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateSlides();
            triggerUIEffect('next');
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlides();
            triggerUIEffect('prev');
        }
    }

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    function triggerUIEffect(direction) {
        // Visual feedback on the panel
        const panel = document.querySelector('.slides-container');
        panel.style.boxShadow = direction === 'next' 
            ? 'inset 0 0 50px rgba(0, 255, 204, 0.5)'
            : 'inset 0 0 50px rgba(255, 0, 85, 0.5)';
        setTimeout(() => {
            panel.style.boxShadow = 'inset 0 0 50px rgba(0,0,0,0.8)';
        }, 300);
    }

    // --- MediaPipe Hand Tracking ---
    
    function isFingersUp(landmarks) {
        const tips = [4, 8, 12, 16, 20];
        let fingers = [];

        // Thumb (horizontal)
        // Note: x-axis might be inverted depending on camera flip. 
        // In original code: landmark[4].x < landmark[3].x
        if (landmarks[tips[0]].x < landmarks[tips[0] - 1].x) {
            fingers.push(1);
        } else {
            fingers.push(0);
        }

        // Other fingers (vertical)
        for (let i = 1; i < tips.length; i++) {
            let tip = tips[i];
            if (landmarks[tip].y < landmarks[tip - 2].y) {
                fingers.push(1);
            } else {
                fingers.push(0);
            }
        }
        return fingers;
    }

    function onResults(results) {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        
        let gestureDetected = false;

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            for (const landmarks of results.multiHandLandmarks) {
                drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#00ffcc', lineWidth: 2});
                drawLandmarks(canvasCtx, landmarks, {color: '#ff0055', lineWidth: 1, radius: 2});
                
                const fingers = isFingersUp(landmarks);
                const count = fingers.reduce((a, b) => a + b, 0);
                
                const now = Date.now();
                
                if (count === 5) {
                    gestureText.textContent = "OPEN PALM: NEXT";
                    gestureText.style.color = "var(--accent-primary)";
                    gestureDetected = true;
                    
                    if (now - lastActionTime > COOLDOWN_MS) {
                        nextSlide();
                        lastActionTime = now;
                    }
                } else if (count === 0) {
                    gestureText.textContent = "FIST: PREVIOUS";
                    gestureText.style.color = "var(--accent-danger)";
                    gestureDetected = true;
                    
                    if (now - lastActionTime > COOLDOWN_MS) {
                        prevSlide();
                        lastActionTime = now;
                    }
                }
            }
        }
        
        if (!gestureDetected) {
            gestureText.textContent = "Awaiting Input...";
            gestureText.style.color = "var(--text-dim)";
        }
        
        canvasCtx.restore();
    }

    // --- Control Logic ---

    async function initializeSystem() {
        startBtn.disabled = true;
        systemStatus.textContent = "INITIALIZING...";
        gestureText.textContent = "Loading Models...";
        
        hands = new Hands({locateFile: (file) => {
            return https://cdn.jsdelivr.net/npm/@mediapipe/hands/;
        }});
        
        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });
        
        hands.onResults(onResults);
        
        camera = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({image: videoElement});
            },
            width: 320,
            height: 240
        });
        
        await camera.start();
        
        systemStatus.textContent = "SYSTEM ONLINE";
        statusDot.classList.add('active');
        stopBtn.disabled = false;
    }

    function terminateSystem() {
        if (camera) {
            camera.stop();
        }
        if (hands) {
            hands.close();
        }
        
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        systemStatus.textContent = "SYSTEM OFFLINE";
        statusDot.classList.remove('active');
        startBtn.disabled = false;
        stopBtn.disabled = true;
        gestureText.textContent = "Awaiting Input...";
    }

    startBtn.addEventListener('click', initializeSystem);
    stopBtn.addEventListener('click', terminateSystem);
    
    // Init slides view
    updateSlides();
});
