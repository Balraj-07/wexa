import { Router } from 'express';
import * as c from '../controllers/api.js';

const router = Router();

const route = (handler) =>
  (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);

// Health
router.get('/health', route(c.health));

// Roles
router.get('/roles', route(c.getRoles));
router.get('/roles/:id', route(c.getRole));
router.get('/roles/:id/skills', route(c.getRoleSkills));
router.get('/roles/:id/projects', route(c.getRoleProjects));
router.get('/roles/:id/resources', route(c.getRoleResources));

// Projects & Resources
router.get('/projects', route(c.getProjects));
router.get('/resources', route(c.getResources));

// Skills
router.get('/skills', route(c.getSkills));
router.get('/skills/:id', route(c.getSkill));
router.get('/skills/:id/traversal', route(c.getSkillTraversal));

// Learning path
// IMPORTANT: controller uses req.params.skillId
router.get('/skills/:skillId/path', route(c.getLearningPath));

// Users
router.get('/users', route(c.getUsers));
router.post('/users', route(c.createUser));
router.get('/users/:id', route(c.getUser));
router.put('/users/:id', route(c.updateUser));
router.delete('/users/:id', route(c.deleteUser));
router.get('/users/:id/skills', route(c.getUserSkills));
router.get(
  '/users/:id/career-recommendations',
  route(c.getCareer)
);
router.get(
  '/users/:id/missing-skills/:roleId',
  route(c.getMissing)
);
router.get(
  '/users/:id/learning-path/:skillId',
  route(c.getLearningPath)
);

// Graph
router.get('/graph/explore', route(c.getGraph));
router.get('/graph/reachable-roles', route(c.getReachable));

export default router;