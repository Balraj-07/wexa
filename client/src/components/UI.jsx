import { AlertCircle, ChevronRight, Sparkles } from 'lucide-react';
export const Loading=()=> <div className="loading"><span></span><span></span><span></span></div>;
export const ErrorState=({error})=><div className="state error"><AlertCircle size={22}/><div><strong>We couldn’t load this view</strong><p>{error}</p></div></div>;
export const Empty=({text='Nothing to show yet.'})=><div className="state"><Sparkles size={22}/><p>{text}</p></div>;
export const Pill=({children,tone=''})=><span className={`pill ${tone}`}>{children}</span>;
export const Arrow=()=> <ChevronRight size={16}/>;
