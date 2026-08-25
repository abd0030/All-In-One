import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Sparkles } from 'lucide-react';

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
  const loadedMapRef = useRef<boolean[]>(new Array(TOTAL_FRAMES).fill(false));
  const currentFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const autoPlayTimerRef = useRef<number | null>(null);
  const lastDrawnFloatRef = useRef<number>(-1);

  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [activeFrameDisplay, setActiveFrameDisplay] = useState<number>(1);

  // 1. High-reliability preloading for both Mobile & Desktop
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    const loadedMap = new Array(TOTAL_FRAMES).fill(false);

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `/frames/ezgif-frame-${frameNum}.jpg`;
      img.loading = 'eager';

      const markLoaded = () => {
        loadedMap[i - 1] = true;
        loadedMapRef.current = loadedMap;
        setLoadedCount(prev => prev + 1);
        if (i === 1 && canvasRef.current) {
          renderSubFrame(0);
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
        // Fallback mark loaded on error to prevent infinite waiting
        loadedMap[i - 1] = false;
      };

      loadedImages.push(img);
    }

    imagesRef.current = loadedImages;
    loadedMapRef.current = loadedMap;

    return () => {
      imagesRef.current = [];
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, []);

  // Helper: Find nearest loaded frame index if requested frame is still buffering on mobile
  const getNearestLoadedIndex = useCallback((targetIdx: number): number => {
    const map = loadedMapRef.current;
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

    const clampedFloat = Math.max(0, Math.min(frameFloat, TOTAL_FRAMES - 1));
    const baseIndex = Math.floor(clampedFloat);
    const nextIndex = Math.min(baseIndex + 1, TOTAL_FRAMES - 1);
    const blendFactor = clampedFloat - baseIndex; // Sub-frame fraction (0.0 to 1.0)

    const safeBaseIdx = getNearestLoadedIndex(baseIndex);
    const safeNextIdx = getNearestLoadedIndex(nextIndex);

    const baseImg = imagesRef.current[safeBaseIdx];
    const nextImg = imagesRef.current[safeNextIdx];

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

  // 3. Auto-play loop (slower, cinematic)
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayTimerRef.current = window.setInterval(() => {
        targetFrameRef.current = (targetFrameRef.current + 1) % TOTAL_FRAMES;
      }, 65);
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

  // 5. Physics-based Smooth Lerp Animation Loop with sub-frame precision
  useEffect(() => {
    const loop = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.002) {
        currentFrameRef.current += diff * 0.075; // Ultra smooth damping
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
