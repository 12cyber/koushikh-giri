import React, { useState, useCallback } from 'react';
import { LabBackgroundCanvas } from './components/LabBackgroundCanvas';
import { SideNavHUD } from './components/SideNavHUD';
import { OpeningExperience } from './components/OpeningExperience';
import { Section1Discovery } from './components/Section1Discovery';
import { Section2LivingSequence } from './components/Section2LivingSequence';
import { Section3Growth } from './components/Section3Growth';
import { Section4BuildTheSpiral } from './components/Section4BuildTheSpiral';
import { Section5GoldenConnection } from './components/Section5GoldenConnection';
import { Section3DPhyllotaxisLab } from './components/Section3DPhyllotaxisLab';
import { SectionFibonacciMusicLab } from './components/SectionFibonacciMusicLab';
import { Section6RealWorldExploration } from './components/Section6RealWorldExploration';
import { Section7FibonacciDetective } from './components/Section7FibonacciDetective';
import { Section8InfiniteWall } from './components/Section8InfiniteWall';
import { FinalExperience } from './components/FinalExperience';
import { FibonacciChatbot } from './components/FibonacciChatbot';
import { ExhibitionMode } from './components/ExhibitionMode';
import { CinematicMovieIntro } from './components/CinematicMovieIntro';
import { AutoScrollController } from './components/AutoScrollController';
import { harmonicAudio } from './utils/harmonicAudio';

export default function App() {
  const [experienceKey, setExperienceKey] = useState<number>(0);
  const [exhibitionMode, setExhibitionMode] = useState<boolean>(false);
  const [showMovieIntro, setShowMovieIntro] = useState<boolean>(true);

  const handleStartDiscovery = () => {
    harmonicAudio.playChime('discover');
    const el = document.getElementById('section-discover');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRestart = useCallback(() => {
    harmonicAudio.playChime('discover');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    setExperienceKey((prev) => prev + 1);
    setShowMovieIntro(true);
  }, []);

  const handleMovieIntroComplete = useCallback(() => {
    setShowMovieIntro(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#020408] text-slate-100 flex flex-col relative selection:bg-cyan-500/30 selection:text-cyan-200 pb-12 md:pb-0">
      {/* Scroll-Locked Cinematic Movie Intro ("GRADE 10 AND 9 PRESENTS" -> "FIBONACCI IN NATURE") */}
      {showMovieIntro && (
        <CinematicMovieIntro
          key={`movie-${experienceKey}`}
          onComplete={handleMovieIntroComplete}
        />
      )}

      {/* Subtle moving mathematical particles and coordinate points with scroll depth parallax */}
      <LabBackgroundCanvas />

      {/* Live Exhibition Presentation Mode (Toggle Button + Fullscreen 10-Stage Slide Deck) */}
      <ExhibitionMode
        isActive={exhibitionMode}
        onToggleMode={() => setExhibitionMode((prev) => !prev)}
      />

      {/* Minimal Side Navigation Indicator & Sound Chimes Toggle */}
      {!exhibitionMode && <SideNavHUD />}

      {/* 60fps Adjustable-Speed Auto-Scroll Director HUD */}
      <AutoScrollController
        disabled={showMovieIntro || exhibitionMode}
        onReplayMovieIntro={handleRestart}
      />

      <main key={experienceKey} className="flex-1 relative z-10">
        {/* Opening Experience: Accelerating numbers forming a spiral */}
        <OpeningExperience
          onStartDiscovery={handleStartDiscovery}
          isIntroActive={showMovieIntro}
          onReplayMovieIntro={handleRestart}
        />

        {/* Stage 01: The Discovery */}
        <Section1Discovery />

        {/* Stage 01B: The Living Sequence Machine */}
        <Section2LivingSequence />

        {/* Stage 02: Proportional Geometric Growth */}
        <Section3Growth />

        {/* Stage 03: Build the Fibonacci Spiral */}
        <Section4BuildTheSpiral />

        {/* Stage 04: The Golden Connection */}
        <Section5GoldenConnection />

        {/* Stage 05: Interactive 3D Golden Ratio & Phyllotaxis Lab */}
        <Section3DPhyllotaxisLab />

        {/* Stage 06: Fibonacci Music & Harmonic Synth Explorer */}
        <SectionFibonacciMusicLab />

        {/* Stage 07: Fibonacci in the Real World */}
        <Section6RealWorldExploration />

        {/* Stage 08: The Fibonacci Detective + Live Booth Leaderboard */}
        <Section7FibonacciDetective />

        {/* Stage 09: The Infinite Wall */}
        <Section8InfiniteWall />
      </main>

      {/* Final Experience & Restart (Re-triggers the Movie Intro) */}
      <FinalExperience onRestart={handleRestart} />

      {/* Interactive Multi-Turn Fibonacci Research Chatbot */}
      <FibonacciChatbot />
    </div>
  );
}

