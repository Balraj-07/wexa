export const listRoles = `MATCH (r:Role) OPTIONAL MATCH (r)-[:REQUIRES]->(s:Skill) RETURN r, count(s) AS skillCount ORDER BY r.name`;
export const roleById = `MATCH (r:Role {id:$roleId}) RETURN r`;
export const roleSkills = `MATCH (r:Role {id:$roleId})-[rel:REQUIRES]->(s:Skill) RETURN s, rel.importance AS importance ORDER BY rel.importance DESC, s.name`;
export const roleProjects = `MATCH (p:Project)-[:RECOMMENDED_FOR]->(r:Role {id:$roleId}) OPTIONAL MATCH (p)-[:DEMONSTRATES]->(s:Skill)<-[:REQUIRES]-(r) RETURN p, collect(s.name) AS matchingSkills, count(s) AS coverage ORDER BY coverage DESC`;
export const roleResources = `MATCH (r:Role {id:$roleId})-[:REQUIRES]->(s:Skill)-[:LEARNED_FROM]->(resource:Resource) RETURN resource, collect(DISTINCT s.name) AS coveredSkills ORDER BY resource.title`;
export const listProjects = `MATCH (p:Project) RETURN p ORDER BY p.name`;
export const listResources = `MATCH (r:Resource) RETURN r ORDER BY r.title`;
