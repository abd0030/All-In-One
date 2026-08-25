import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const TOTAL_FRAMES = 212;

interface ScrollHeroCanvasProps {
  containerRef?: React.RefObject<HTMLElement>;
  onStageChange?: (stage: number) => void;
}

export const ScrollHeroCanvas: React.FC<ScrollHeroCanvasProps> = ({
  containerRef,
  onStageChange,
}) => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Image cache per theme
  const imagesCacheRef = useRef<{ light: (HTMLImageElement | null)[]; dark: (HTMLImageElement | null)[] }>({
    light: new Array(TOTAL_FRAMES).fill(null),
    dark: new Array(TOTAL_FRAMES).fill(null),
  });
  const loadedMapRef = useRef<{ light: boolean[]; dark: boolean[] }>({
    light: new Array(TOTAL_FRAMES).fill(false),
    dark: new Array(TOTAL_FRAMES).fill(false),
  });

  const currentFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const autoPlayTimerRef = useRef<number | null>(null);
  const lastDrawnFrameRef = useRef<number>(-1);
  const activeThemeRef = useRef<'light' | 'dark'>(theme);
  const isAutoPlayingRef = useRef<boolean>(false);
  const lastReportedStageRef = useRef<number>(1);

  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [activeFrameDisplay, setActiveFrameDisplay] = useState<number>(1);

  // Helper: Find nearest loaded frame
  const getNearestLoadedIndex = useCallback((targetIdx: number, t: 'light' | 'dark'): number => {
    const map = loadedMapRef.current[t];
    if (!map) return 0;
    if (map[targetIdx]) return targetIdx;

    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      if (targetIdx - offset >= 0 && map[targetIdx - offset]) {
        return targetIdx - offset;
      }
      if (targetIdx + offset < TOTAL_FRAMES && map[targetIdx + offset]) {
        return targetIdx + offset;
      }
    }
    return 0;
  }, []);

  // Fast, Hardware-Accelerated Single Draw
  const drawFrame = useCallback((frameIdx: number, t?: 'light' | 'dark') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const activeT = t || activeThemeRef.current;
    const safeIdx = getNearestLoadedIndex(frameIdx, activeT);
    const img = imagesCacheRef.current[activeT][safeIdx];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Calculate aspect ratio cover math
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = width / height;

    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawHeight = width / imgRatio;
      offsetY = (height - drawHeight) / 2;
    } else {
      drawWidth = height * imgRatio;
      offsetX = (width - drawWidth) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();
    lastDrawnFrameRef.current = frameIdx;
  }, [getNearestLoadedIndex]);

  // 1. Efficient Chunked Preloader (Fast initial frame + smooth background batching)
  const loadSingleImage = useCallback((index: number, t: 'light' | 'dark'): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const existing = imagesCacheRef.current[t][index];
      if (existing && loadedMapRef.current[t][index]) {
        return resolve(existing);
      }

      const img = new Image();
      const frameNum = String(index + 1).padStart(3, '0');
      img.src = `/frames/${t}/ezgif-frame-${frameNum}.jpg`;

      img.onload = () => {
        imagesCacheRef.current[t][index] = img;
        loadedMapRef.current[t][index] = true;
        if (index === 0 && activeThemeRef.current === t && lastDrawnFrameRef.current === -1) {
          drawFrame(0, t);
        }
        resolve(img);
      };

      img.onerror = () => {
        loadedMapRef.current[t][index] = false;
        resolve(img);
      };
    });
  }, [drawFrame]);

  // Preload frames in chunks so network doesn't choke
  const preloadAllFramesForTheme = useCallback(async (t: 'light' | 'dark') => {
    // 1. Immediately load frame 0 and first 15 frames
    await loadSingleImage(0, t);
    const initialBatch = [];
    for (let i = 1; i < Math.min(15, TOTAL_FRAMES); i++) {
      initialBatch.push(loadSingleImage(i, t));
    }
    await Promise.all(initialBatch);

    // 2. Load the rest in small chunks of 12
    const CHUNK_SIZE = 12;
    for (let i = 15; i < TOTAL_FRAMES; i += CHUNK_SIZE) {
      const chunk = [];
      for (let j = i; j < Math.min(i + CHUNK_SIZE, TOTAL_FRAMES); j++) {
        chunk.push(loadSingleImage(j, t));
      }
      await Promise.all(chunk);
    }
  }, [loadSingleImage]);

  // Keep theme synced & re-draw immediately
  useEffect(() => {
    activeThemeRef.current = theme;
    preloadAllFramesForTheme(theme);
    lastDrawnFrameRef.current = -1;
    drawFrame(Math.round(currentFrameRef.current), theme);
  }, [theme, preloadAllFramesForTheme, drawFrame]);

  // Preload opposite theme in background with gentle delay
  useEffect(() => {
    const opp = theme === 'light' ? 'dark' : 'light';
    const timer = setTimeout(() => {
      preloadAllFramesForTheme(opp);
    }, 1500);
    return () => clearTimeout(timer);
  }, [theme, preloadAllFramesForTheme]);

  // 3. Scroll tracking direct in RAF loop (Zero React Re-renders on parent!)
  useEffect(() => {
    const handleScroll = () => {
      if (isAutoPlayingRef.current) return;

      const container = containerRef?.current || canvasRef.current?.closest('section');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const clientH = window.innerHeight || document.documentElement.clientHeight;
      const scrollable = container.scrollHeight - clientH;
      if (scrollable <= 0) return;

      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
      targetFrameRef.current = progress * (TOTAL_FRAMES - 1);

      // Report stage only when stage changes
      let stage = 1;
      if (progress >= 0.70) {
        stage = 3;
      } else if (progress >= 0.35) {
        stage = 2;
      }

      if (stage !== lastReportedStageRef.current) {
        lastReportedStageRef.current = stage;
        onStageChange?.(stage);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    window.visualViewport?.addEventListener('resize', handleScroll);
    window.visualViewport?.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.visualViewport?.removeEventListener('resize', handleScroll);
      window.visualViewport?.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, onStageChange]);

  // 4. Physics-based Smooth Animation Loop (60fps lock with ultra-smooth lerp)
  useEffect(() => {
    const loop = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.01) {
        currentFrameRef.current += diff * 0.12; // Snappy & silky response
      } else {
        currentFrameRef.current = targetFrameRef.current;
      }

      const frameToDraw = Math.min(
        Math.max(Math.round(currentFrameRef.current), 0),
        TOTAL_FRAMES - 1
      );

      if (frameToDraw !== lastDrawnFrameRef.current) {
        drawFrame(frameToDraw);
        setActiveFrameDisplay(frameToDraw + 1);
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [drawFrame]);

  // 5. Auto-play Toggle
  const toggleAutoPlay = () => {
    const next = !isAutoPlaying;
    setIsAutoPlaying(next);
    isAutoPlayingRef.current = next;

    if (next) {
      autoPlayTimerRef.current = window.setInterval(() => {
        targetFrameRef.current = (targetFrameRef.current + 1) % TOTAL_FRAMES;
      }, 33); // Smooth 30fps auto-play
    } else {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    }
  };

  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      {/* HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover transition-opacity duration-300 opacity-100 dark:opacity-95"
      />

      {/* Floating Interactive Frame Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={toggleAutoPlay}
          className="px-3.5 py-1.5 rounded-full bg-slate-900/85 dark:bg-slate-950/85 hover:bg-slate-800 dark:hover:bg-slate-900 backdrop-blur-xl border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-xl"
          title={isAutoPlaying ? 'Pause Auto Animation' : 'Auto Play 3D Animation'}
        >
          {isAutoPlaying ? (
            <>
              <Pause size={13} className="text-amber-400" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play size={13} className="text-primary-400" />
              <span>Auto Preview</span>
            </>
          )}
        </button>

        {/* Frame Progress & Theme Tag */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/75 dark:bg-slate-950/75 backdrop-blur-xl border border-white/15 text-[11px] font-mono text-slate-200 shadow-xl">
          {theme === 'dark' ? <Moon size={11} className="text-indigo-400" /> : <Sun size={11} className="text-amber-400" />}
          <span>{String(activeFrameDisplay).padStart(3, '0')} / {TOTAL_FRAMES}</span>
        </div>
      </div>
    </div>
  );
};
