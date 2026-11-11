import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
test('unknown endpoint returns 404', async () => {
  const res = await request(app).get('/nope');
  assert.equal(res.status, 404);
});
test('unconfigured database fails safely', async () => {
  const res = await request(app).get('/api/health');
  assert.ok([503, 200].includes(res.status));
  if (res.status === 503) assert.match(res.body.error, /Unable to connect/);
});
test('role, skill, and recommendation endpoints fail safely without a graph', async () => {
  for (const endpoint of ['/api/roles', '/api/skills', '/api/users/maya/career-recommendations']) {
    const res = await request(app).get(endpoint);
    assert.ok([200, 503].includes(res.status));
    if (res.status === 503) assert.match(res.body.error, /Unable to connect/);
  }
});
test('learning path validates its required start skill', async () => {
  const res = await request(app).get('/api/skills/react/path');
  assert.equal(res.status, 400);
  assert.match(res.body.error, /from/);
});
test('adding a profile skill requires a supported proficiency level', async () => {
  for (const level of [undefined, 'Expert', 42]) {
    const req = request(app).put('/api/users/maya/skills/react');
    if (level !== undefined) req.send({ level });
    const res = await req;
    assert.equal(res.status, 400);
    assert.match(res.body.error, /level must be one of/);
  }
});
test('adding a course validates its details and skill mappings before writing', async () => {
  const invalidCourses = [
    { title: '', url: 'https://example.com', skillIds: ['javascript'] },
    { title: 'Course', url: 'javascript:alert(1)', skillIds: ['javascript'] },
    { title: 'Course', url: 'https://example.com', skillIds: [] },
    { title: 'Course', url: 'https://example.com', skillIds: 'javascript' },
  ];
  for (const course of invalidCourses) {
    const res = await request(app).post('/api/courses').send(course);
    assert.equal(res.status, 400);
    assert.match(res.body.error, /title|URL|skill/i);
  }
});
