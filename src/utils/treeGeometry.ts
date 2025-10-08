// Generate realistic tree branch paths using recursive bifurcation

export interface BranchPath {
  path: string;
  level: number;
  strokeWidth: number;
}

export interface TreeGeometry {
  branches: BranchPath[];
  roots: BranchPath[];
}

function generateBranch(
  startX: number,
  startY: number,
  length: number,
  angle: number,
  depth: number,
  maxDepth: number,
  paths: BranchPath[] = []
): BranchPath[] {
  if (depth > maxDepth || length < 8) return paths;

  // Calculate end point
  const endX = startX + length * Math.cos(angle);
  const endY = startY + length * Math.sin(angle);

  // Create curved path with control points for organic look
  const controlX = startX + (length * 0.4) * Math.cos(angle + 0.1);
  const controlY = startY + (length * 0.4) * Math.sin(angle + 0.1);

  const path = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
  const strokeWidth = Math.max(2, 14 - depth * 1.8);

  paths.push({ path, level: depth, strokeWidth });

  // Generate child branches
  if (depth < maxDepth) {
    const numChildren = depth < 2 ? 3 : 2;
    const angleSpread = depth < 2 ? 35 : 30;
    const lengthReduction = 0.65;

    for (let i = 0; i < numChildren; i++) {
      const childAngle = angle + (Math.random() - 0.5) * (angleSpread * Math.PI / 180);
      const childLength = length * lengthReduction * (0.9 + Math.random() * 0.2);
      
      generateBranch(endX, endY, childLength, childAngle, depth + 1, maxDepth, paths);
    }
  }

  return paths;
}

function generateRoot(
  startX: number,
  startY: number,
  length: number,
  angle: number,
  depth: number,
  maxDepth: number,
  paths: BranchPath[] = []
): BranchPath[] {
  if (depth > maxDepth || length < 10) return paths;

  const endX = startX + length * Math.cos(angle);
  const endY = startY + length * Math.sin(angle);

  const controlX = startX + (length * 0.5) * Math.cos(angle - 0.15);
  const controlY = startY + (length * 0.5) * Math.sin(angle - 0.15);

  const path = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
  const strokeWidth = Math.max(3, 16 - depth * 2);

  paths.push({ path, level: depth, strokeWidth });

  if (depth < maxDepth) {
    const numChildren = depth < 2 ? 2 : 2;
    const angleSpread = 40;
    const lengthReduction = 0.7;

    for (let i = 0; i < numChildren; i++) {
      const childAngle = angle + (Math.random() - 0.5) * (angleSpread * Math.PI / 180);
      const childLength = length * lengthReduction * (0.85 + Math.random() * 0.3);
      
      generateRoot(endX, endY, childLength, childAngle, depth + 1, maxDepth, paths);
    }
  }

  return paths;
}

export function generateKalpavrikshaTree(): TreeGeometry {
  const trunkBase = { x: 400, y: 420 };
  const branches: BranchPath[] = [];
  const roots: BranchPath[] = [];

  // Main trunk
  const trunkPath = `M ${trunkBase.x} ${trunkBase.y} L ${trunkBase.x} ${trunkBase.y - 120}`;
  branches.push({ path: trunkPath, level: 0, strokeWidth: 18 });

  // Generate branches from trunk top
  const branchStartY = trunkBase.y - 120;
  const initialAngles = [-65, -45, -25, 25, 45, 65];
  
  initialAngles.forEach(angleDeg => {
    const angle = (angleDeg - 90) * Math.PI / 180;
    generateBranch(trunkBase.x, branchStartY, 90, angle, 1, 5, branches);
  });

  // Main root trunk going down
  const rootTrunkPath = `M ${trunkBase.x} ${trunkBase.y} L ${trunkBase.x} ${trunkBase.y + 80}`;
  roots.push({ path: rootTrunkPath, level: 0, strokeWidth: 16 });

  // Generate roots spreading outward
  const rootStartY = trunkBase.y + 80;
  const rootAngles = [-115, -95, -75, 75, 95, 115];
  
  rootAngles.forEach(angleDeg => {
    const angle = (angleDeg - 90) * Math.PI / 180;
    generateRoot(trunkBase.x, rootStartY, 85, angle, 1, 4, roots);
  });

  return { branches, roots };
}
