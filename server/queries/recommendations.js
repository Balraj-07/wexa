export const recommendedProjects = `MATCH (p:Project)-[:RECOMMENDED_FOR]->(r:Role {id:$roleId}) MATCH (p)-[:DEMONSTRATES]->(s:Skill)<-[:REQUIRES]-(r) RETURN p, collect(s.name) AS matchingSkills, count(s) AS coverage ORDER BY coverage DESC, p.name`;
// Relationship-oriented discovery: user skills flow through prerequisite chains to role requirements.
export const reachableRoles = `MATCH (u:User {id:$userId})-[:HAS_SKILL]->(owned:Skill)
MATCH p=(owned)-[:PREREQUISITE_OF*0..3]->(required:Skill)<-[:REQUIRES]-(r:Role)
WITH r, collect(DISTINCT required.name) AS reachableSkills, min(length(p)) AS nearestHops
MATCH (r)-[:REQUIRES]->(requiredSkill:Skill)
WITH r, reachableSkills, nearestHops, count(requiredSkill) AS totalSkills
RETURN r, reachableSkills, totalSkills, nearestHops,
       round(100.0 * size(reachableSkills) / totalSkills) AS coverage
ORDER BY coverage DESC, nearestHops
LIMIT 10`;
