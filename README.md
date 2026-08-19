# 🚀 CareerGraph — AI-Powered Career & Skill Graph Explorer

> A graph-powered platform that helps learners discover career roles, identify skill gaps, explore prerequisites, and find learning paths.

CareerGraph connects **users, skills, roles, projects, prerequisites, and learning resources** using **CognoDB Cloud** and graph relationships.

## ✨ Features

* 💼 Explore 15+ career roles
* 🧠 Explore skills and prerequisites
* 🗺️ Find shortest learning paths
* 🎯 Identify skill gaps for target roles
* 🛠️ Match projects with required skills
* 📚 Discover learning resources
* 📊 Interactive career/skill graph
* 👤 User CRUD operations
* 🔐 Validation, error handling, and secure API design
* 🧪 API and CRUD tests

## 🛠️ Tech Stack

**Frontend:** React, Vite, JavaScript, Axios
**Backend:** Node.js, Express.js, REST API
**Database:** CognoDB Cloud, Neo4j Driver, openCypher
**Deployment:** Vercel + Render/Railway

## 🕸️ Graph Model

```text
User ──HAS_SKILL──> Skill
Role ──REQUIRES──> Skill
Skill ──PREREQUISITE_OF──> Skill
Project ──DEMONSTRATES──> Skill
Skill ──LEARNED_FROM──> Resource
Project ──RECOMMENDED_FOR──> Role
Role ──RELATED_TO──> Role
```

The project uses graph traversal for multi-hop prerequisites, skill-gap analysis, career paths, and project-role matching.

## 📊 Seed Data

| Entity    | Count |
| --------- | ----: |
| Roles     |    15 |
| Skills    |    40 |
| Projects  |    20 |
| Resources |    25 |
| Profiles  |     8 |

All seed data uses:

```text
seed: "careergraph"
```

## 🔌 REST API

```http
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

Example:

```json
{
  "id": "maya",
  "name": "Maya Patel"
}
```

## 🏗️ Architecture

```text
React + Vite
     │
     ▼
Express REST API
     │
     ▼
CognoDB Cloud
```

Database credentials remain **backend-only** and are never exposed to the frontend.

## ⚙️ Run Locally

### 1. Configure environment

```bash
cp .env.example .env
```

```env
COGNODB_URI=your_bolt_uri
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=your_password
CLIENT_ORIGIN=http://localhost:5173
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Seed database

```bash
npm run seed
```

### 4. Start application

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## 🧪 Testing

```bash
npm run test
```

## 🚀 Production Build

```bash
npm run build
```

### Deployment

* **Frontend:** Vercel
* **Backend:** Render / Railway
* **Database:** CognoDB Cloud

## 🔒 Security

* Parameterized Cypher queries
* Helmet
* CORS
* Environment variables
* Input validation
* Sanitized API errors
* Backend-only database credentials

## 📁 Structure

```text
client/       → React frontend
server/       → Express API & graph queries
scripts/      → Database seed
docs/         → Architecture & demo documentation
```

## 🔮 Future Enhancements

* AI-powered career recommendations
* Resume skill extraction
* Personalized learning roadmaps
* Job-market integration
* Career readiness scoring
* Authentication & role-based access

## 👨‍💻 Author

**Balraj**
Computer Science Engineering | 2026 Graduate

---

⭐ **Built with React + Express + CognoDB Cloud + Graph Thinking**
