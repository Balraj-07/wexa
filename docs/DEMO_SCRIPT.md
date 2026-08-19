# CareerGraph recording script (3-5 minutes)

Replace `HOSTED_URL` before recording. Keep the browser on the hosted client URL and use the seeded Maya profile unless a different result is needed.

## 1. Use case (10-20 seconds)

**Show:** Dashboard.

**Say:**

"CareerGraph helps a learner turn a target role into a practical next step. It connects a person's current skills to roles, prerequisite skills, portfolio projects, and learning resources. Instead of looking at an isolated skills list, we can see how each item relates to the rest of the career graph."

## 2. Main UI (30-60 seconds)

**Show:** Dashboard, then the sidebar navigation.

**Say:**

"The dashboard starts with Maya's strongest role match, the number of roles found by the graph, and her priority skill gaps. The role list shows matching skills and a percentage score. The focus panel turns gaps into concrete skills to work on."

Open **Roles**, select **Full Stack Developer**, and briefly show its required skills, projects, resources, and relationship graph.

**Say:**

"On a role page, the graph makes the result inspectable. A role connects to the skills it requires, projects that demonstrate those skills, and resources that help close the gaps. Nodes can be selected, and the graph can be zoomed or panned."

## 3. Multi-hop recommendation (30-60 seconds)

**Show:** **Career path**.

Choose **JavaScript** as the start skill and **Express.js** as the target, then click **Map my path**.

**Say:**

"This is a multi-hop traversal, not a hard-coded lesson list. The graph follows prerequisite relationships from JavaScript through Node.js to Express.js and returns the shortest directed path. The number of relationship hops is shown above the result."

Then open **My career** and show the ranked role recommendations.

**Say:**

"The same connected data powers recommendations: Maya's owned skills are compared with each role's required skills, and the roles are ranked by coverage."

## 4. Results changing through relationships (30-60 seconds)

**Show:** **My career**, switching from Maya to Liam or Noah.

**Say:**

"The results change when the user changes. Liam's Python, SQL, Pandas, and Statistics relationships surface data-oriented roles, while Noah's Linux, Git, Docker, and Cloud relationships surface infrastructure roles. The recommendation list, readiness percentages, reachable roles, and skill pills all update from the graph."

Return to **Career path**, choose a different target such as **React** or **AWS**, and map it.

**Say:**

"Changing the target also changes the traversal. The graph returns a different sequence when a different destination is selected, and it reports when no directed prerequisite path exists."

## 5. Why a graph database (30-60 seconds)

**Show:** the role graph, then `server/queries/skills.js` or `server/queries/users.js` in the repository.

**Say:**

"The data model is relationship-first: users have skills, roles require skills, projects demonstrate skills, and skills lead to other skills. A graph database lets the API ask questions such as 'what roles are reachable within three prerequisite hops?' directly with traversal syntax. In a relational model, this would require several joins, recursive queries, and application-side path assembly."

Optionally show this simplified query shape:

```cypher
MATCH path = (start:Skill {id:$fromSkillId})
	-[:PREREQUISITE_OF*1..4]->
	(target:Skill {id:$toSkillId})
RETURN nodes(path) AS pathNodes, length(path) AS hops
ORDER BY hops
LIMIT 1
```

## 6. Hosted URL (10 seconds)

**Show:** browser address bar with the deployed client URL.

**Say:**

"This is the hosted CareerGraph application. The browser talks to the React client, which calls the Express API, and the API queries CognoDB without exposing database credentials."

**Display:** `HOSTED_URL`

## Recording checklist

- Seed the database before recording so roles, skills, projects, resources, and profiles are populated.
- Confirm the client and API are deployed and the API health endpoint responds at `/api/health`.
- Have the Dashboard, Full Stack Developer role, Career path, and My career views ready in separate tabs.
- Replace `HOSTED_URL` with the actual deployment URL.
