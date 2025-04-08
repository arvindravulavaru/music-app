import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';

interface AudioVisualizerProps {
  isPlaying: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create analyzer if it doesn't exist
    if (!analyserRef.current) {
      analyserRef.current = new Tone.Analyser({
        type: 'waveform',
        size: 1024,
        smoothing: 0.8
      });
      // Connect master output to analyzer
      Tone.getDestination().connect(analyserRef.current);
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match window size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Animation function
    const draw = () => {
      if (!ctx || !analyserRef.current) return;

      // Get waveform data
      const waveform = analyserRef.current.getValue();
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1a1a1a');
      gradient.addColorStop(1, '#2d2d2d');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waveform
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isPlaying ? '#2196f3' : '#666';
      
      const sliceWidth = canvas.width / waveform.length;
      let x = 0;

      for (let i = 0; i < waveform.length; i++) {
        const v = waveform[i] as number;
        const y = (v + 1) / 2 * canvas.height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Draw frequency bars
      const barWidth = canvas.width / 64;
      const barSpacing = 2;
      const maxBarHeight = canvas.height / 3;

      ctx.fillStyle = isPlaying ? '#ff4081' : '#444';
      for (let i = 0; i < 64; i++) {
        const value = Math.abs((waveform[i * 16] as number));
        const height = value * maxBarHeight;
        const x = i * (barWidth + barSpacing);
        const y = canvas.height - height;
        
        ctx.fillRect(x, y, barWidth, height);
        // Mirror bars at the top
        ctx.fillRect(x, 0, barWidth, height);
      }

      // Request next frame
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Start animation
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameRef.current);
      if (analyserRef.current) {
        analyserRef.current.dispose();
        analyserRef.current = null;
      }
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        opacity: 0.8,
      }}
    />
  );
};

export default AudioVisualizer; 