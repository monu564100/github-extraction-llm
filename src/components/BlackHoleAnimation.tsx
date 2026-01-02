import { useEffect } from "react";
import "./BlackHoleAnimation.css";

interface BlackHoleAnimationProps {
  progress: number;
  statusText: string;
  repoName?: string;
}

export const BlackHoleAnimation = ({ progress, statusText, repoName }: BlackHoleAnimationProps) => {
  useEffect(() => {
    // Create floating particles
    const blackHole = document.querySelector('.black-hole-container');
    if (!blackHole) return;

    // Clear existing particles
    const existingParticles = blackHole.querySelectorAll('.particle');
    existingParticles.forEach(p => p.remove());

    // Add new particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animation = `float ${2 + Math.random() * 3}s ease-in-out infinite`;
      particle.style.animationDelay = `${Math.random() * 2}s`;
      blackHole.appendChild(particle);
    }
  }, []);

  return (
    <div className="black-hole-wrapper">
      <div className="black-hole-container">
        <div className="black-hole">
          <div className="orbit orbit-1"></div>
          <div className="orbit orbit-2"></div>
          <div className="orbit orbit-3"></div>
          <div className="black-hole-core"></div>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-text">{statusText}</div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-percentage">{progress}%</div>
      </div>

      {repoName && (
        <div className="repo-info-box">
          <div className="repo-name">{repoName}</div>
          <div className="repo-url">https://github.com/{repoName}</div>
        </div>
      )}
    </div>
  );
};
