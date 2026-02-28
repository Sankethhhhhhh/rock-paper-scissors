import React, { useRef, useEffect, useState } from 'react';

export function WebcamScanner({ landmarker, onGestureDetected, isActive }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const [cameraReady, setCameraReady] = useState(false);

    // Initialize camera
    useEffect(() => {
        let stream = null;
        if (isActive) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((s) => {
                    stream = s;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.onloadedmetadata = () => {
                            videoRef.current.play();
                            setCameraReady(true);
                        };
                    }
                })
                .catch(err => console.error("Camera access denied", err));
        }

        return () => {
            setCameraReady(false);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, [isActive]);

    const drawHand = (landmarks, ctx, canvas) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!landmarks || landmarks.length === 0) return;

        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 3;
        ctx.fillStyle = '#FF0000';

        landmarks.forEach(hand => {
            // Draw landmarks
            hand.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, 2 * Math.PI);
                ctx.fill();
            });

            const drawLine = (start, end) => {
                ctx.beginPath();
                ctx.moveTo(hand[start].x * canvas.width, hand[start].y * canvas.height);
                ctx.lineTo(hand[end].x * canvas.width, hand[end].y * canvas.height);
                ctx.stroke();
            };

            // Thumb
            drawLine(0, 1); drawLine(1, 2); drawLine(2, 3); drawLine(3, 4);
            // Index
            drawLine(0, 5); drawLine(5, 6); drawLine(6, 7); drawLine(7, 8);
            // Middle
            drawLine(9, 10); drawLine(10, 11); drawLine(11, 12);
            // Ring
            drawLine(13, 14); drawLine(14, 15); drawLine(15, 16);
            // Pinky
            drawLine(17, 18); drawLine(18, 19); drawLine(19, 20);

            // Knuckles
            drawLine(5, 9); drawLine(9, 13); drawLine(13, 17); drawLine(0, 17);
        });
    };

    // Video processing loop
    useEffect(() => {
        let lastVideoTime = -1;
        const renderLoop = () => {
            if (videoRef.current && videoRef.current.readyState >= 2 && landmarker && isActive && cameraReady) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');

                // Match canvas dimensions to video dynamically
                if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
                if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;

                let startTimeMs = performance.now();
                if (video.currentTime !== lastVideoTime) {
                    lastVideoTime = video.currentTime;

                    let results = null;
                    try {
                        results = landmarker.detectForVideo(video, startTimeMs);
                    } catch (e) {
                        console.warn("Detection error: ", e);
                    }

                    if (results && results.landmarks) {
                        drawHand(results.landmarks, ctx, canvas);
                        if (onGestureDetected && results.landmarks.length > 0) {
                            onGestureDetected(results.landmarks);
                        }
                    } else {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }
            }
            requestRef.current = requestAnimationFrame(renderLoop);
        };

        if (isActive) {
            requestRef.current = requestAnimationFrame(renderLoop);
        }

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isActive, landmarker, cameraReady, onGestureDetected]);

    return (
        <div className="webcam-container">
            <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`webcam-video ${isActive ? 'active' : ''}`}
            />
            <canvas
                ref={canvasRef}
                className="webcam-canvas"
            />
            {!cameraReady && isActive && (
                <div className="camera-loading">ACTIVATING CAMERA...</div>
            )}
        </div>
    );
}
