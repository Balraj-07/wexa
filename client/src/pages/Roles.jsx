import { useEffect, useState } from 'react';
import api from '../services/api';
import { ErrorState, Loading, Pill } from '../components/UI';
import GraphView from '../components/GraphView';

export default function Roles() {
  const [roles,setRoles]=useState([]),[selected,setSelected]=useState(null),[detail,setDetail]=useState(null),[error,setError]=useState('');
  useEffect(()=>{ api('/roles').then(setRoles).catch(e=>setError(e.message)); },[]);
  useEffect(()=>{ if(!selected)return; Promise.all([api(`/roles/${selected}/skills`),api(`/roles/${selected}/projects`),api(`/roles/${selected}/resources`),api(`/graph/explore?roleId=${selected}`)]).then(([skills,projects,resources,graph])=>setDetail({skills,projects,resources,graph})).catch(e=>setError(e.message)); },[selected]);
  if(error)return <ErrorState error={error}/>; if(!roles.length)return <Loading/>;
  const active=roles.find(r=>r.id===selected);
  return <section><span className="eyebrow">ROLE EXPLORER</span><h2>Find the role your skills can grow into.</h2><p className="intro">Browse the graph’s career destinations. Select a role to see its skill network and portfolio proof.</p><div className="role-layout"><div className="role-cards">{roles.map(r=><button className={`role-card ${selected===r.id?'selected':''}`} onClick={()=>setSelected(r.id)} key={r.id}><span>{r.category}</span><h3>{r.name}</h3><p>{r.description}</p><footer><Pill tone="dark">{r.skillCount} skills</Pill><b>{r.demandLevel} demand</b></footer></button>)}</div><div className="details">{!detail?<div className="select-prompt">Select a role to open its graph.</div>:<><span className="eyebrow">ROLE BLUEPRINT</span><h2>{active.name}</h2><p className="muted">{active.description}</p><h4>Required capabilities</h4><div className="pills">{detail.skills.map(s=><Pill key={s.id}>{s.name} · {s.difficulty}</Pill>)}</div><h4>Relationship map</h4><GraphView graph={detail.graph}/><h4>Recommended portfolio evidence</h4>{detail.projects.slice(0,3).map(p=><div className="project-mini" key={p.id}><b>{p.name}</b><span>{p.matchingSkills.join(', ')}</span></div>)}<h4>Learning resources</h4>{detail.resources.slice(0,3).map(r=><a className="project-mini" key={r.id} href={r.url} target="_blank" rel="noreferrer"><b>{r.title}</b><span>{r.coveredSkills.join(', ')}</span></a>)}</>}</div></div></section>;
}
