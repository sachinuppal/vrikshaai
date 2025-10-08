import { useEffect, useRef } from 'react';

interface MatrixChar {
  x: number;
  y: number;
  char: string;
  speed: number;
  opacity: number;
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

    // Character pool (Matrix-style)
    const chars = '01アイウエオカキクケコサシスセソABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // Calculate trunk position (center of screen, narrow column)
    const trunkLeft = canvas.width / 2 - 40;
    const trunkRight = canvas.width / 2 + 40;
    const trunkTop = canvas.height * 0.5; // Start from middle
    const trunkBottom = canvas.height * 0.83; // End near bottom

    // Initialize columns only in trunk area
    const columnWidth = 20;
    const numColumns = Math.floor(80 / columnWidth);
    
    columnsRef.current = Array.from({ length: numColumns }, (_, i) => {
      const x = trunkLeft + i * columnWidth;
      return [{
        x,
        y: trunkTop + Math.random() * 100,
        char: chars[Math.floor(Math.random() * chars.length)],
        speed: 2 + Math.random() * 3,
        opacity: 0.8 + Math.random() * 0.2,
      }];
    });

    // Animation loop
    const animate = () => {
      // Fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      columnsRef.current.forEach((column, columnIndex) => {
        column.forEach((char, charIndex) => {
          // Gradient color - bright at top, darker as it falls
          const progress = (char.y - trunkTop) / (trunkBottom - trunkTop);
          const brightness = Math.max(0, 1 - progress);
          
          ctx.fillStyle = `rgba(0, ${Math.floor(255 * brightness)}, ${Math.floor(65 * brightness)}, ${char.opacity})`;
          ctx.font = `${14 + Math.random() * 2}px monospace`;
          ctx.fillText(char.char, char.x, char.y);

          // Update position
          char.y += char.speed;

          // Reset if out of trunk bounds
          if (char.y > trunkBottom) {
            column[charIndex] = {
              x: char.x,
              y: trunkTop,
              char: chars[Math.floor(Math.random() * chars.length)],
              speed: 2 + Math.random() * 3,
              opacity: 0.8 + Math.random() * 0.2,
            };
          } else {
            // Randomly change character
            if (Math.random() > 0.95) {
              char.char = chars[Math.floor(Math.random() * chars.length)];
            }
          }
        });

        // Occasionally add new characters to the stream
        if (Math.random() > 0.97 && column.length < 15) {
          const lastChar = column[column.length - 1];
          column.push({
            x: lastChar.x,
            y: lastChar.y - 20,
            char: chars[Math.floor(Math.random() * chars.length)],
            speed: lastChar.speed,
            opacity: 0.8 + Math.random() * 0.2,
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
