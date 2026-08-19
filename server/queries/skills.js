export const listSkills = `
  MATCH (s:Skill)
  RETURN s
  ORDER BY s.name
`;

export const skillById = `
  MATCH (s:Skill {id: $skillId})

  OPTIONAL MATCH (s)-[:PREREQUISITE_OF*1..3]->(next:Skill)
  WITH s, collect(DISTINCT next) AS descendants

  OPTIONAL MATCH (prior:Skill)-[:PREREQUISITE_OF*1..3]->(s)

  RETURN
    s,
    descendants,
    collect(DISTINCT prior) AS prerequisites
`;

export const skillTraversal = `
  MATCH p =
    (start:Skill {id: $skillId})
    <-[:PREREQUISITE_OF*1..4]-
    (ancestor:Skill)

  RETURN
    [n IN nodes(p) | {
      id: n.id,
      name: n.name,
      category: n.category
    }] AS nodes,
    length(p) AS hops

  ORDER BY hops DESC
  LIMIT 12
`;

/*
 * Learning path.
 *
 * Do not use shortestPath(), because the project is intended
 * to remain compatible with openCypher implementations that
 * may not support it.
 *
 * We generate paths up to 10 hops and choose the shortest one.
 */
export const skillPath = `
  MATCH (from:Skill {id: $fromSkillId})
  MATCH (to:Skill {id: $toSkillId})

  MATCH p =
    (from)-[:PREREQUISITE_OF*1..10]->(to)

  WITH p
  ORDER BY length(p) ASC

  LIMIT 1

  RETURN
    nodes(p) AS pathNodes,
    length(p) AS hops
`;