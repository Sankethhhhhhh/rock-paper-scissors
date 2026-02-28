# AI Rock Paper Scissors (Camera-Based)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-00A2FF?style=for-the-badge&logo=google&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

A production-grade, interactive React + Vite web application that allows users to play Rock Paper Scissors using real-time webcam hand gesture detection. 

The application utilizes Google's MediaPipe Tasks Vision to perform efficient on-device frame analysis, detecting and identifying hand landmarks to derive gestures (Rock, Paper, or Scissors) to compete against an AI opponent in a retro, arcade-style interface.

## 🎯 Core Features

- **Real-Time Webcam Tracking:** Live video feed rendering with WebRTC (`getUserMedia`).
- **MediaPipe HandLandmarker Integration:** High-performance, low-latency hand landmark detection running directly in the browser via WebAssembly (WASM).
- **Gesture Detection System:** Geometric logic parsing 3D hand landmarks into standard game moves (ROCK / PAPER / SCISSORS).
- **AI Opponent Engine:** Randomized move generation linked to an automated game state cycle.
- **Arcade User Interface:** Animated overlays, score tracking, split-screen displays, and a 3–2–1 synchronous countdown sequence.
- **Production Resilience:** Auto next-round resets, rigorous React `useEffect` cleanups, strict memory management to prevent leaks, and `cancelAnimationFrame` safeguards.

---

## 🧠 Technical Implementation

### Hand Landmark Detection (MediaPipe Tasks Vision)
The application leverages the `@mediapipe/tasks-vision` SDK loaded via WebAssembly to bypass server-side processing. The `HandLandmarker` model analyzes the HTML `<video>` stream, outputting 21 distinct 3D landmarks for each detected hand per frame.

### Video-Canvas Synchronization
To accurately draw connection lines and joints over the user's hand, the application stacks an HTML5 `<canvas>` directly over the `<video>` element. The system actively syncs the canvas resolution (`canvas.width` / `canvas.height`) to the native `video.videoWidth` and `video.videoHeight` dynamically to prevent bounding box desynchronization regardless of the viewport or camera aspect ratio.

### Gesture Detection Logic
The core logic evaluates the vertical extension of the four main fingers (Index, Middle, Ring, Pinky) by comparing the Y-coordinates of the fingertip landmarks against their corresponding PIP (Proximal Interphalangeal) joints. 
- **ROCK:** All four fingers are considered "folded" (Tip Y > PIP Y).
- **PAPER:** All four fingers are "extended" (Tip Y < PIP Y).
- **SCISSORS:** Index and Middle are extended, while Ring and Pinky are folded.

### Game State & AI Logic
A React state machine controls the game flow: `landing` → `countdown` (3s timer) → `detecting` (brief sub-second window invoking the gesture logic) → `result` (Win/Loss/Draw calculated) → `countdown`. During the `countdown` phase, the AI opponent computes a random cryptographic selection of `['ROCK', 'PAPER', 'SCISSORS']` and waits for chronological alignment with the user's gesture evaluation.

---

## 🏗 Tech Stack

- **React Element Framework:** Functional Components, Custom Hooks (`useState`, `useEffect`, `useRef`)
- **Build Tooling:** Vite
- **Computer Vision:** MediaPipe Tasks Vision
- **Language:** JavaScript (ES6+)
- **Rendering & Multimedia:** HTML5 Canvas, `<video>`, CSS3 Animations
- **Browser APIs:** WebRTC / MediaDevices API (`getUserMedia`), `requestAnimationFrame`

---

## 📂 Project Structure

```text
src/
├── components/
│   ├── LandingScreen.jsx      # Initial startup UI
│   ├── RPSArcadeGame.jsx      # Main game state orchestrator and UI
│   └── WebcamScanner.jsx      # Video/Canvas sync and MediaPipe renderer
├── hooks/
│   └── useHandTracking.js     # MediaPipe HandLandmarker initialization and gesture math
├── App.jsx                    # Root component
├── main.jsx                   # React DOM entry point
└── index.css                  # Global arcade styling and keyframes
```

---

## ⚙️ Installation Instructions

Ensure you have Node.js (v18+) installed.

```bash
# Clone the repository
git clone https://github.com/your-username/rps-ai-game.git

# Navigate into the project directory
cd rps-ai-game

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

### Production Build
To create an optimized production build:
```bash
npm run build
```

---

## 🌐 Deployment

The application is optimized for deployment on platforms like Netlify or Vercel. 
> **Important:** Browsers rigidly enforce secure contexts for webcam access. **HTTPS is strictly required** for the `getUserMedia` API to function if not running locally on `localhost`.

---

## 🛠 Challenges & Learnings

- **WASM Loading & Race Conditions:** Managing asynchronous loading states between the MediaPipe WebAssembly files and React's component mounting lifecycle required creating dedicated `useRef` locks.
- **Canvas + Video Synchronization:** Solving the coordinate mapping discrepancy when the CSS viewport dimensions differed from the native hardware camera resolution.
- **Gesture Accuracy Tuning:** Finding the mathematical threshold between a relaxed hand and an "extended" finger coordinate strictly on the Y-axis without over-engineering complex vector angles.
- **Strict Cleanup & Memory Management:** Ensuring camera tracks are explicitly stopped with `track.stop()` and MediaPipe instances are cleanly closed (`landmarker.close()`) to prevent `abort(OOM)` WASM panics during React's Strict Mode unmount/remount cycles.

---

## 📈 Future Improvements

- **Adaptive AI:** Replace the random move generator with a Markov chain or frequency-based predictive model that learns the player's historic gesture patterns to counter them.
- **Confidence Visualization:** Expose the MediaPipe confidence score to the UI to aid user positioning.
- **Analytics Dashboard:** Session-based win/loss ratio graphs and gesture frequency tracking.
- **Multiplayer Mode:** WebSockets implementation for peer-to-peer remote play.
- **PWA Support:** Service workers for offline capabilities and mobile home-screen installation.

---

## 🧑‍💻 Author

**Built by [Your Name]**  
*AIML Student*  
*Focused on AI-driven interactive systems and production-ready machine learning web interfaces.*
