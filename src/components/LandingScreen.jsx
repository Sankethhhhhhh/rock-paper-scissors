import React from 'react';

export function LandingScreen({ onStart }) {
    return (
        <div className="landing-screen">
            <div className="title-container">
                <h1 className="arcade-title">
                    <span>ROCK</span>
                    <span>PAPER</span>
                    <span>SCISSORS</span>
                </h1>
                <div className="ai-badge">AI POWERED</div>
            </div>
            <button className="start-btn" onClick={onStart}>
                START GAME
            </button>
            <p className="instruction-text">USE YOUR WEBCAM TO PLAY</p>
        </div>
    );
}
