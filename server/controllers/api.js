import { runQuery, runWriteQuery, verifyConnection } from '../config/database.js';
import * as roles from '../queries/roles.js';
import * as skills from '../queries/skills.js';
import * as users from '../queries/users.js';
import * as recs from '../queries/recommendations.js';
import { exploreRole } from '../queries/graph.js';

const value = (record, key) => record.get(key);
const node = (record, key) => ({ ...value(record, key).properties });
const integer = (v) => typeof v?.toNumber === 'function' ? v.toNumber() : v;
const rows = (result, mapper) => result.records.map(mapper);
const requireId = async (query, idName, id) => { const result = await runQuery(query, { [idName]: id }); if (!result.records.length) throw Object.assign(new Error('Not found'), { status: 404 }); return result; };
const userInput = (body = {}) => {
	const id = typeof body.id === 'string' ? body.id.trim() : '';
	const name = typeof body.name === 'string' ? body.name.trim() : '';
	if (!id || !/^[a-z0-9-]+$/.test(id)) throw Object.assign(new Error('id must contain only lowercase letters, numbers, and hyphens.'), { status: 400 });
	if (!name || name.length > 120) throw Object.assign(new Error('name is required and must be 120 characters or fewer.'), { status: 400 });
	return { id, name };
};

export const health = async (_req, res) => { await verifyConnection(); res.json({ status: 'ok', database: 'connected' }); };
export const getRoles = async (_req, res) => { const r = await runQuery(roles.listRoles); res.json(rows(r, x => ({ ...node(x, 'r'), skillCount: integer(value(x, 'skillCount')) }))); };
export const getRole = async (req, res) => { const r = await requireId(roles.roleById, 'roleId', req.params.id); res.json(node(r.records[0], 'r')); };
export const getRoleSkills = async (req, res) => { const r = await requireId(roles.roleSkills, 'roleId', req.params.id); res.json(rows(r, x => ({ ...node(x, 's'), importance: value(x, 'importance') }))); };
export const getRoleProjects = async (req, res) => { const r = await runQuery(roles.roleProjects, { roleId: req.params.id }); res.json(rows(r, x => ({ ...node(x, 'p'), matchingSkills: value(x,'matchingSkills'), coverage: integer(value(x,'coverage')) }))); };
export const getRoleResources = async (req,res) => { const r=await runQuery(roles.roleResources,{roleId:req.params.id});res.json(rows(r,x=>({...node(x,'resource'),coveredSkills:value(x,'coveredSkills')}))); };
export const getProjects = async (_req,res) => { const r=await runQuery(roles.listProjects);res.json(rows(r,x=>node(x,'p'))); };
export const getResources = async (_req,res) => { const r=await runQuery(roles.listResources);res.json(rows(r,x=>node(x,'r'))); };
export const getSkills = async (_req,res) => { const r=await runQuery(skills.listSkills); res.json(rows(r,x=>node(x,'s'))); };
export const getSkill = async (req,res) => { const r=await requireId(skills.skillById,'skillId',req.params.id); const x=r.records[0]; res.json({ ...node(x,'s'), descendants:value(x,'descendants').map(n=>n.properties), prerequisites:value(x,'prerequisites').map(n=>n.properties) }); };
export const getSkillTraversal = async(req,res) => { const r=await runQuery(skills.skillTraversal,{skillId:req.params.id}); res.json(rows(r,x=>({nodes:value(x,'nodes'),hops:integer(value(x,'hops'))}))); };
export const getUsers = async(_req,res) => {const r=await runQuery(users.users);res.json(rows(r,x=>node(x,'u')));};
export const getUser = async(req,res) => {const r=await requireId(users.userById,'userId',req.params.id);res.json(node(r.records[0],'u'));};
export const createUser = async(req,res) => {
	const input = userInput(req.body);
	const existing = await runQuery(users.userById, { userId: input.id });
	if (existing.records.length) throw Object.assign(new Error('A user with that id already exists.'), { status: 409 });
	const r = await runWriteQuery(users.createUser, { userId: input.id, name: input.name });
	res.status(201).json(node(r.records[0], 'u'));
};
export const updateUser = async(req,res) => {
	const input = userInput({ ...req.body, id: req.params.id });
	const r = await runWriteQuery(users.updateUser, { userId: input.id, name: input.name });
	if (!r.records.length) throw Object.assign(new Error('Not found'), { status: 404 });
	res.json(node(r.records[0], 'u'));
};
export const deleteUser = async(req,res) => {
	const r = await runWriteQuery(users.deleteUser, { userId: req.params.id });
	if (!r.records.length || integer(value(r.records[0], 'deleted')) === 0) throw Object.assign(new Error('Not found'), { status: 404 });
	res.status(204).end();
};
export const getUserSkills = async(req,res) => {const r=await runQuery(users.userSkills,{userId:req.params.id});res.json(rows(r,x=>({...node(x,'s'),level:value(x,'level')})));};
export const getMissing = async(req,res) => {const r=await runQuery(users.missingSkills,{userId:req.params.id,roleId:req.params.roleId});res.json(rows(r,x=>({...node(x,'s'),resources:value(x,'resources').filter(Boolean)})));};
export const getCareer = async(req,res) => {const r=await runQuery(users.careerRecommendations,{userId:req.params.id});res.json(rows(r,x=>({...node(x,'r'),matchingSkills:value(x,'matchingSkills'),totalSkills:integer(value(x,'totalSkills')),matchPercentage:integer(value(x,'matchPercentage'))})));};
export const getLearningPath = async(req,res) => {const fromSkillId=req.query.from; if(!fromSkillId) throw Object.assign(new Error('Query parameter "from" is required.'),{status:400}); const r=await runQuery(skills.skillPath,{fromSkillId,toSkillId:req.params.skillId}); if(!r.records.length) return res.json({nodes:[],message:'No directed prerequisite path exists.'}); res.json({nodes:value(r.records[0],'pathNodes').map(skill=>skill.properties),hops:integer(value(r.records[0],'hops'))});};
export const getReachable = async(req,res) => {const userId=req.query.userId;if(!userId) throw Object.assign(new Error('userId is required.'),{status:400});const r=await runQuery(recs.reachableRoles,{userId});res.json(rows(r,x=>({...node(x,'r'),reachableSkills:value(x,'reachableSkills'),totalSkills:integer(value(x,'totalSkills')),coverage:integer(value(x,'coverage')),nearestHops:integer(value(x,'nearestHops'))})));};
export const getGraph = async(req,res) => { const r=await requireId(exploreRole,'roleId',req.query.roleId || 'frontend-developer'); const x=r.records[0]; res.json({ role:node(x,'r'), skills:value(x,'skills').map(n=>n.properties), projects:value(x,'projects').map(n=>n.properties) }); };
