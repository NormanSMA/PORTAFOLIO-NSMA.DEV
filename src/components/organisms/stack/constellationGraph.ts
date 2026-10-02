import { skillGroups } from '../../../data/skills';
import type { TechId } from '../../../data/techIcons';
import { fibonacciSphere, interleave, nearestNeighbors, type Edge, type Vec3 } from './constellationMath';

export interface ConstellationNode {
  tech: TechId;
  name: string;
}

// Static for the whole session: rotating the sphere never changes who is next to whom.
export interface ConstellationGraph {
  nodes: ConstellationNode[];
  points: Vec3[];
  edges: Edge[];
}

const NEIGHBORS_PER_NODE = 3;

export function buildGraph(nodes: ConstellationNode[]): ConstellationGraph {
  const points = fibonacciSphere(nodes.length);
  return { nodes, points, edges: nearestNeighbors(points, NEIGHBORS_PER_NODE) };
}

export const techGraph = buildGraph(
  interleave(skillGroups.map((group) => group.skills.map(({ tech, name }) => ({ tech, name })))),
);
