export const users = `MATCH (u:User) RETURN u ORDER BY u.name`;
export const userById = `MATCH (u:User {id:$userId}) RETURN u`;
export const userSkills = `MATCH (u:User {id:$userId})-[h:HAS_SKILL]->(s:Skill) RETURN s, h.level AS level ORDER BY s.name`;
export const setUserSkill = `MATCH (u:User {id:$userId}), (s:Skill {id:$skillId}) MERGE (u)-[h:HAS_SKILL]->(s) SET h.level = $level RETURN s, h.level AS level`;
export const removeUserSkill = `MATCH (u:User {id:$userId})-[h:HAS_SKILL]->(s:Skill {id:$skillId}) DELETE h RETURN s`;
export const missingSkills = `MATCH (u:User {id:$userId}), (r:Role {id:$roleId})-[:REQUIRES]->(s:Skill) WHERE NOT (u)-[:HAS_SKILL]->(s) OPTIONAL MATCH (s)-[:LEARNED_FROM]->(resource:Resource) RETURN s, collect({id:resource.id,title:resource.title,type:resource.type,url:resource.url,provider:resource.provider}) AS resources ORDER BY s.name`;
export const careerRecommendations = `MATCH (u:User {id:$userId}) OPTIONAL MATCH (u)-[:HAS_SKILL]->(owned:Skill) WITH u, collect(owned) AS owned MATCH (r:Role)-[:REQUIRES]->(required:Skill) WITH r, owned, collect(required) AS required WITH r, [s IN required WHERE s IN owned] AS matching, required RETURN r, [s IN matching | s.name] AS matchingSkills, size(required) AS totalSkills, round(100.0 * size(matching) / size(required)) AS matchPercentage ORDER BY matchPercentage DESC, r.name LIMIT 8`;
