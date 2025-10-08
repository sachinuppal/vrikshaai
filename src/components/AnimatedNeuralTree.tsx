import { useEffect, useRef, useState } from 'react';
import MatrixRain from './MatrixRain';
import { generateKalpavrikshaTree, type BranchPath } from '@/utils/treeGeometry';

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
  const [treeGeometry, setTreeGeometry] = useState<{ branches: BranchPath[]; roots: BranchPath[] } | null>(null);
  const [branchParticles, setBranchParticles] = useState<Particle[]>([]);
  const [rootBlocks, setRootBlocks] = useState<AlgorithmBlock[]>([]);
  const animationRef = useRef<number>();
  const particleIdRef = useRef(0);

  useEffect(() => {
    // Generate realistic tree geometry
    const tree = generateKalpavrikshaTree();
    setTreeGeometry(tree);

    // Generate particles for branches
    const particles: Particle[] = [];
    const colors = ['#FFD700', '#FFEA00', '#00FF41'];
    
    tree.branches.forEach((branch, index) => {
      if (index % 2 === 0) { // Fewer particles for performance
        particles.push({
          id: particleIdRef.current++,
          path: branch.path,
          duration: 2.5 + Math.random() * 1.5,
          delay: Math.random() * 3,
          size: 8 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    });
    
    setBranchParticles(particles);

    // Generate algorithm blocks for roots
    const blocks: AlgorithmBlock[] = [];
    const blockTypes: ('binary' | 'hex' | 'symbol' | 'packet')[] = ['binary', 'hex', 'symbol', 'packet'];
    
    tree.roots.forEach((root, rootIndex) => {
      if (rootIndex % 3 === 0) {
        blocks.push({
          id: particleIdRef.current++,
          text: generateAlgorithmText(blockTypes[Math.floor(Math.random() * blockTypes.length)]),
          x: 0,
          y: rootIndex * 30,
          offsetX: 0,
          speed: 0.8 + Math.random() * 0.7,
          opacity: 0.9,
          type: blockTypes[Math.floor(Math.random() * blockTypes.length)]
        });
      }
    });
    
    setRootBlocks(blocks);

    // Animation loop for algorithm blocks
    let lastTime = 0;
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      setRootBlocks(prevBlocks => 
        prevBlocks.map(block => {
          let newOffsetX = block.offsetX + block.speed;
          let newText = block.text;
          
          if (newOffsetX > 300) {
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
        return Array.from({ length: 10 }, () => Math.random() > 0.5 ? '1' : '0').join('');
      case 'hex':
        return '0x' + Array.from({ length: 6 }, () => 
          '0123456789ABCDEF'[Math.floor(Math.random() * 16)]
        ).join('');
      case 'symbol':
        const symbols = ['∑', '∫', '∂', 'π', 'λ', 'Δ', 'Ω', '∞'];
        return symbols[Math.floor(Math.random() * symbols.length)];
      case 'packet':
        return `[${Math.floor(Math.random() * 999)}]`;
      default:
        return '010101';
    }
  };

  if (!treeGeometry) return null;

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-green-950/20 via-black to-black" />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Subtle glow filters - much less blur */}
          <filter id="subtle-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="sharp-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="root-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Sharp gradients */}
          <linearGradient id="branch-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00FF41" stopOpacity="1" />
            <stop offset="100%" stopColor="#00AA00" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="root-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00FFFF" stopOpacity="1" />
            <stop offset="50%" stopColor="#00AAFF" stopOpacity="1" />
            <stop offset="100%" stopColor="#0080FF" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Ground line separator */}
        <line 
          x1="0" 
          y1="420" 
          x2="800" 
          y2="420" 
          stroke="#00FF41"
          strokeWidth="2"
          strokeDasharray="15 10"
          opacity="0.7"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="25" dur="2s" repeatCount="indefinite" />
        </line>

        {/* Root system - sharp and bright */}
        <g className="roots">
          {treeGeometry.roots.map((root, i) => (
            <g key={`root-${i}`}>
              <path
                d={root.path}
                fill="none"
                stroke="url(#root-gradient)"
                strokeWidth={root.strokeWidth}
                strokeLinecap="round"
                opacity="0.95"
                filter="url(#root-glow)"
              >
                <animate 
                  attributeName="stroke-width"
                  values={`${root.strokeWidth};${root.strokeWidth + 2};${root.strokeWidth}`}
                  dur="3s"
                  repeatCount="indefinite"
                  begin={`${i * 0.1}s`}
                />
              </path>
              
              {/* Flowing energy - cleaner circles */}
              {i % 3 === 0 && (
                <circle r="5" fill="#00FFFF" opacity="0.9" filter="url(#sharp-glow)">
                  <animateMotion
                    dur={`${3 + Math.random()}s`}
                    repeatCount="indefinite"
                    path={root.path}
                    begin={`${Math.random() * 2}s`}
                  />
                </circle>
              )}
            </g>
          ))}
        </g>

        {/* Algorithm blocks - crisp text */}
        <g className="algorithm-blocks">
          {rootBlocks.map(block => (
            <g key={block.id} transform={`translate(${400 + block.offsetX}, ${500 + block.y})`}>
              <rect
                x="-50"
                y="-15"
                width="100"
                height="30"
                fill="rgba(0, 30, 60, 0.85)"
                stroke={block.type === 'packet' ? '#00FFFF' : '#0080FF'}
                strokeWidth="2"
                rx="4"
                opacity={block.opacity}
              />
              
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fill={block.type === 'symbol' ? '#FFD700' : '#00FFFF'}
                fontSize="20"
                fontFamily="monospace"
                fontWeight="bold"
                opacity={block.opacity}
              >
                {block.text}
              </text>
            </g>
          ))}
        </g>

        {/* Tree branches - sharp and defined */}
        <g className="branches">
          {treeGeometry.branches.map((branch, i) => (
            <g key={`branch-${i}`}>
              <path
                d={branch.path}
                fill="none"
                stroke="url(#branch-gradient)"
                strokeWidth={branch.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="1"
                filter={branch.level === 0 ? "url(#subtle-glow)" : "none"}
              />
              
              {/* Pulse effect on main branches only */}
              {branch.level < 2 && (
                <path
                  d={branch.path}
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0"
                  strokeDasharray="10 5"
                >
                  <animate 
                    attributeName="opacity"
                    values="0;0.6;0"
                    dur="2s"
                    repeatCount="indefinite"
                    begin={`${i * 0.2}s`}
                  />
                  <animate 
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="15"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
              )}
            </g>
          ))}
        </g>

        {/* Neural flow particles - sharp with subtle glow */}
        {branchParticles.map(particle => (
          <g key={particle.id}>
            <circle
              r={particle.size}
              fill={particle.color}
              opacity="0.9"
              filter="url(#sharp-glow)"
            >
              <animateMotion
                dur={`${particle.duration}s`}
                repeatCount="indefinite"
                path={particle.path}
                begin={`${particle.delay}s`}
              />
            </circle>
          </g>
        ))}

        {/* Branch nodes - defined and pulsing */}
        {treeGeometry.branches
          .filter((b, i) => b.level > 0 && b.level < 3 && i % 5 === 0)
          .map((branch, i) => {
            const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathEl.setAttribute('d', branch.path);
            const point = pathEl.getPointAtLength?.(pathEl.getTotalLength?.() || 0) || { x: 400, y: 300 };
            
            return (
              <g key={`node-${i}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  fill="#FFFFFF"
                  filter="url(#sharp-glow)"
                >
                  <animate
                    attributeName="r"
                    values="5;8;5"
                    dur="2s"
                    repeatCount="indefinite"
                    begin={`${i * 0.3}s`}
                  />
                </circle>
                
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="10"
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth="2"
                  opacity="0"
                >
                  <animate
                    attributeName="r"
                    values="6;15;6"
                    dur="2s"
                    repeatCount="indefinite"
                    begin={`${i * 0.3}s`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.7;0"
                    dur="2s"
                    repeatCount="indefinite"
                    begin={`${i * 0.3}s`}
                  />
                </circle>
              </g>
            );
          })}
      </svg>

      {/* Matrix rain overlay */}
      <MatrixRain />
    </div>
  );
};

export default AnimatedNeuralTree;
