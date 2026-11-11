import { useEffect, useState } from 'react';
import api from '../services/api';
import { ErrorState, Loading } from '../components/UI';
import '../career-path.css';
export default function CareerPath() {
  const [skills, setSkills] = useState([]),
    [from, setFrom] = useState('javascript'),
    [to, setTo] = useState('express'),
    [path, setPath] = useState(null),
    [error, setError] = useState(''),
    [searching, setSearching] = useState(false);
  useEffect(() => {
    api('/skills')
      .then(setSkills)
      .catch((e) => setError(e.message));
  }, []);
  const go = async () => {
    setPath(null);
    setError('');
    setSearching(true);
    try {
      const startSkill = skills.find((skill) => skill.id === from);
      const targetSkill = skills.find((skill) => skill.id === to);
      if (!startSkill || !targetSkill) return;
      if (from === to) {
        setPath({ nodes: [startSkill], hops: 0 });
        return;
      }

      const directPath = await api(
        `/skills/${encodeURIComponent(to)}/path?from=${encodeURIComponent(from)}`,
      );
      if (directPath.nodes.length || startSkill.category === targetSkill.category) {
        setPath(directPath);
        return;
      }

      const targetTrails = await api(
        `/skills/${encodeURIComponent(to)}/traversal`,
      );
      const longestTargetTrail = targetTrails.reduce(
        (longest, trail) =>
          !longest || trail.hops > longest.hops ? trail : longest,
        null,
      );
      const targetPath = longestTargetTrail
        ? [...longestTargetTrail.nodes].reverse()
        : [targetSkill];
      setPath({
        nodes: [
          startSkill,
          {
            id: `domain-transition-${from}-${to}`,
            name: `Switch from ${startSkill.category} to ${targetSkill.category}`,
            category: 'Domain transition',
            domainTransition: true,
          },
          ...targetPath,
        ],
        hops: Math.max(0, targetPath.length - 1),
        domainChange: true,
        hasTargetPrerequisites: targetPath.length > 1,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setSearching(false);
    }
  };
  if (!skills.length && !error) return <Loading />;
  return (
    <section>
      <span className="eyebrow">MULTI-HOP EXPLORER</span>
      <h2>
        See the shortest route from
        <br />
        where you are to what’s next.
      </h2>
      <p className="intro">
        Prerequisite relationships turn a vague goal into a clear sequence of skills.
      </p>
      <div className="path-controls">
        <label>
          Start skill
          <select
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPath(null);
            }}
          >
            {skills.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <span className="path-arrow">→</span>
        <label>
          Target skill
          <select
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPath(null);
            }}
          >
            {skills.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <button className="primary" onClick={go} disabled={searching}>
          {searching ? 'Mapping…' : 'Map my path'}
        </button>
      </div>
      {error ? (
        <ErrorState error={error} />
      ) : !path ? (
        <div className="path-placeholder">
          Choose a starting skill and a target. If they belong to different domains and no direct prerequisite path exists, we’ll show a domain transition and the target’s available prerequisite trail.
        </div>
      ) : path.nodes.length ? (
        <div className="path-result">
          <span className="eyebrow">
            {path.domainChange
              ? 'CROSS-DOMAIN LEARNING PLAN'
              : `${path.hops} PREREQUISITE HOPS`}
          </span>
          {path.domainChange && (
            <div className="domain-change-notice" role="status">
              <b>A domain change is required.</b>
              <span>
                No direct prerequisite route connects these domains. The domain
                switch is a planning step, not a stored prerequisite
                relationship.
                {path.hasTargetPrerequisites
                  ? ' The target-side skills below follow prerequisite links in the graph.'
                  : ' No prerequisite trail is mapped for the target, so plan to learn it directly after switching domains.'}
              </span>
            </div>
          )}
          <div className="path-nodes">
            {path.nodes.map((n, i) => (
              <div
                className={n.domainTransition ? 'domain-transition-step' : ''}
                key={n.id}
              >
                {i > 0 && <i>→</i>}
                <span>
                  <b>{n.name}</b>
                  <small>
                    {n.domainTransition ? 'Domain switch required' : n.category}
                  </small>
                </span>
              </div>
            ))}
          </div>
          {!path.domainChange && (
            <p>
              The path follows <code>PREREQUISITE_OF</code> relationships stored
              in CognoDB—no manually maintained curriculum ordering.
            </p>
          )}
        </div>
      ) : (
        <div className="path-placeholder">{path.message}</div>
      )}
    </section>
  );
}
