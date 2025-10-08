const AnimatedNeuralTree = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 800 1000"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 0 30px hsl(var(--primary) / 0.5))" }}
      >
        {/* Define gradients and filters */}
        <defs>
          <linearGradient id="branchGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--primary-glow))", stopOpacity: 0.6 }} />
          </linearGradient>
          
          <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }}>
              <animate attributeName="stop-color" values="hsl(var(--primary));hsl(var(--secondary));hsl(var(--primary))" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" style={{ stopColor: "hsl(var(--secondary))", stopOpacity: 1 }}>
              <animate attributeName="stop-color" values="hsl(var(--secondary));hsl(var(--primary));hsl(var(--secondary))" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Root System */}
        <g className="roots" opacity="0.6">
          <path d="M 400 900 Q 350 950 300 1000" stroke="url(#branchGradient)" strokeWidth="3" fill="none" strokeLinecap="round" className="animate-tree-grow" style={{ strokeDasharray: 1000 }} />
          <path d="M 400 900 Q 400 950 400 1000" stroke="url(#branchGradient)" strokeWidth="4" fill="none" strokeLinecap="round" className="animate-tree-grow" style={{ strokeDasharray: 1000, animationDelay: "0.2s" }} />
          <path d="M 400 900 Q 450 950 500 1000" stroke="url(#branchGradient)" strokeWidth="3" fill="none" strokeLinecap="round" className="animate-tree-grow" style={{ strokeDasharray: 1000, animationDelay: "0.1s" }} />
        </g>

        {/* Main Trunk */}
        <path 
          d="M 400 900 L 400 600" 
          stroke="url(#branchGradient)" 
          strokeWidth="12" 
          fill="none" 
          strokeLinecap="round"
          className="animate-tree-grow"
          style={{ strokeDasharray: 1000, animationDelay: "0.3s" }}
        />

        {/* Main Branches - Left Side */}
        <path d="M 400 700 Q 300 650 200 600" stroke="url(#neuralGradient)" strokeWidth="6" fill="none" strokeLinecap="round" filter="url(#glow)" className="animate-tree-grow" style={{ strokeDasharray: 1000, animationDelay: "0.5s" }} />
        <path d="M 400 600 Q 250 550 150 500" stroke="url(#neuralGradient)" strokeWidth="5" fill="none" strokeLinecap="round" filter="url(#glow)" className="animate-tree-grow" style={{ strokeDasharray: 1000, animationDelay: "0.6s" }} />
        <path d="M 400 500 Q 300 450 200 400" stroke="url(#neuralGradient)" strokeWidth="4" fill="none" strokeLinecap="round" filter="url(#glow)" className="animate-tree-grow" style={{ strokeDasharray: 1000, animationDelay: "0.7s" }} />

        {/* Main Branches - Right Side */}
        <path d="M 400 700 Q 500 650 600 600" stroke="url(#neuralGradient)" strokeWidth="6" fill="none" strokeLinecap="round" filter="url(#glow)" className="animate-tree-grow" style={{ strokeDasharray: 1000, animationDelay: "0.5s" }} />
        <path d="M 400 600 Q 550 550 650 500" stroke="url(#neuralGradient)" strokeWidth="5" fill="none" strokeLinecap="round" filter="url(#glow)" className="animate-tree-grow" style={{ strokeDasharray: 1000, animationDelay: "0.6s" }} />
        <path d="M 400 500 Q 500 450 600 400" stroke="url(#neuralGradient)" strokeWidth="4" fill="none" strokeLinecap="round" filter="url(#glow)" className="animate-tree-grow" style={{ strokeDasharray: 1000, animationDelay: "0.7s" }} />

        {/* Secondary Branches - Creating Dense Neural Network */}
        <path d="M 200 600 Q 150 550 100 500" stroke="url(#neuralGradient)" strokeWidth="2" fill="none" filter="url(#glow)" className="animate-tree-grow" style={{ strokeDasharray: 1000, animationDelay: "0.8s" }} />
        <path d="M 200 600 Q 200 550 180 500" stroke="url(#neuralGradient)" strokeWidth="2" fill="none" filter="url(#glow)" className="animate-tree-grow" style={{ strokeDasharray: 1000, animationDelay: "0.9s" }} />
        <path d="M 600 600 Q 650 550 700 500" stroke="url(#neuralGradient)" strokeWidth="2" fill="none" filter="url(#glow)" className="animate-tree-grow" style={{ strokeDasharray: 1000, animationDelay: "0.8s" }} />
        <path d="M 600 600 Q 600 550 620 500" stroke="url(#neuralGradient)" strokeWidth="2" fill="none" filter="url(#glow)" className="animate-tree-grow" style={{ strokeDasharray: 1000, animationDelay: "0.9s" }} />

        {/* Upper Branches */}
        <path d="M 400 500 Q 350 400 300 300" stroke="url(#neuralGradient)" strokeWidth="3" fill="none" filter="url(#glow)" className="animate-tree-grow" style={{ strokeDasharray: 1000, animationDelay: "1s" }} />
        <path d="M 400 500 Q 450 400 500 300" stroke="url(#neuralGradient)" strokeWidth="3" fill="none" filter="url(#glow)" className="animate-tree-grow" style={{ strokeDasharray: 1000, animationDelay: "1s" }} />
        <path d="M 400 500 Q 380 350 360 200" stroke="url(#neuralGradient)" strokeWidth="2.5" fill="none" filter="url(#glow)" className="animate-tree-grow" style={{ strokeDasharray: 1000, animationDelay: "1.1s" }} />
        <path d="M 400 500 Q 420 350 440 200" stroke="url(#neuralGradient)" strokeWidth="2.5" fill="none" filter="url(#glow)" className="animate-tree-grow" style={{ strokeDasharray: 1000, animationDelay: "1.1s" }} />

        {/* Electric Pulse Nodes */}
        {[
          { cx: 400, cy: 700, delay: "0s" },
          { cx: 200, cy: 600, delay: "0.5s" },
          { cx: 600, cy: 600, delay: "0.7s" },
          { cx: 150, cy: 500, delay: "1s" },
          { cx: 650, cy: 500, delay: "1.2s" },
          { cx: 300, cy: 300, delay: "1.5s" },
          { cx: 500, cy: 300, delay: "1.7s" },
          { cx: 360, cy: 200, delay: "2s" },
          { cx: 440, cy: 200, delay: "2.2s" },
        ].map((node, i) => (
          <g key={i}>
            <circle
              cx={node.cx}
              cy={node.cy}
              r="6"
              fill="hsl(var(--primary))"
              className="animate-glow-intense"
              style={{ animationDelay: node.delay }}
            />
            <circle
              cx={node.cx}
              cy={node.cy}
              r="3"
              fill="hsl(var(--secondary))"
              className="animate-spark"
              style={{ animationDelay: node.delay }}
            />
          </g>
        ))}

        {/* Traveling Electric Pulses */}
        {[...Array(12)].map((_, i) => (
          <circle
            key={`pulse-${i}`}
            r="4"
            fill="hsl(var(--secondary))"
            filter="url(#glow)"
            className="animate-electric-pulse"
            style={{ 
              animationDelay: `${i * 0.3}s`,
              opacity: 0.8,
            }}
          >
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              begin={`${i * 0.3}s`}
              path="M 400 900 L 400 600 Q 300 550 200 500"
            />
          </circle>
        ))}

        {[...Array(12)].map((_, i) => (
          <circle
            key={`pulse-right-${i}`}
            r="4"
            fill="hsl(var(--secondary))"
            filter="url(#glow)"
            className="animate-electric-pulse"
            style={{ 
              animationDelay: `${i * 0.3 + 0.15}s`,
              opacity: 0.8,
            }}
          >
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              begin={`${i * 0.3 + 0.15}s`}
              path="M 400 900 L 400 600 Q 500 550 600 500"
            />
          </circle>
        ))}
      </svg>
    </div>
  );
};

export default AnimatedNeuralTree;
