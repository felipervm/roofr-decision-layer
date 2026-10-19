const state={records:[],source:'All'};
const fmt=x=>new Intl.NumberFormat('en-CA').format(x);
const activeStages=new Set(['Lead received','Qualified','Inspection booked','Proposal sent']);
const stepStages=new Set(['Qualified','Inspection booked','Proposal sent']);
const stages=['Lead received','Qualified','Inspection booked','Proposal sent','Won','Lost'];
function days(iso){return(Date.UTC(2026,9,19)-Date.parse(iso+'T00:00:00Z'))/86400000}
function render(){
 const data=state.records.filter(x=>state.source==='All'||x.source===state.source);
 const active=data.filter(x=>activeStages.has(x.stage));
 const stale=active.filter(x=>days(x.last_activity_on)>=10);
 const missingStep=active.filter(x=>stepStages.has(x.stage)&&!x.next_step);
 const lost=data.filter(x=>x.stage==='Lost');
 const noReason=lost.filter(x=>!x.loss_reason);
 for(const [id,v] of [['active',active.length],['stalled',stale.length],['steps',missingStep.length]])document.getElementById(id).textContent=fmt(v);
 document.getElementById('reasons').textContent=lost.length?Math.round(100*noReason.length/lost.length)+'%':'—';
 const counts=stages.map(s=>({stage:s,value:data.filter(r=>r.stage===s).length}));
 const max=Math.max(1,...counts.map(x=>x.value));
 const bars=document.getElementById('bars');bars.replaceChildren();
 for(const x of counts){const row=document.createElement('div');row.className='bar-row';const label=document.createElement('span');label.textContent=x.stage;const track=document.createElement('div');track.className='bar-track';const fill=document.createElement('div');fill.className='bar-fill';fill.style.width=(100*x.value/max)+'%';track.append(fill);const count=document.createElement('strong');count.textContent=fmt(x.value);row.append(label,track,count);bars.append(row)}
}
document.querySelectorAll('[data-source]').forEach(button=>button.addEventListener('click',()=>{state.source=button.dataset.source;document.querySelectorAll('[data-source]').forEach(el=>el.classList.toggle('active',el===button));render()}));
fetch('data/synthetic_jobs.csv').then(r=>{if(!r.ok)throw Error('Cannot load CSV');return r.text()}).then(text=>{const [header,...lines]=text.trim().split(/\r?\n/),fields=header.split(',');state.records=lines.filter(Boolean).map(line=>{const values=line.split(',');return Object.fromEntries(fields.map((f,i)=>[f,values[i]||'']))});render()}).catch(e=>{document.getElementById('bars').textContent='Dataset unavailable. Please reload or view the published site.';console.error(e)});
