import { useEffect, useState } from 'react';
import api from '../services/api';
import { Empty, ErrorState, Loading } from '../components/UI';
import '../skill-editor.css';

const skillLevels = ['Beginner', 'Working knowledge', 'Proficient', 'Advanced'];

const loadProfile = async (userId) => {
  const [skills, roles, reachable] = await Promise.all([
    api(`/users/${encodeURIComponent(userId)}/skills`),
    api(`/users/${encodeURIComponent(userId)}/career-recommendations`),
    api(`/graph/reachable-roles?userId=${encodeURIComponent(userId)}`),
  ]);
  return { skills, roles, reachable };
};

export default function MyCareer() {
  const [users, setUsers] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [user, setUser] = useState('maya');
  const [state, setState] = useState(null);
  const [error, setError] = useState('');
  const [editError, setEditError] = useState('');
  const [newSkillId, setNewSkillId] = useState('');
  const [level, setLevel] = useState('Working knowledge');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/users')
      .then(setUsers)
      .catch((e) => setError(e.message));
    api('/skills')
      .then(setAllSkills)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    let active = true;
    setState(null);
    setError('');
    loadProfile(user)
      .then((profile) => {
        if (active) setState(profile);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const availableSkills = allSkills.filter(
    (skill) => !state?.skills.some((owned) => owned.id === skill.id)
  );
  const selectedSkillId = availableSkills.some((skill) => skill.id === newSkillId)
    ? newSkillId
    : (availableSkills[0]?.id ?? '');

  const saveSkill = async (event) => {
    event.preventDefault();
    if (!selectedSkillId) return;
    setSaving(true);
    setEditError('');
    try {
      await api(
        `/users/${encodeURIComponent(user)}/skills/${encodeURIComponent(selectedSkillId)}`,
        { method: 'PUT', body: JSON.stringify({ level }) }
      );
      setState(await loadProfile(user));
      setNewSkillId('');
    } catch (e) {
      setEditError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateSkillLevel = async (skillId, nextLevel) => {
    setSaving(true);
    setEditError('');
    try {
      await api(`/users/${encodeURIComponent(user)}/skills/${encodeURIComponent(skillId)}`, {
        method: 'PUT',
        body: JSON.stringify({ level: nextLevel }),
      });
      setState(await loadProfile(user));
    } catch (e) {
      setEditError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const removeSkill = async (skillId) => {
    setSaving(true);
    setEditError('');
    try {
      await api(`/users/${encodeURIComponent(user)}/skills/${encodeURIComponent(skillId)}`, {
        method: 'DELETE',
      });
      setState(await loadProfile(user));
    } catch (e) {
      setEditError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (error) return <ErrorState error={error} />;
  if (!state) return <Loading />;

  return (
    <section>
      <span className="eyebrow">MY CAREER GRAPH</span>
      <h2>Your skills, connected to possibility.</h2>
      <select
        className="profile-select"
        value={user}
        disabled={saving}
        onChange={(e) => {
          setUser(e.target.value);
          setEditError('');
        }}
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
      <div className="grid two">
        <div className="panel">
          <span className="eyebrow">CURRENT TOOLKIT</span>
          <h3>Skills you bring</h3>
          {state.skills.length ? (
            <div className="owned-skills">
              {state.skills.map((skill) => (
                <div className="owned-skill" key={skill.id}>
                  <div>
                    <b>{skill.name}</b>
                    <span>{skill.category}</span>
                  </div>
                  <select
                    value={skillLevels.includes(skill.level) ? skill.level : 'Working knowledge'}
                    onChange={(e) => updateSkillLevel(skill.id, e.target.value)}
                    disabled={saving}
                    aria-label={`Set proficiency for ${skill.name}`}
                  >
                    {skillLevels.map((skillLevel) => (
                      <option value={skillLevel} key={skillLevel}>
                        {skillLevel}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill.id)}
                    disabled={saving}
                    aria-label={`Remove ${skill.name}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="No skills added to this profile yet." />
          )}
          <form className="skill-editor" onSubmit={saveSkill}>
            <label>
              Add a skill
              <select
                value={selectedSkillId}
                onChange={(e) => setNewSkillId(e.target.value)}
                disabled={!availableSkills.length || saving}
              >
                {availableSkills.length ? (
                  availableSkills.map((skill) => (
                    <option value={skill.id} key={skill.id}>
                      {skill.name}
                    </option>
                  ))
                ) : (
                  <option value="">All skills are in this profile</option>
                )}
              </select>
            </label>
            <label>
              Proficiency
              <select value={level} onChange={(e) => setLevel(e.target.value)} disabled={saving}>
                {skillLevels.map((skillLevel) => (
                  <option value={skillLevel} key={skillLevel}>
                    {skillLevel}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary" type="submit" disabled={!availableSkills.length || saving}>
              {saving ? 'Saving…' : 'Add skill'}
            </button>
          </form>
          {editError && <ErrorState error={editError} />}
          <div className="divider" />
          <span className="eyebrow">GRAPH REACHABILITY</span>
          <p className="muted">Roles surfaced through up to 3 prerequisite hops.</p>
          {state.reachable.slice(0, 4).map((r) => (
            <div className="role-row" key={r.id}>
              <div className="initial">{r.name[0]}</div>
              <div>
                <b>{r.name}</b>
                <p>{r.reachableSkills.join(' · ')}</p>
              </div>
              <strong>{r.coverage}%</strong>
            </div>
          ))}
        </div>
        <div className="panel">
          <span className="eyebrow">ROLE READINESS</span>
          <h3>Best current matches</h3>
          {state.roles.slice(0, 5).map((r) => (
            <div className="match" key={r.id}>
              <div>
                <b>{r.name}</b>
                <span>
                  {r.matchingSkills.length} of {r.totalSkills} skills
                </span>
              </div>
              <div className="bar">
                <i style={{ width: `${r.matchPercentage}%` }} />
              </div>
              <strong>{r.matchPercentage}%</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
