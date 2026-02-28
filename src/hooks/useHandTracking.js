import { useState, useEffect, useRef } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export function useHandTracking() {
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const handLandmarkerRef = useRef(null);
    const loadingRef = useRef(false);

    useEffect(() => {
        let isMounted = true;
        async function initializeHandTracking() {
            if (handLandmarkerRef.current || loadingRef.current) return;
            loadingRef.current = true;
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
                );
                const landmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 1
                });
                if (isMounted) {
                    handLandmarkerRef.current = landmarker;
                    setIsModelLoaded(true);
                } else {
                    landmarker.close();
                }
            } catch (error) {
                console.error("Error loading hand landmarker:", error);
            } finally {
                loadingRef.current = false;
            }
        }

        initializeHandTracking();

        return () => {
            isMounted = false;
            // In strict mode, component unmounts and remounts immediately.
            // Closing immediately might cause issues, but for MediaPipe we should release memory.
            if (handLandmarkerRef.current) {
                handLandmarkerRef.current.close();
                handLandmarkerRef.current = null;
                setIsModelLoaded(false);
            }
        };
    }, []);

    const detectGesture = (landmarks) => {
        if (!landmarks || landmarks.length === 0) return null;

        const hand = landmarks[0];

        // Y coords increment downward. extended means tip is higher (y is smaller) than pip
        const isExtended = (tip, pip) => hand[tip].y < hand[pip].y;

        const indexExtended = isExtended(8, 6);
        const middleExtended = isExtended(12, 10);
        const ringExtended = isExtended(16, 14);
        const pinkyExtended = isExtended(20, 18);

        // Thumb is trickier since it moves horizontally, check X and Y distance or just simplified
        // Standard approach: tip moves further from wrist than mcp
        // We'll rely mostly on the 4 fingers for RPS

        // Rock: all fingers folded
        if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
            return 'ROCK';
        }

        // Paper: all fingers extended
        if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
            return 'PAPER';
        }

        // Scissors: index and middle extended, ring and pinky folded
        if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
            return 'SCISSORS';
        }

        return null; // Transition or unknown
    };

    return { isModelLoaded, handLandmarkerRef, detectGesture };
}
