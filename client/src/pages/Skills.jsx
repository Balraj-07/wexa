import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { ErrorState, Loading, Pill } from '../components/UI';
export default function Skills(){
 const [skills,setSkills]=useState([]),[selected,setSelected]=useState(null),[detail,setDetail]=useState(null),[query,setQuery]=useState(''),[error,setError]=useState('');
 useEffect(()=>{api('/skills').then(setSkills).catch(e=>setError(e.message));},[]);
 useEffect(()=>{if(!selected)return;Promise.all([api(`/skills/${selected}`),api(`/skills/${selected}/traversal`)]).then(([d,t])=>setDetail({...d,traversal:t})).catch(e=>setError(e.message));},[selected]);
 const filtered=useMemo(()=>skills.filter(s=>s.name.toLowerCase().includes(query.toLowerCase())),[skills,query]);
 if(error)return <ErrorState error={error}/>;if(!skills.length)return <Loading/>;
 return <section><span className="eyebrow">SKILL EXPLORER</span><h2>Every capability has a story behind it.</h2><input className="search" placeholder="Search skills…" value={query} onChange={e=>setQuery(e.target.value)}/><div className="skill-layout"><div className="skill-list">{filtered.map(s=><button onClick={()=>setSelected(s.id)} className={selected===s.id?'active':''} key={s.id}><span className="skill-dot"/><b>{s.name}</b><small>{s.category}</small></button>)}</div><div className="details">{!detail?<div className="select-prompt">Choose a skill to trace its prerequisites.</div>:<><Pill tone="dark">{detail.category}</Pill><h2>{detail.name}</h2><p className="muted">{detail.description}</p><h4>Prerequisites that lead here</h4><div className="pills">{detail.prerequisites.map(s=><Pill key={s.id}>{s.name}</Pill>)}</div><h4>What this skill unlocks</h4><div className="pills">{detail.descendants.map(s=><Pill key={s.id}>{s.name}</Pill>)}</div><h4>Multi-hop learning trails</h4>{detail.traversal.length?detail.traversal.map((t,i)=><div className="trail" key={i}>{[...t.nodes].reverse().map(n=><span key={n.id}>{n.name}</span>)}<em>{t.hops} hops</em></div>):<p className="muted">This is a foundational skill.</p>}</>}</div></div></section>;
}
