import React, { useState, useEffect, useRef } from 'react';
import { useHandTracking } from '../hooks/useHandTracking';
import { WebcamScanner } from './WebcamScanner';
import { LandingScreen } from './LandingScreen';
import { RefreshCw } from 'lucide-react';

export function RPSArcadeGame() {
  const { isModelLoaded, handLandmarkerRef, detectGesture } = useHandTracking();

  // Game States: 'landing', 'countdown', 'detecting', 'result'
  const [gameState, setGameState] = useState('landing');
  const [countdown, setCountdown] = useState(3);
  const [aiMove, setAiMove] = useState(null);
  const [playerMove, setPlayerMove] = useState(null);
  const [result, setResult] = useState(null);
  const [scores, setScores] = useState({ player: 0, ai: 0 });

  const lastLandmarksRef = useRef(null);
  const detectionTimeoutRef = useRef(null);

  const handleStart = () => {
    setGameState('countdown');
    setCountdown(3);
    setAiMove(null);
    setPlayerMove(null);
    setResult(null);
  };

  const handleGestureDetected = (landmarks) => {
    lastLandmarksRef.current = landmarks;
  };

  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState('detecting');
        const moves = ['ROCK', 'PAPER', 'SCISSORS'];
        setAiMove(moves[Math.floor(Math.random() * moves.length)]);
      }
    }
  }, [gameState, countdown]);

  useEffect(() => {
    if (gameState === 'detecting') {
      let attempts = 0;
      const attemptDetection = () => {
        if (lastLandmarksRef.current) {
          const gesture = detectGesture(lastLandmarksRef.current);
          if (gesture) {
            finishRound(gesture);
            return;
          }
        }

        attempts++;
        if (attempts < 15) { // 1.5s total (100ms * 15)
          detectionTimeoutRef.current = setTimeout(attemptDetection, 100);
        } else {
          setPlayerMove('UNKNOWN');
          setResult('lose');
          setGameState('result');
        }
      };

      attemptDetection();

      return () => {
        if (detectionTimeoutRef.current) clearTimeout(detectionTimeoutRef.current);
      };
    }
  }, [gameState, detectGesture]);

  const finishRound = (pMove) => {
    setPlayerMove(pMove);
    setGameState('result');
  };

  useEffect(() => {
    if (gameState === 'result' && playerMove && aiMove && playerMove !== 'UNKNOWN') {
      let winState = 'draw';
      if (
        (playerMove === 'ROCK' && aiMove === 'SCISSORS') ||
        (playerMove === 'PAPER' && aiMove === 'ROCK') ||
        (playerMove === 'SCISSORS' && aiMove === 'PAPER')
      ) {
        winState = 'win';
      } else if (playerMove !== aiMove) {
        winState = 'lose';
      }

      setResult(winState);
      setScores(prev => ({
        player: prev.player + (winState === 'win' ? 1 : 0),
        ai: prev.ai + (winState === 'lose' ? 1 : 0)
      }));
    }
  }, [gameState, playerMove, aiMove]);

  // Handle auto-restart
  useEffect(() => {
    let nextRoundTimer;
    if (gameState === 'result') {
      nextRoundTimer = setTimeout(() => {
        handleStart();
      }, 3000);
    }
    return () => {
      if (nextRoundTimer) clearTimeout(nextRoundTimer);
    }
  }, [gameState]);


  if (gameState === 'landing') {
    return <LandingScreen onStart={handleStart} />;
  }

  return (
    <div className="game-screen">
      <div className="header-panel">
        <div className="score-board">
          <div className="score-box user-score">
            <span>PLAYER</span>
            <h2>{scores.player}</h2>
          </div>
          <div className="score-box vs">VS</div>
          <div className="score-box ai-score">
            <span>AI</span>
            <h2>{scores.ai}</h2>
          </div>
        </div>
      </div>

      <div className="split-view">
        <div className="view-panel player-panel">
          <h3>PLAYER CAM</h3>
          <div className="video-container">
            <WebcamScanner
              landmarker={handLandmarkerRef.current}
              onGestureDetected={handleGestureDetected}
              isActive={gameState !== 'landing'}
            />
            {gameState === 'countdown' && (
              <div className="overlay countdown-overlay">
                <span className="countdown-number">{countdown}</span>
              </div>
            )}
            {gameState === 'detecting' && (
              <div className="overlay detecting-overlay">
                <span>DETECTING...</span>
              </div>
            )}
            {result && (
              <div className={`overlay result-overlay ${result}`}>
                <span>{result === 'win' ? 'YOU WIN!' : result === 'lose' ? 'AI WINS!' : 'DRAW!'}</span>
                {playerMove !== 'UNKNOWN' && <div className="move-label">{playerMove}</div>}
                {playerMove === 'UNKNOWN' && <div className="move-label">GIVE A CLEAR GESTURE!</div>}
              </div>
            )}
          </div>
        </div>

        <div className="view-panel ai-panel">
          <h3>AI OPPONENT</h3>
          <div className="ai-container">
            {gameState === 'countdown' ? (
              <div className="ai-thinking">
                <RefreshCw className="spin-icon" size={64} />
                <p>THINKING...</p>
              </div>
            ) : aiMove ? (
              <div className="ai-move-display">
                <div className={`move-badge ${aiMove.toLowerCase()}`}>
                  {aiMove}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}