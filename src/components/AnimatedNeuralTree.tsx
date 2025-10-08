import { useEffect, useRef, useState } from 'react';
import MatrixRain from './MatrixRain';

interface Particle {
  id: number;
  path: string;
  duration: number;
  delay: number;
  size: number;
  color: string;
}

interface AlgorithmBlock {
  id: number;
  text: string;
  x: number;
  y: number;
  offsetX: number;
  speed: number;
  opacity: number;
  type: 'binary' | 'hex' | 'symbol' | 'packet';
}

const AnimatedNeuralTree = () => {
  const [branchParticles, setBranchParticles] = useState<Particle[]>([]);
  const [rootBlocks, setRootBlocks] = useState<AlgorithmBlock[]>([]);
  const animationRef = useRef<number>();
  const particleIdRef = useRef(0);

  // Realistic tree branch paths - organic and expansive
  const branches = [
    // Main trunk
    'M 400 420 Q 400 350 400 280',
    
    // Primary branches - left side
    'M 400 320 Q 350 280 300 240 Q 280 220 260 180',
    'M 400 340 Q 340 320 280 300 Q 240 280 200 240',
    'M 400 360 Q 320 350 260 340 Q 220 330 180 310',
    
    // Primary branches - right side
    'M 400 320 Q 450 280 500 240 Q 520 220 540 180',
    'M 400 340 Q 460 320 520 300 Q 560 280 600 240',
    'M 400 360 Q 480 350 540 340 Q 580 330 620 310',
    
    // Secondary branches - creating density
    'M 300 240 Q 260 200 240 160 Q 220 140 200 100',
    'M 300 240 Q 280 210 260 180 Q 250 160 240 120',
    'M 280 300 Q 240 270 220 240 Q 200 220 180 180',
    'M 260 340 Q 220 320 200 280 Q 180 260 160 220',
    
    'M 500 240 Q 540 200 560 160 Q 580 140 600 100',
    'M 500 240 Q 520 210 540 180 Q 550 160 560 120',
    'M 520 300 Q 560 270 580 240 Q 600 220 620 180',
    'M 540 340 Q 580 320 600 280 Q 620 260 640 220',
    
    // Tertiary branches - upper canopy
    'M 240 160 Q 220 130 200 100 Q 180 80 160 50',
    'M 260 180 Q 240 150 220 120 Q 200 100 180 70',
    'M 560 160 Q 580 130 600 100 Q 620 80 640 50',
    'M 540 180 Q 560 150 580 120 Q 600 100 620 70',
    
    // Fine branches - dense canopy
    'M 200 100 Q 180 80 160 60 Q 150 50 140 30',
    'M 240 120 Q 220 100 200 80 Q 190 70 180 50',
    'M 600 100 Q 620 80 640 60 Q 650 50 660 30',
    'M 560 120 Q 580 100 600 80 Q 610 70 620 50',
  ];

  // Root system - equally dramatic as branches
  const roots = [
    // Main roots descending
    'M 400 420 Q 400 480 400 540',
    
    // Primary roots - left side
    'M 400 460 Q 350 500 300 540 Q 280 560 260 600',
    'M 400 480 Q 340 520 280 560 Q 240 580 200 620',
    'M 400 500 Q 320 540 260 580 Q 220 600 180 640',
    
    // Primary roots - right side  
    'M 400 460 Q 450 500 500 540 Q 520 560 540 600',
    'M 400 480 Q 460 520 520 560 Q 560 580 600 620',
    'M 400 500 Q 480 540 540 580 Q 580 600 620 640',
    
    // Secondary roots - spreading wide
    'M 300 540 Q 260 580 240 620 Q 220 640 200 680',
    'M 280 560 Q 240 600 220 640 Q 200 660 180 700',
    'M 260 580 Q 220 620 200 660 Q 180 680 160 720',
    
    'M 500 540 Q 540 580 560 620 Q 580 640 600 680',
    'M 520 560 Q 560 600 580 640 Q 600 660 620 700',
    'M 540 580 Q 580 620 600 660 Q 620 680 640 720',
    
    // Tertiary roots - deep spread
    'M 240 620 Q 200 660 180 700 Q 160 720 140 750',
    'M 220 640 Q 180 680 160 720 Q 140 740 120 770',
    'M 560 620 Q 600 660 620 700 Q 640 720 660 750',
    'M 580 640 Q 620 680 640 720 Q 660 740 680 770',
  ];

  useEffect(() => {
    // Generate branch particles - many more, larger
    const particles: Particle[] = [];
    const colors = ['#FFD700', '#FFEA00', '#00FF41', '#39FF14'];
    
    branches.forEach((path, index) => {
      // 3 particles per branch
      for (let i = 0; i < 3; i++) {
        particles.push({
          id: particleIdRef.current++,
          path,
          duration: 3 + Math.random() * 2,
          delay: Math.random() * 5,
          size: 12 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    });
    
    setBranchParticles(particles);

    // Generate root algorithm blocks - larger and more visible
    const blocks: AlgorithmBlock[] = [];
    const blockTypes: ('binary' | 'hex' | 'symbol' | 'packet')[] = ['binary', 'hex', 'symbol', 'packet'];
    
    roots.forEach((_, rootIndex) => {
      // 4 blocks per root
      for (let i = 0; i < 4; i++) {
        blocks.push({
          id: particleIdRef.current++,
          text: generateAlgorithmText(blockTypes[Math.floor(Math.random() * blockTypes.length)]),
          x: 0,
          y: rootIndex * 40 + i * 60,
          offsetX: 0,
          speed: 1 + Math.random() * 1.5,
          opacity: 0.8 + Math.random() * 0.2,
          type: blockTypes[Math.floor(Math.random() * blockTypes.length)]
        });
      }
    });
    
    setRootBlocks(blocks);

    // Animation loop
    let lastTime = 0;
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      setRootBlocks(prevBlocks => 
        prevBlocks.map(block => {
          let newOffsetX = block.offsetX + block.speed;
          let newText = block.text;
          
          // Reset when off screen
          if (newOffsetX > 400) {
            newOffsetX = 0;
            newText = generateAlgorithmText(block.type);
          }
          
          return { ...block, offsetX: newOffsetX, text: newText };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const generateAlgorithmText = (type: 'binary' | 'hex' | 'symbol' | 'packet'): string => {
    switch (type) {
      case 'binary':
        return Array.from({ length: 12 }, () => Math.random() > 0.5 ? '1' : '0').join('');
      case 'hex':
        return '0x' + Array.from({ length: 8 }, () => 
          '0123456789ABCDEF'[Math.floor(Math.random() * 16)]
        ).join('');
      case 'symbol':
        const symbols = ['∑', '∫', '∂', 'π', 'λ', 'Δ', 'Ω', '∞', '≈', '≡'];
        return symbols[Math.floor(Math.random() * symbols.length)] + 
               symbols[Math.floor(Math.random() * symbols.length)];
      case 'packet':
        return `[${Math.floor(Math.random() * 999)}]`;
      default:
        return '01010101';
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {/* Intense background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-green-900/40 via-black to-black" />
      
      {/* Animated light rays */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full 
                      bg-gradient-conic from-transparent via-green-500/20 to-transparent animate-spin"
             style={{ animationDuration: '20s' }} />
      </div>

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Intense glow filters */}
          <filter id="intense-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="ultra-glow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="20" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="root-glow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="18" result="coloredBlur"/>
            <feColorMatrix in="coloredBlur" type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 1.5 0"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode/>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Bright gradients */}
          <linearGradient id="branch-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#39FF14" stopOpacity="1" />
            <stop offset="50%" stopColor="#00FF41" stopOpacity="1" />
            <stop offset="100%" stopColor="#00AA00" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="root-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00FFFF" stopOpacity="1">
              <animate attributeName="stopOpacity" values="1;0.8;1" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#00FF80" stopOpacity="1" />
            <stop offset="100%" stopColor="#00FF41" stopOpacity="1">
              <animate attributeName="stopOpacity" values="1;0.8;1" dur="2s" repeatCount="indefinite" begin="1s" />
            </stop>
          </linearGradient>

          <linearGradient id="particle-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFEA00" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ground line separator */}
        <line 
          x1="0" 
          y1="420" 
          x2="800" 
          y2="420" 
          stroke="url(#root-gradient)"
          strokeWidth="3"
          strokeDasharray="10 5"
          opacity="0.8"
          filter="url(#intense-glow)"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="15" dur="1s" repeatCount="indefinite" />
        </line>

        {/* Root system - bright and animated */}
        <g className="roots">
          {roots.map((d, i) => (
            <g key={`root-${i}`}>
              {/* Root path with intense glow */}
              <path
                d={d}
                fill="none"
                stroke="url(#root-gradient)"
                strokeWidth={8 + (roots.length - i) * 0.5}
                strokeLinecap="round"
                opacity="1"
                filter="url(#root-glow)"
              >
                <animate 
                  attributeName="stroke-width"
                  values={`${8 + (roots.length - i) * 0.5};${10 + (roots.length - i) * 0.5};${8 + (roots.length - i) * 0.5}`}
                  dur="3s"
                  repeatCount="indefinite"
                  begin={`${i * 0.1}s`}
                />
              </path>
              
              {/* Flowing energy through roots */}
              <circle r="6" fill="#00FFFF" filter="url(#ultra-glow)">
                <animateMotion
                  dur={`${4 + Math.random() * 2}s`}
                  repeatCount="indefinite"
                  path={d}
                  begin={`${Math.random() * 3}s`}
                />
              </circle>
            </g>
          ))}
        </g>

        {/* Algorithm blocks flowing through roots */}
        <g className="algorithm-blocks">
          {rootBlocks.map(block => (
            <g key={block.id} transform={`translate(${400 + block.offsetX}, ${450 + block.y})`}>
              {/* Block background */}
              <rect
                x="-60"
                y="-20"
                width="120"
                height="40"
                fill="rgba(0, 20, 40, 0.8)"
                stroke={block.type === 'packet' ? '#00FFFF' : '#00FF41'}
                strokeWidth="2"
                rx="5"
                filter="url(#intense-glow)"
                opacity={block.opacity}
              />
              
              {/* Block text */}
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fill={block.type === 'symbol' ? '#FFD700' : '#00FFFF'}
                fontSize="28"
                fontFamily="monospace"
                fontWeight="bold"
                filter="url(#ultra-glow)"
                opacity={block.opacity}
              >
                {block.text}
              </text>
            </g>
          ))}
        </g>

        {/* Tree branches - bright and organic */}
        <g className="branches">
          {branches.map((d, i) => (
            <g key={`branch-${i}`}>
              {/* Main branch path */}
              <path
                d={d}
                fill="none"
                stroke="url(#branch-gradient)"
                strokeWidth={10 + (branches.length - i) * 0.3}
                strokeLinecap="round"
                opacity="1"
                filter="url(#intense-glow)"
              />
              
              {/* Pulsing vein effect */}
              <path
                d={d}
                fill="none"
                stroke="#39FF14"
                strokeWidth={3}
                strokeLinecap="round"
                opacity="0.6"
                filter="url(#ultra-glow)"
              >
                <animate 
                  attributeName="opacity"
                  values="0.3;0.9;0.3"
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${i * 0.1}s`}
                />
              </path>
            </g>
          ))}
        </g>

        {/* Neural flow particles - large and bright */}
        {branchParticles.map(particle => (
          <g key={particle.id}>
            {/* Particle trail */}
            <circle
              r={particle.size * 1.5}
              fill={particle.color}
              opacity="0.3"
              filter="url(#ultra-glow)"
            >
              <animateMotion
                dur={`${particle.duration}s`}
                repeatCount="indefinite"
                path={particle.path}
                begin={`${particle.delay}s`}
              />
            </circle>
            
            {/* Main particle */}
            <circle
              r={particle.size}
              fill={particle.color}
              filter="url(#ultra-glow)"
            >
              <animateMotion
                dur={`${particle.duration}s`}
                repeatCount="indefinite"
                path={particle.path}
                begin={`${particle.delay}s`}
              />
              <animate
                attributeName="opacity"
                values="1;0.6;1"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}

        {/* Branch intersection nodes - large and pulsing */}
        {[
          [400, 320], [400, 340], [400, 360],
          [300, 240], [280, 300], [260, 340],
          [500, 240], [520, 300], [540, 340],
          [240, 160], [260, 180], [200, 100],
          [560, 160], [540, 180], [600, 100],
        ].map((pos, i) => (
          <g key={`node-${i}`}>
            {/* Expanding ring */}
            <circle
              cx={pos[0]}
              cy={pos[1]}
              r="25"
              fill="none"
              stroke="#FFEA00"
              strokeWidth="3"
              opacity="0"
            >
              <animate
                attributeName="r"
                values="10;35;10"
                dur="3s"
                repeatCount="indefinite"
                begin={`${i * 0.2}s`}
              />
              <animate
                attributeName="opacity"
                values="0;0.8;0"
                dur="3s"
                repeatCount="indefinite"
                begin={`${i * 0.2}s`}
              />
            </circle>
            
            {/* Core node */}
            <circle
              cx={pos[0]}
              cy={pos[1]}
              r="18"
              fill="#FFFFFF"
              filter="url(#ultra-glow)"
            >
              <animate
                attributeName="r"
                values="15;22;15"
                dur="2s"
                repeatCount="indefinite"
                begin={`${i * 0.15}s`}
              />
            </circle>
          </g>
        ))}
      </svg>

      {/* Matrix rain overlay on trunk */}
      <MatrixRain />
      
      {/* Floating particle atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={`float-${i}`}
            className="absolute w-2 h-2 bg-green-400 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedNeuralTree;
