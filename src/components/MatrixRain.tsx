import { useEffect, useRef } from 'react';

interface MatrixChar {
  x: number;
  y: number;
  char: string;
  speed: number;
  opacity: number;
  brightness: number;
}

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const columnsRef = useRef<MatrixChar[][]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Character pool (Matrix-style + binary)
    const chars = '01アイウエオカキクケコサシスセソABCDEFGHIJKLMNOPQRSTUVWXYZ10101';
    
    // Calculate trunk position (center of screen, wider column)
    const trunkLeft = canvas.width / 2 - 100;
    const trunkRight = canvas.width / 2 + 100;
    const trunkTop = canvas.height * 0.35;
    const trunkBottom = canvas.height * 0.53;

    // Initialize columns in trunk area - more columns, denser
    const columnWidth = 24;
    const numColumns = Math.floor(200 / columnWidth);
    
    columnsRef.current = Array.from({ length: numColumns }, (_, i) => {
      const x = trunkLeft + i * columnWidth;
      const numChars = 8 + Math.floor(Math.random() * 10);
      return Array.from({ length: numChars }, (_, j) => ({
        x,
        y: trunkTop + j * 30 + Math.random() * 100,
        char: chars[Math.floor(Math.random() * chars.length)],
        speed: 3 + Math.random() * 4,
        opacity: 0.7 + Math.random() * 0.3,
        brightness: 0.6 + Math.random() * 0.4,
      }));
    });

    // Animation loop
    const animate = () => {
      // Sharper fade for cleaner trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      columnsRef.current.forEach((column) => {
        column.forEach((char, charIndex) => {
          // Bright matrix green with white highlights
          const isHighlight = Math.random() > 0.85;
          const baseColor = isHighlight ? 255 : Math.floor(255 * char.brightness);
          
          // Subtle sharp glow
          ctx.shadowBlur = isHighlight ? 4 : 3;
          ctx.shadowColor = isHighlight ? '#FFFFFF' : '#00FF41';
          
          ctx.fillStyle = isHighlight 
            ? `rgba(255, 255, 255, ${char.opacity})`
            : `rgba(0, ${baseColor}, ${Math.floor(65 * char.brightness)}, ${char.opacity})`;
          
          ctx.font = `bold 28px monospace`;
          ctx.fillText(char.char, char.x, char.y);

          // Reset shadow
          ctx.shadowBlur = 0;

          // Update position
          char.y += char.speed;

          // Reset if out of trunk bounds
          if (char.y > trunkBottom) {
            char.y = trunkTop - 30;
            char.char = chars[Math.floor(Math.random() * chars.length)];
            char.speed = 3 + Math.random() * 4;
            char.opacity = 0.7 + Math.random() * 0.3;
            char.brightness = 0.6 + Math.random() * 0.4;
          } else {
            // Randomly change character for digital effect
            if (Math.random() > 0.92) {
              char.char = chars[Math.floor(Math.random() * chars.length)];
            }
          }
        });

        // Occasionally add new characters to the stream
        if (Math.random() > 0.95 && column.length < 20) {
          const lastChar = column[column.length - 1];
          column.push({
            x: lastChar.x,
            y: lastChar.y - 30,
            char: chars[Math.floor(Math.random() * chars.length)],
            speed: lastChar.speed,
            opacity: 0.7 + Math.random() * 0.3,
            brightness: 0.6 + Math.random() * 0.4,
          });
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default MatrixRain;
