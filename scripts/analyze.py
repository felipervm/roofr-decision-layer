"""Reproducible synthetic roofing CRM sample; deterministic seed, not Roofr customer data."""
import csv,random,json
from pathlib import Path
from datetime import date,timedelta
from collections import Counter
ROOT=Path(__file__).resolve().parents[1];TODAY=date(2026,10,19);random.seed(418)
N=1200;STAGES=['Lead received','Qualified','Inspection booked','Proposal sent','Won','Lost'];SOURCES=['Referral','Google search','Paid ads','Website','Door-to-door']
records=[]
for i in range(N):
 age=random.randint(3,175);created=TODAY-timedelta(days=age)
 stage=random.choices(STAGES,weights=[13,14,12,21,23,17])[0]
 price=round(random.uniform(4800,24000)/50)*50
 last=TODAY-timedelta(days=min(age,round(random.triangular(0,35,3))))
 step='Call homeowner' if stage in ['Qualified','Proposal sent'] else 'Confirm inspection' if stage=='Inspection booked' else ''
 if random.random()<.18:step=''
 reason=random.choice(['Price','Timing','Competitor','No response','Scope']) if stage=='Lost' else ''
 if stage=='Lost' and random.random()<.26:reason=''
 if stage=='Won' and random.random()<.035:reason='Price'
 records.append(dict(job_id=f'RFR-{i+1:04}',created_on=created.isoformat(),stage=stage,source=random.choices(SOURCES,weights=[28,27,18,17,10])[0],owner=random.choice(['Alex','Jordan','Taylor','Morgan','Casey']),estimated_value_cad=price,last_activity_on=last.isoformat(),next_step=step,loss_reason=reason))
def flags(r):
 days=(TODAY-date.fromisoformat(r['last_activity_on'])).days
 return dict(stalled=r['stage'] in STAGES[:4] and days>=10,missing_next_step=r['stage'] in STAGES[1:4] and not r['next_step'],missing_loss_reason=r['stage']=='Lost' and not r['loss_reason'],inconsistent_loss_reason=r['stage']=='Won' and bool(r['loss_reason']))
for r in records:r.update(flags(r))
with (ROOT/'data'/'synthetic_jobs.csv').open('w',newline='') as f:
 writer=csv.DictWriter(f,fieldnames=list(records[0]));writer.writeheader();writer.writerows(records)
active=[r for r in records if r['stage'] in STAGES[:4]];lost=[r for r in records if r['stage']=='Lost'];stale=[r for r in active if r['stalled']];missing_step=[r for r in active if r['missing_next_step']];missing_reason=[r for r in lost if r['missing_loss_reason']];counts=Counter(r['stage'] for r in records)
sources=[{'source':s,'all':sum(r['source']==s for r in records),'won':sum(r['source']==s and r['stage']=='Won' for r in records),'stalled':sum(r['source']==s and r['stalled'] for r in records)} for s in SOURCES]
followups=[r for r in stale if r['stage']=='Proposal sent']
summary={'as_of':TODAY.isoformat(),'synthetic':True,'total_jobs':N,'active_jobs':len(active),'stalled_active':len(stale),'stalled_rate_pct':round(100*len(stale)/len(active),1),'missing_next_step':len(missing_step),'missing_next_step_rate_pct':round(100*len(missing_step)/len(active),1),'lost_jobs':len(lost),'lost_missing_reason':len(missing_reason),'lost_missing_reason_pct':round(100*len(missing_reason)/len(lost),1),'conflicting_won_reason':sum(r['inconsistent_loss_reason'] for r in records),'stage_counts':dict(counts),'by_source':sources,'proposal_followups':len(followups),'proposal_followup_value_cad':sum(r['estimated_value_cad'] for r in followups)}
(ROOT/'data'/'summary.json').write_text(json.dumps(summary,indent=2))
print(json.dumps(summary,indent=2))
