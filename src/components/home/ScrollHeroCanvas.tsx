import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const TOTAL_FRAMES = 212;

interface ScrollHeroCanvasProps {
  progress?: number; // 0 to 1 progress from parent, optional
  onFrameChange?: (frame: number, progress: number) => void;
}

export const ScrollHeroCanvas: React.FC<ScrollHeroCanvasProps> = ({
  progress: externalProgress,
  onFrameChange,
}) => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Cache for both light and dark image arrays
  const imagesCacheRef = useRef<{ light: HTMLImageElement[]; dark: HTMLImageElement[] }>({
    light: [],
    dark: [],
  });
  const loadedMapRef = useRef<{ light: boolean[]; dark: boolean[] }>({
    light: new Array(TOTAL_FRAMES).fill(false),
    dark: new Array(TOTAL_FRAMES).fill(false),
  });

  const currentFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const autoPlayTimerRef = useRef<number | null>(null);
  const lastDrawnFloatRef = useRef<number>(-1);
  const activeThemeRef = useRef<'light' | 'dark'>(theme);

  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [activeFrameDisplay, setActiveFrameDisplay] = useState<number>(1);
  const [, setForceUpdate] = useState<number>(0);

  // Keep activeThemeRef synced
  useEffect(() => {
    activeThemeRef.current = theme;
    // Re-render current frame immediately on theme change
    lastDrawnFloatRef.current = -1;
    renderSubFrame(currentFrameRef.current);
  }, [theme]);

  // 1. Preload 212 frames for specified theme
  const loadThemeFrames = useCallback((t: 'light' | 'dark') => {
    if (imagesCacheRef.current[t].length === TOTAL_FRAMES) return;

    const loadedImages: HTMLImageElement[] = [];
    const loadedMap = new Array(TOTAL_FRAMES).fill(false);

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `/frames/${t}/ezgif-frame-${frameNum}.jpg`;
      img.loading = 'eager';

      const markLoaded = () => {
        loadedMap[i - 1] = true;
        if (i === 1 && activeThemeRef.current === t) {
          renderSubFrame(currentFrameRef.current);
        }
      };

      img.onload = () => {
        if ('decode' in img && typeof img.decode === 'function') {
          img.decode().then(markLoaded).catch(markLoaded);
        } else {
          markLoaded();
        }
      };
      img.onerror = () => {
        loadedMap[i - 1] = false;
      };

      loadedImages.push(img);
    }

    imagesCacheRef.current[t] = loadedImages;
    loadedMapRef.current[t] = loadedMap;
  }, []);

  // Preload current theme immediately, and then preload the opposite theme
  useEffect(() => {
    loadThemeFrames(theme);

    // After a brief delay, preload the alternate theme in background for instant switching
    const timer = setTimeout(() => {
      loadThemeFrames(theme === 'light' ? 'dark' : 'light');
    }, 1200);

    return () => clearTimeout(timer);
  }, [theme, loadThemeFrames]);

  // Helper: Find nearest loaded frame index if requested frame is still buffering
  const getNearestLoadedIndex = useCallback((targetIdx: number, t: 'light' | 'dark'): number => {
    const map = loadedMapRef.current[t];
    if (!map || map[targetIdx]) return targetIdx;

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

  // Helper: Draw single image with aspect ratio cover math
  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    width: number,
    height: number,
    alpha: number = 1
  ) => {
    if (!img || !img.complete || img.naturalWidth === 0) return;

    ctx.globalAlpha = alpha;
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
  };

  // 2. Liquid-Smooth Dual-Frame Cross-Fade Render (Sub-frame Alpha Blending)
  const renderSubFrame = useCallback((frameFloat: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    const currentTheme = activeThemeRef.current;
    const imagesList = imagesCacheRef.current[currentTheme];
    if (!imagesList || imagesList.length === 0) return;

    const clampedFloat = Math.max(0, Math.min(frameFloat, TOTAL_FRAMES - 1));
    const baseIndex = Math.floor(clampedFloat);
    const nextIndex = Math.min(baseIndex + 1, TOTAL_FRAMES - 1);
    const blendFactor = clampedFloat - baseIndex; // Sub-frame fraction (0.0 to 1.0)

    const safeBaseIdx = getNearestLoadedIndex(baseIndex, currentTheme);
    const safeNextIdx = getNearestLoadedIndex(nextIndex, currentTheme);

    const baseImg = imagesList[safeBaseIdx];
    const nextImg = imagesList[safeNextIdx];

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Draw primary base frame
    if (baseImg) {
      drawImageCover(ctx, baseImg, width, height, 1);
    }

    // Blend next frame with sub-frame alpha for liquid-smooth motion interpolation
    if (blendFactor > 0.01 && safeBaseIdx !== safeNextIdx && nextImg) {
      drawImageCover(ctx, nextImg, width, height, blendFactor);
    }

    ctx.restore();
  }, [getNearestLoadedIndex]);

  // 3. Auto-play loop (slower, cinematic pace through 212 frames)
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayTimerRef.current = window.setInterval(() => {
        targetFrameRef.current = (targetFrameRef.current + 1) % TOTAL_FRAMES;
      }, 35); // ~28-30 fps for 212 frames
    } else {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying]);

  // 4. External scroll progress sync
  useEffect(() => {
    if (isAutoPlaying) return;

    if (externalProgress !== undefined) {
      const targetVal = Math.min(
        Math.max(externalProgress * (TOTAL_FRAMES - 1), 0),
        TOTAL_FRAMES - 1
      );
      targetFrameRef.current = targetVal;
    }
  }, [externalProgress, isAutoPlaying]);

  // 5. Physics-based Smooth Lerp Animation Loop
  useEffect(() => {
    const loop = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.002) {
        currentFrameRef.current += diff * 0.085; // Silky smooth damping
      } else {
        currentFrameRef.current = targetFrameRef.current;
      }

      const curVal = currentFrameRef.current;
      if (Math.abs(curVal - lastDrawnFloatRef.current) > 0.005) {
        renderSubFrame(curVal);
        lastDrawnFloatRef.current = curVal;

        const displayFrame = Math.min(Math.max(Math.round(curVal) + 1, 1), TOTAL_FRAMES);
        setActiveFrameDisplay(displayFrame);
        onFrameChange?.(displayFrame, curVal / (TOTAL_FRAMES - 1));
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [renderSubFrame, onFrameChange]);

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover transition-opacity duration-300 opacity-100 dark:opacity-95"
      />

      {/* Floating Interactive Frame Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="px-3.5 py-1.5 rounded-full bg-slate-900/80 dark:bg-slate-950/80 hover:bg-slate-800 dark:hover:bg-slate-900 backdrop-blur-xl border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-xl"
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
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 dark:bg-slate-950/70 backdrop-blur-xl border border-white/15 text-[11px] font-mono text-slate-200 shadow-xl">
          {theme === 'dark' ? <Moon size={11} className="text-indigo-400" /> : <Sun size={11} className="text-amber-400" />}
          <span>{String(activeFrameDisplay).padStart(3, '0')} / {TOTAL_FRAMES}</span>
        </div>
      </div>
    </div>
  );
};
