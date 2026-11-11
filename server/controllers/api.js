import { randomUUID } from 'node:crypto';
import { runQuery, runWriteQuery, verifyConnection } from '../config/database.js';
import * as roles from '../queries/roles.js';
import * as skills from '../queries/skills.js';
import * as users from '../queries/users.js';
import * as recs from '../queries/recommendations.js';
import * as courses from '../queries/courses.js';
import { exploreRole } from '../queries/graph.js';

const value = (record, key) => record.get(key);
const node = (record, key) => ({ ...value(record, key).properties });
const integer = (v) => (typeof v?.toNumber === 'function' ? v.toNumber() : v);
const rows = (result, mapper) => result.records.map(mapper);
const skillLevels = new Set(['Beginner', 'Working knowledge', 'Proficient', 'Advanced']);
const badRequest = (message) => Object.assign(new Error(message), { status: 400 });
const requireId = async (query, idName, id) => {
  const result = await runQuery(query, { [idName]: id });
  if (!result.records.length) throw Object.assign(new Error('Not found'), { status: 404 });
  return result;
};

export const health = async (_req, res) => {
  await verifyConnection();
  res.json({ status: 'ok', database: 'connected' });
};
export const getRoles = async (_req, res) => {
  const r = await runQuery(roles.listRoles);
  res.json(
    rows(r, (x) => ({
      ...node(x, 'r'),
      skillCount: integer(value(x, 'skillCount')),
    }))
  );
};
export const getRole = async (req, res) => {
  const r = await requireId(roles.roleById, 'roleId', req.params.id);
  res.json(node(r.records[0], 'r'));
};
export const getRoleSkills = async (req, res) => {
  const r = await requireId(roles.roleSkills, 'roleId', req.params.id);
  res.json(rows(r, (x) => ({ ...node(x, 's'), importance: value(x, 'importance') })));
};
export const getRoleProjects = async (req, res) => {
  const r = await runQuery(roles.roleProjects, { roleId: req.params.id });
  res.json(
    rows(r, (x) => ({
      ...node(x, 'p'),
      matchingSkills: value(x, 'matchingSkills'),
      coverage: integer(value(x, 'coverage')),
    }))
  );
};
export const getRoleResources = async (req, res) => {
  const r = await runQuery(roles.roleResources, { roleId: req.params.id });
  res.json(
    rows(r, (x) => ({
      ...node(x, 'resource'),
      coveredSkills: value(x, 'coveredSkills'),
    }))
  );
};
export const getProjects = async (_req, res) => {
  const r = await runQuery(roles.listProjects);
  res.json(rows(r, (x) => node(x, 'p')));
};
export const getResources = async (_req, res) => {
  const r = await runQuery(roles.listResources);
  res.json(rows(r, (x) => node(x, 'r')));
};
export const getCourses = async (_req, res) => {
  const r = await runQuery(courses.listCourses);
  res.json(
    rows(r, (x) => ({
      ...node(x, 'course'),
      skills: value(x, 'skills')
        .filter(Boolean)
        .map((skill) => skill.properties),
    }))
  );
};
export const createCourse = async (req, res) => {
  const { title, url, provider = '', description = '', skillIds } = req.body ?? {};
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 160)
    throw badRequest('title is required and must be 160 characters or fewer.');
  if (typeof url !== 'string' || url.length > 2048) {
    throw badRequest('A valid http or https course URL is required.');
  }
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw badRequest('A valid http or https course URL is required.');
  }
  if (!['http:', 'https:'].includes(parsedUrl.protocol))
    throw badRequest('Course URL must use http or https.');
  if (typeof provider !== 'string' || provider.length > 120)
    throw badRequest('provider must be 120 characters or fewer.');
  if (typeof description !== 'string' || description.length > 1000)
    throw badRequest('description must be 1000 characters or fewer.');
  if (
    !Array.isArray(skillIds) ||
    skillIds.length === 0 ||
    skillIds.length > 40 ||
    skillIds.some((id) => typeof id !== 'string' || !id.trim())
  )
    throw badRequest('Select at least one valid skill for this course.');

  const uniqueSkillIds = [...new Set(skillIds)];
  const result = await runWriteQuery(courses.createCourse, {
    id: randomUUID(),
    title: title.trim(),
    url: parsedUrl.toString(),
    provider: provider.trim(),
    description: description.trim(),
    skillIds: uniqueSkillIds,
  });
  if (!result.records.length)
    throw badRequest('One or more selected skills do not exist.');

  const record = result.records[0];
  res.status(201).json({
    ...node(record, 'course'),
    skills: value(record, 'skills').map((skill) => skill.properties),
  });
};
export const getSkills = async (_req, res) => {
  const r = await runQuery(skills.listSkills);
  res.json(rows(r, (x) => node(x, 's')));
};
export const getSkill = async (req, res) => {
  const r = await requireId(skills.skillById, 'skillId', req.params.id);
  const x = r.records[0];
  res.json({
    ...node(x, 's'),
    descendants: value(x, 'descendants').map((n) => n.properties),
    prerequisites: value(x, 'prerequisites').map((n) => n.properties),
  });
};
export const getSkillTraversal = async (req, res) => {
  const r = await runQuery(skills.skillTraversal, { skillId: req.params.id });
  res.json(
    rows(r, (x) => ({
      nodes: value(x, 'nodes'),
      hops: integer(value(x, 'hops')),
    }))
  );
};
export const getUsers = async (_req, res) => {
  const r = await runQuery(users.users);
  res.json(rows(r, (x) => node(x, 'u')));
};
export const getUser = async (req, res) => {
  const r = await requireId(users.userById, 'userId', req.params.id);
  res.json(node(r.records[0], 'u'));
};
export const getUserSkills = async (req, res) => {
  const r = await runQuery(users.userSkills, { userId: req.params.id });
  res.json(rows(r, (x) => ({ ...node(x, 's'), level: value(x, 'level') })));
};
export const setUserSkill = async (req, res) => {
  if (!req.body || !skillLevels.has(req.body.level))
    throw badRequest(`level must be one of: ${[...skillLevels].join(', ')}.`);
  const r = await runWriteQuery(users.setUserSkill, {
    userId: req.params.id,
    skillId: req.params.skillId,
    level: req.body.level,
  });
  if (!r.records.length)
    throw Object.assign(new Error('User or skill not found.'), {
      status: 404,
    });
  const result = r.records[0];
  res.json({ ...node(result, 's'), level: value(result, 'level') });
};
export const removeUserSkill = async (req, res) => {
  const r = await runWriteQuery(users.removeUserSkill, {
    userId: req.params.id,
    skillId: req.params.skillId,
  });
  if (!r.records.length)
    throw Object.assign(new Error('User skill relationship not found.'), {
      status: 404,
    });
  res.status(204).end();
};
export const getMissing = async (req, res) => {
  const r = await runQuery(users.missingSkills, {
    userId: req.params.id,
    roleId: req.params.roleId,
  });
  res.json(
    rows(r, (x) => ({
      ...node(x, 's'),
      resources: value(x, 'resources').filter(Boolean),
    }))
  );
};
export const getCareer = async (req, res) => {
  const r = await runQuery(users.careerRecommendations, {
    userId: req.params.id,
  });
  res.json(
    rows(r, (x) => ({
      ...node(x, 'r'),
      matchingSkills: value(x, 'matchingSkills'),
      totalSkills: integer(value(x, 'totalSkills')),
      matchPercentage: integer(value(x, 'matchPercentage')),
    }))
  );
};
export const getLearningPath = async (req, res) => {
  const fromSkillId = req.query.from;
  if (!fromSkillId)
    throw Object.assign(new Error('Query parameter "from" is required.'), {
      status: 400,
    });
  const r = await runQuery(skills.skillPath, {
    fromSkillId,
    toSkillId: req.params.skillId,
  });
  if (!r.records.length)
    return res.json({
      nodes: [],
      message: 'No directed prerequisite path exists.',
    });
  res.json({
    nodes: value(r.records[0], 'pathNodes').map((skill) => skill.properties),
    hops: integer(value(r.records[0], 'hops')),
  });
};
export const getReachable = async (req, res) => {
  const userId = req.query.userId;
  if (!userId) throw Object.assign(new Error('userId is required.'), { status: 400 });
  const r = await runQuery(recs.reachableRoles, { userId });
  res.json(
    rows(r, (x) => ({
      ...node(x, 'r'),
      reachableSkills: value(x, 'reachableSkills'),
      totalSkills: integer(value(x, 'totalSkills')),
      coverage: integer(value(x, 'coverage')),
      nearestHops: integer(value(x, 'nearestHops')),
    }))
  );
};
export const getGraph = async (req, res) => {
  const r = await requireId(exploreRole, 'roleId', req.query.roleId || 'frontend-developer');
  const x = r.records[0];
  res.json({
    role: node(x, 'r'),
    skills: value(x, 'skills').map((n) => n.properties),
    projects: value(x, 'projects').map((n) => n.properties),
  });
};
