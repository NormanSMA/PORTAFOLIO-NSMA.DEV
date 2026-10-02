import { describe, it, expect } from 'vitest';
import { skillGroups } from '../../../data/skills';
import { techGraph } from './constellationGraph';

describe('techGraph', () => {
  const skills = skillGroups.flatMap((group) => group.skills);

  it('contiene exactamente las tecnologias del CV, una vez cada una', () => {
    expect(techGraph.nodes.map((node) => node.name).sort()).toEqual(skills.map((skill) => skill.name).sort());
  });

  it('no incluye Java', () => {
    expect(techGraph.nodes.map((node) => node.name)).not.toContain('Java');
  });

  it('un punto en la esfera y al menos tres conexiones por nodo', () => {
    expect(techGraph.points).toHaveLength(techGraph.nodes.length);
    techGraph.nodes.forEach((_, index) => {
      const links = techGraph.edges.filter(([a, b]) => a === index || b === index);
      expect(links.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('mezcla los grupos: dos nodos seguidos no salen del mismo grupo', () => {
    const groupOf = new Map(skillGroups.flatMap((group) => group.skills.map((skill) => [skill.name, group.id] as const)));
    for (let index = 1; index < 6; index += 1) {
      expect(groupOf.get(techGraph.nodes[index].name)).not.toBe(groupOf.get(techGraph.nodes[index - 1].name));
    }
  });
});
