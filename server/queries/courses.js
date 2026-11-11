export const listCourses = `
  MATCH (course:Resource {type: 'Course'})
  OPTIONAL MATCH (skill:Skill)-[:LEARNED_FROM]->(course)
  RETURN course, collect(skill) AS skills
  ORDER BY course.title
`;

export const createCourse = `
  UNWIND $skillIds AS skillId
  MATCH (skill:Skill {id: skillId})
  WITH collect(skill) AS skills
  WHERE size(skills) = size($skillIds)
  CREATE (course:Resource {
    id: $id,
    title: $title,
    url: $url,
    provider: $provider,
    description: $description,
    type: 'Course'
  })
  FOREACH (skill IN skills |
    MERGE (skill)-[:LEARNED_FROM]->(course)
  )
  RETURN course, skills
`;
