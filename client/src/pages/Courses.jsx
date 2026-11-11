import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Plus, Search } from 'lucide-react';
import api from '../services/api';
import { Empty, ErrorState, Loading, Pill } from '../components/UI';
import '../course-catalog.css';

const emptyForm = {
  title: '',
  provider: '',
  url: '',
  description: '',
  skillIds: [],
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const [courseList, skillList] = await Promise.all([
      api('/courses'),
      api('/skills'),
    ]);
    setCourses(courseList);
    setSkills(skillList);
  };

  useEffect(() => {
    refresh()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return courses;
    return courses.filter((course) =>
      [
        course.title,
        course.provider,
        course.description,
        ...course.skills.map((skill) => skill.name),
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [courses, query]);

  const toggleSkill = (skillId) => {
    setForm((current) => ({
      ...current,
      skillIds: current.skillIds.includes(skillId)
        ? current.skillIds.filter((id) => id !== skillId)
        : [...current.skillIds, skillId],
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await api('/courses', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm(emptyForm);
      await refresh();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} />;

  return (
    <section>
      <span className="eyebrow">LEARNING CATALOG</span>
      <h2>Find courses connected to real skills.</h2>
      <p className="intro">
        Add learning courses and connect each one to every skill it teaches.
        Those connections also make courses discoverable from matching role
        learning resources.
      </p>

      <form className="course-form" onSubmit={submit}>
        <div className="course-form-heading">
          <div>
            <span className="eyebrow">CONTRIBUTE A COURSE</span>
            <h3>Add a course to the graph</h3>
          </div>
          <Plus size={20} aria-hidden="true" />
        </div>
        <div className="course-fields">
          <label>
            Course name
            <input
              required
              maxLength={160}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Modern React Development"
            />
          </label>
          <label>
            Course URL
            <input
              required
              type="url"
              maxLength={2048}
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
            />
          </label>
          <label>
            Provider
            <input
              maxLength={120}
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value })}
              placeholder="e.g. Learning platform"
            />
          </label>
          <label>
            Short description
            <input
              maxLength={1000}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="What learners will study"
            />
          </label>
        </div>
        <fieldset className="course-skill-picker">
          <legend>Skills this course teaches</legend>
          <div className="course-skill-options">
            {skills.map((skill) => (
              <label key={skill.id}>
                <input
                  type="checkbox"
                  checked={form.skillIds.includes(skill.id)}
                  onChange={() => toggleSkill(skill.id)}
                />
                <span>{skill.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {formError && <ErrorState error={formError} />}
        <div className="course-form-footer">
          <span>
            Select one or more skills to create the course-to-skill links.
          </span>
          <button
            className="primary"
            type="submit"
            disabled={saving || !skills.length}
          >
            {saving ? 'Adding course…' : 'Add course'}
          </button>
        </div>
        <p className="course-access-note">
          Course creation is open to anyone who can access this app.
        </p>
      </form>

      <div className="course-list-heading">
        <div>
          <span className="eyebrow">COURSES IN THE GRAPH</span>
          <h3>{courses.length} courses</h3>
        </div>
        <label className="course-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses or skills"
            aria-label="Search courses or skills"
          />
        </label>
      </div>
      {filteredCourses.length ? (
        <div className="course-grid">
          {filteredCourses.map((course) => (
            <article className="course-card" key={course.id}>
              <div className="course-card-top">
                <Pill tone="dark">{course.provider || 'Course'}</Pill>
                <a
                  href={course.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${course.title}`}
                >
                  <ExternalLink size={16} />
                </a>
              </div>
              <h3>{course.title}</h3>
              {course.description && <p>{course.description}</p>}
              <span className="eyebrow">CONNECTED SKILLS</span>
              <div className="pills">
                {course.skills.length ? (
                  course.skills.map((skill) => (
                    <Pill key={skill.id}>{skill.name}</Pill>
                  ))
                ) : (
                  <span className="muted">No skills linked yet</span>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          text={
            courses.length
              ? 'No courses or skills match your search.'
              : 'No courses found. Add the first course above.'
          }
        />
      )}
    </section>
  );
}
