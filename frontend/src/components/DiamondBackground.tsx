import { useEffect, useRef, useCallback } from "react";

interface Diamond {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  glowAlpha: number;
  targetGlowAlpha: number;
}

export default function DiamondBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const diamondsRef = useRef<Diamond[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>();

  const createDiamonds = useCallback((width: number, height: number) => {
    const diamonds: Diamond[] = [];
    for (let i = 0; i < 18; i++) {
      diamonds.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 40 + Math.random() * 90,
        speed: 0.008 + Math.random() * 0.015,
        opacity: 0.04 + Math.random() * 0.07,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.24,
        glowAlpha: 0,
        targetGlowAlpha: 0,
      });
    }
    return diamonds;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (diamondsRef.current.length === 0) {
        diamondsRef.current = createDiamonds(canvas.width, canvas.height);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      diamondsRef.current.forEach((diamond) => {
        // Float upward
        diamond.y -= diamond.speed * canvas.height * 0.01;
        
        // Slight horizontal drift
        diamond.x += Math.sin(diamond.y * 0.002) * 0.3;
        
        // Rotation
        diamond.rotation += diamond.rotationSpeed;
        
        // Wrap around
        if (diamond.y + diamond.size < 0) {
          diamond.y = canvas.height + diamond.size;
          diamond.x = Math.random() * canvas.width;
        }
        if (diamond.x < -diamond.size) diamond.x = canvas.width + diamond.size;
        if (diamond.x > canvas.width + diamond.size) diamond.x = -diamond.size;

        // Calculate distance to mouse
        const dx = mouseRef.current.x - diamond.x;
        const dy = mouseRef.current.y - diamond.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const proximityThreshold = 160;

        // Update glow target based on proximity
        if (distance < proximityThreshold) {
          diamond.targetGlowAlpha = 1 - distance / proximityThreshold;
        } else {
          diamond.targetGlowAlpha = 0;
        }

        // Smooth glow transition (lerp)
        diamond.glowAlpha += (diamond.targetGlowAlpha - diamond.glowAlpha) * 0.08;

        ctx.save();
        ctx.translate(diamond.x, diamond.y);
        ctx.rotate((diamond.rotation * Math.PI) / 180);

        const halfSize = diamond.size / 2;

        // Draw diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -halfSize);
        ctx.lineTo(halfSize, 0);
        ctx.lineTo(0, halfSize);
        ctx.lineTo(-halfSize, 0);
        ctx.closePath();

        // Apply glow effect if active
        if (diamond.glowAlpha > 0.01) {
          ctx.shadowColor = `rgba(240, 170, 50, ${diamond.glowAlpha})`;
          ctx.shadowBlur = 20 + diamond.glowAlpha * 30;
          ctx.strokeStyle = `rgba(255, 200, 80, ${diamond.glowAlpha * 0.9})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw the diamond outline
        ctx.strokeStyle = `rgba(200, 124, 20, ${diamond.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Fill with very subtle color
        ctx.fillStyle = `rgba(200, 124, 20, ${diamond.opacity * 0.15})`;
        ctx.fill();

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [createDiamonds]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "transparent" }}
    />
  );
}
