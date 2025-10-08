import { useEffect, useRef, useState } from 'react';
import MatrixRain from './MatrixRain';

interface Particle {
  id: number;
  path: string;
  offset: number;
  speed: number;
  color: string;
  size: number;
}

interface AlgorithmBlock {
  id: number;
  x: number;
  y: number;
  text: string;
  opacity: number;
  speed: number;
}

const AnimatedNeuralTree = () => {
  const [branchParticles, setBranchParticles] = useState<Particle[]>([]);
  const [rootBlocks, setRootBlocks] = useState<AlgorithmBlock[]>([]);
  const animationRef = useRef<number>();
  const particleIdRef = useRef(0);
  const blockIdRef = useRef(0);

  // Branch paths for neural flow
  const branchPaths = [
    // Main branches - left side
    "M 400,300 Q 300,250 250,200 T 180,120",
    "M 400,300 Q 320,280 280,240 T 220,180",
    "M 400,300 Q 340,290 300,270 T 260,220",
    
    // Main branches - right side
    "M 400,300 Q 500,250 550,200 T 620,120",
    "M 400,300 Q 480,280 520,240 T 580,180",
    "M 400,300 Q 460,290 500,270 T 540,220",
    
    // Upper branches
    "M 400,300 Q 380,240 370,200 T 350,140",
    "M 400,300 Q 420,240 430,200 T 450,140",
    
    // Secondary branches - left
    "M 280,240 Q 260,220 240,200",
    "M 250,200 Q 220,180 200,160",
    
    // Secondary branches - right
    "M 520,240 Q 540,220 560,200",
    "M 550,200 Q 580,180 600,160",
  ];

  // Root paths for algorithm flow
  const rootPaths = [
    "M 400,500 Q 350,520 300,530",
    "M 400,500 Q 330,530 280,550",
    "M 400,500 Q 450,520 500,530",
    "M 400,500 Q 470,530 520,550",
    "M 400,500 Q 380,540 360,570",
    "M 400,500 Q 420,540 440,570",
  ];

  useEffect(() => {
    // Initialize particles
    const initialParticles: Particle[] = branchPaths.map((path, index) => ({
      id: particleIdRef.current++,
      path,
      offset: Math.random() * 100,
      speed: 0.3 + Math.random() * 0.5,
      color: Math.random() > 0.5 ? '#FFD700' : '#00FF41',
      size: 3 + Math.random() * 3,
    }));
    setBranchParticles(initialParticles);

    // Initialize algorithm blocks
    const initialBlocks: AlgorithmBlock[] = rootPaths.map((_, index) => ({
      id: blockIdRef.current++,
      x: 400 + (Math.random() - 0.5) * 100,
      y: 500 + Math.random() * 80,
      text: generateAlgorithmText(),
      opacity: 0.8 + Math.random() * 0.2,
      speed: 0.5 + Math.random() * 0.5,
    }));
    setRootBlocks(initialBlocks);

    // Animation loop
    const animate = () => {
      setBranchParticles(prev => 
        prev.map(p => ({
          ...p,
          offset: (p.offset + p.speed) % 100,
        }))
      );

      setRootBlocks(prev =>
        prev.map(b => {
          const newX = b.x - b.speed;
          return newX < 200 ? {
            ...b,
            x: 600,
            y: 500 + Math.random() * 80,
            text: generateAlgorithmText(),
            opacity: 0.8 + Math.random() * 0.2,
          } : {
            ...b,
            x: newX,
          };
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

  const generateAlgorithmText = () => {
    const symbols = ['Σ', '∫', '∂', '∆', 'λ', 'π', 'α', 'β', 'γ', 'θ'];
    const binary = Array.from({ length: 4 }, () => Math.random() > 0.5 ? '1' : '0').join('');
    const hex = Math.floor(Math.random() * 65536).toString(16).toUpperCase().padStart(4, '0');
    
    const choices = [
      `{${binary}}`,
      `0x${hex}`,
      symbols[Math.floor(Math.random() * symbols.length)],
      `[${binary}]`,
    ];
    
    return choices[Math.floor(Math.random() * choices.length)];
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-black/40 via-black to-black" />
      
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Gradients */}
          <radialGradient id="trunkGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#00FF41" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#003B00" stopOpacity="0" />
          </radialGradient>
          
          <linearGradient id="branchGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#003B00" />
            <stop offset="50%" stopColor="#00AA00" />
            <stop offset="100%" stopColor="#00FF41" />
          </linearGradient>
          
          <linearGradient id="rootGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00FFFF" />
            <stop offset="100%" stopColor="#00AA00" />
          </linearGradient>
          
          <linearGradient id="neuralFlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFD700" stopOpacity="1" />
            <stop offset="100%" stopColor="#00FF41" stopOpacity="0" />
          </linearGradient>

          {/* Filters */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ground line separator */}
        <line
          x1="0"
          y1="500"
          x2="800"
          y2="500"
          stroke="url(#rootGradient)"
          strokeWidth="2"
          strokeDasharray="10,5"
          opacity="0.3"
        />
        
        <text x="50" y="495" fill="#00FFFF" fontSize="10" opacity="0.5">
          UNDERGROUND NETWORK
        </text>

        {/* ROOT SYSTEM - Below ground */}
        <g opacity="0.9">
          {/* Main root structure */}
          <path
            d="M 400,500 Q 350,520 300,530 Q 250,540 200,550"
            stroke="url(#rootGradient)"
            strokeWidth="8"
            fill="none"
            filter="url(#glow)"
            opacity="0.8"
          />
          <path
            d="M 400,500 Q 330,530 280,550 Q 240,565 200,580"
            stroke="url(#rootGradient)"
            strokeWidth="6"
            fill="none"
            filter="url(#glow)"
            opacity="0.7"
          />
          <path
            d="M 400,500 Q 450,520 500,530 Q 550,540 600,550"
            stroke="url(#rootGradient)"
            strokeWidth="8"
            fill="none"
            filter="url(#glow)"
            opacity="0.8"
          />
          <path
            d="M 400,500 Q 470,530 520,550 Q 560,565 600,580"
            stroke="url(#rootGradient)"
            strokeWidth="6"
            fill="none"
            filter="url(#glow)"
            opacity="0.7"
          />
          
          {/* Secondary roots */}
          <path
            d="M 400,500 Q 380,540 360,570 Q 340,590 320,600"
            stroke="url(#rootGradient)"
            strokeWidth="4"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 400,500 Q 420,540 440,570 Q 460,590 480,600"
            stroke="url(#rootGradient)"
            strokeWidth="4"
            fill="none"
            opacity="0.6"
          />
          
          {/* Algorithm blocks flowing through roots */}
          {rootBlocks.map(block => (
            <g key={block.id} opacity={block.opacity}>
              <text
                x={block.x}
                y={block.y}
                fill="#00FFFF"
                fontSize="14"
                fontFamily="monospace"
                fontWeight="bold"
                filter="url(#glow)"
              >
                {block.text}
              </text>
            </g>
          ))}
        </g>

        {/* TRUNK - Main tree trunk */}
        <g>
          {/* Trunk base */}
          <path
            d="M 380,500 Q 385,450 390,400 Q 392,350 395,300 L 405,300 Q 408,350 410,400 Q 415,450 420,500 Z"
            fill="url(#trunkGlow)"
            stroke="#00FF41"
            strokeWidth="3"
            filter="url(#glow)"
          />
          
          {/* Trunk texture layers */}
          <path
            d="M 385,500 L 390,300 L 395,300 L 395,500 Z"
            fill="#001a00"
            opacity="0.6"
          />
          <path
            d="M 405,300 L 410,300 L 415,500 L 410,500 Z"
            fill="#001a00"
            opacity="0.6"
          />
          
          {/* Trunk highlights */}
          <path
            d="M 392,480 Q 393,400 394,320"
            stroke="#00FF41"
            strokeWidth="1"
            opacity="0.3"
            strokeLinecap="round"
          />
          <path
            d="M 408,480 Q 407,400 406,320"
            stroke="#00FF41"
            strokeWidth="1"
            opacity="0.3"
            strokeLinecap="round"
          />
        </g>

        {/* BRANCHES - Above ground with neural flow */}
        <g>
          {/* Main branch structure - Left side */}
          <path
            d="M 400,300 Q 300,250 250,200 Q 220,180 180,120"
            stroke="url(#branchGradient)"
            strokeWidth="12"
            fill="none"
            filter="url(#glow)"
            strokeLinecap="round"
          />
          <path
            d="M 400,300 Q 320,280 280,240 Q 250,210 220,180"
            stroke="url(#branchGradient)"
            strokeWidth="10"
            fill="none"
            filter="url(#glow)"
            strokeLinecap="round"
          />
          <path
            d="M 400,300 Q 340,290 300,270 Q 280,250 260,220"
            stroke="url(#branchGradient)"
            strokeWidth="8"
            fill="none"
            filter="url(#glow)"
            strokeLinecap="round"
          />
          
          {/* Main branch structure - Right side */}
          <path
            d="M 400,300 Q 500,250 550,200 Q 580,180 620,120"
            stroke="url(#branchGradient)"
            strokeWidth="12"
            fill="none"
            filter="url(#glow)"
            strokeLinecap="round"
          />
          <path
            d="M 400,300 Q 480,280 520,240 Q 550,210 580,180"
            stroke="url(#branchGradient)"
            strokeWidth="10"
            fill="none"
            filter="url(#glow)"
            strokeLinecap="round"
          />
          <path
            d="M 400,300 Q 460,290 500,270 Q 520,250 540,220"
            stroke="url(#branchGradient)"
            strokeWidth="8"
            fill="none"
            filter="url(#glow)"
            strokeLinecap="round"
          />
          
          {/* Upper branches */}
          <path
            d="M 400,300 Q 380,240 370,200 Q 365,170 350,140"
            stroke="url(#branchGradient)"
            strokeWidth="9"
            fill="none"
            filter="url(#glow)"
            strokeLinecap="round"
          />
          <path
            d="M 400,300 Q 420,240 430,200 Q 435,170 450,140"
            stroke="url(#branchGradient)"
            strokeWidth="9"
            fill="none"
            filter="url(#glow)"
            strokeLinecap="round"
          />
          
          {/* Secondary branches - Left */}
          <path
            d="M 280,240 Q 260,220 240,200 Q 220,185 200,170"
            stroke="url(#branchGradient)"
            strokeWidth="6"
            fill="none"
            opacity="0.8"
            strokeLinecap="round"
          />
          <path
            d="M 250,200 Q 230,185 220,180 Q 210,172 200,160"
            stroke="url(#branchGradient)"
            strokeWidth="5"
            fill="none"
            opacity="0.7"
            strokeLinecap="round"
          />
          
          {/* Secondary branches - Right */}
          <path
            d="M 520,240 Q 540,220 560,200 Q 580,185 600,170"
            stroke="url(#branchGradient)"
            strokeWidth="6"
            fill="none"
            opacity="0.8"
            strokeLinecap="round"
          />
          <path
            d="M 550,200 Q 570,185 580,180 Q 590,172 600,160"
            stroke="url(#branchGradient)"
            strokeWidth="5"
            fill="none"
            opacity="0.7"
            strokeLinecap="round"
          />

          {/* Neural flow particles */}
          {branchParticles.map(particle => (
            <circle
              key={particle.id}
              r={particle.size}
              fill={particle.color}
              filter="url(#strongGlow)"
            >
              <animateMotion
                path={particle.path}
                dur="4s"
                repeatCount="indefinite"
                keyPoints={`${particle.offset / 100};1`}
                keyTimes="0;1"
                calcMode="linear"
              />
            </circle>
          ))}

          {/* Pulsing nodes at branch intersections */}
          <circle cx="400" cy="300" r="8" fill="#FFD700" filter="url(#strongGlow)" className="animate-glow-intense" />
          <circle cx="280" cy="240" r="6" fill="#00FF41" filter="url(#strongGlow)" className="animate-glow-intense" style={{ animationDelay: '0.5s' }} />
          <circle cx="520" cy="240" r="6" fill="#00FF41" filter="url(#strongGlow)" className="animate-glow-intense" style={{ animationDelay: '0.7s' }} />
          <circle cx="250" cy="200" r="5" fill="#FFD700" filter="url(#strongGlow)" className="animate-glow-intense" style={{ animationDelay: '1s' }} />
          <circle cx="550" cy="200" r="5" fill="#FFD700" filter="url(#strongGlow)" className="animate-glow-intense" style={{ animationDelay: '1.2s' }} />
          <circle cx="370" cy="200" r="5" fill="#00FF41" filter="url(#strongGlow)" className="animate-glow-intense" style={{ animationDelay: '0.3s' }} />
          <circle cx="430" cy="200" r="5" fill="#00FF41" filter="url(#strongGlow)" className="animate-glow-intense" style={{ animationDelay: '0.9s' }} />
        </g>

        {/* Canopy particles (floating bits) */}
        <g opacity="0.4">
          {Array.from({ length: 20 }).map((_, i) => (
            <circle
              key={`canopy-${i}`}
              cx={300 + Math.random() * 200}
              cy={80 + Math.random() * 150}
              r={1 + Math.random() * 2}
              fill="#00FF41"
              opacity={0.3 + Math.random() * 0.4}
            >
              <animate
                attributeName="cy"
                values={`${80 + Math.random() * 150};${60 + Math.random() * 150};${80 + Math.random() * 150}`}
                dur={`${3 + Math.random() * 4}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.3;0.8;0.3"
                dur={`${2 + Math.random() * 3}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>
      </svg>

      {/* Matrix rain overlay on trunk */}
      <MatrixRain />
    </div>
  );
};

export default AnimatedNeuralTree;
