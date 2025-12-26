
import React, { useEffect, useRef } from 'react';
import { Nodule } from '../types';

interface HeatmapOverlayProps {
  nodules: Nodule[];
  width: number;
  height: number;
}

const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({ nodules, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    nodules.forEach((nodule) => {
      const px = (nodule.x / 100) * width;
      const py = (nodule.y / 100) * height;
      const r = (nodule.radius / 100) * Math.min(width, height) * 2; // Scaled radius

      const gradient = ctx.createRadialGradient(px, py, 0, px, py, r);
      
      // Heatmap colors based on intensity
      const alpha = nodule.intensity * 0.7;
      gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`);     // Red center
      gradient.addColorStop(0.3, `rgba(255, 165, 0, ${alpha * 0.6})`); // Orange
      gradient.addColorStop(0.7, `rgba(255, 255, 0, ${alpha * 0.2})`); // Yellow
      gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');           // Transparent edge

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, 2 * Math.PI);
      ctx.fill();

      // Draw a subtle border circle to highlight detection
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }, [nodules, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 pointer-events-none"
    />
  );
};

export default HeatmapOverlay;
