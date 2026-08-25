import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

const TOTAL_FRAMES = 50;

interface ScrollHeroCanvasProps {
  progress?: number; // 0 to 1 progress from parent, optional
  onFrameChange?: (frame: number, progress: number) => void;
}

export const ScrollHeroCanvas: React.FC<ScrollHeroCanvasProps> = ({
  progress: externalProgress,
  onFrameChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const autoPlayTimerRef = useRef<number | null>(null);

  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [activeFrameDisplay, setActiveFrameDisplay] = useState<number>(1);

  // 1. Preload all 50 frames
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let count = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `/frames/ezgif-frame-${frameNum}.jpg`;
      img.onload = () => {
        count++;
        setLoadedCount(count);
        if (i === 1 && canvasRef.current) {
          renderFrame(0);
        }
      };
      loadedImages.push(img);
    }

    imagesRef.current = loadedImages;

    return () => {
      imagesRef.current = [];
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, []);

  // 2. Render frame to canvas with high-DPI scaling and object-fit cover
  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const img = imagesRef.current[index];
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
  }, []);

  // 3. Auto-play functionality (smooth preview mode)
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayTimerRef.current = window.setInterval(() => {
        targetFrameRef.current = (targetFrameRef.current + 1) % TOTAL_FRAMES;
      }, 70); // Smooth, slower pace
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

  // 4. External or Scroll Progress Sync
  useEffect(() => {
    if (isAutoPlaying) return;

    if (externalProgress !== undefined) {
      const targetIndex = Math.min(
        Math.max(Math.floor(externalProgress * (TOTAL_FRAMES - 1)), 0),
        TOTAL_FRAMES - 1
      );
      targetFrameRef.current = targetIndex;
    }
  }, [externalProgress, isAutoPlaying]);

  // 5. Physics-based Smooth Lerp Render Loop (slower, gentle interpolation)
  useEffect(() => {
    let lastDrawn = -1;

    const loop = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.005) {
        currentFrameRef.current += diff * 0.08; // Ultra smooth and relaxed damping
      } else {
        currentFrameRef.current = targetFrameRef.current;
      }

      const frameToDraw = Math.min(
        Math.max(Math.round(currentFrameRef.current), 0),
        TOTAL_FRAMES - 1
      );

      if (frameToDraw !== lastDrawn) {
        renderFrame(frameToDraw);
        lastDrawn = frameToDraw;
        setActiveFrameDisplay(frameToDraw + 1);
        onFrameChange?.(frameToDraw + 1, frameToDraw / (TOTAL_FRAMES - 1));
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [renderFrame, onFrameChange]);

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
          className="px-3.5 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 backdrop-blur-xl border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-xl"
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

        {/* Frame Progress Indicator Tag */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-xl border border-white/15 text-[11px] font-mono text-slate-200 shadow-xl">
          <Sparkles size={12} className="text-amber-400" />
          <span>{String(activeFrameDisplay).padStart(2, '0')} / {TOTAL_FRAMES}</span>
        </div>
      </div>
    </div>
  );
};
