# Architecture notes

The API keeps a lazy official Neo4j driver and creates a short-lived session for each query, avoiding session sharing while retaining driver connection pooling. Query modules contain only parameterized Cypher. The React client calls the REST API and never receives CognoDB credentials.

`PREREQUISITE_OF` is directed from foundation to the capability it unlocks. A JavaScript → Node.js → Express.js learning path follows the relationship forward; the skill explorer follows it backward for prerequisite display.

The learner profile uses `PUT /api/users/:id/skills/:skillId` to create or update a `HAS_SKILL` relationship and `DELETE` on the same route to remove it. Writes use a Neo4j WRITE session; proficiency values are validated by the API before a parameterized query is run. Recommendation and reachability reads run again after each profile update.

The Career Path page first requests the directed prerequisite path. If none exists between skills in different categories, it displays an explicit domain-transition planning step followed by the target skill's longest available prerequisite trail (from the skill traversal endpoint). The UI labels that transition as a planning step, not a stored graph relationship.

Courses are `Resource` nodes with `type: 'Course'`. `POST /api/courses` creates the node and its `Skill`-to-course `LEARNED_FROM` edges in one parameterized write query; `GET /api/courses` returns each course and its mapped skills. Course creation is intentionally unauthenticated for the demo, so deployments that should not accept public contributions must protect that endpoint.
