import csv,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
rows=list(csv.DictReader((ROOT/'data'/'synthetic_jobs.csv').open()))
summary=json.loads((ROOT/'data'/'summary.json').read_text())
def test_sample_size():assert len(rows)==1200==summary['total_jobs']
def test_unique_ids():assert len({r['job_id'] for r in rows})==len(rows)
def test_closed_plus_active():assert summary['active_jobs']+summary['lost_jobs']+summary['stage_counts']['Won']==1200
def test_missing_loss_reason():assert sum(r['stage']=='Lost' and not r['loss_reason'] for r in rows)==summary['lost_missing_reason']
def test_bounded_values():assert all(int(r['estimated_value_cad'])>0 for r in rows)
def test_stage_totals():assert sum(summary['stage_counts'].values())==1200
def test_explicit_synthetic():assert summary['synthetic'] is True
