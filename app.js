const state = {records: [], source: 'All'};
const fmt = x => new Intl.NumberFormat('en-CA').format(x);
const activeStages = new Set(['Lead received', 'Qualified', 'Inspection booked', 'Proposal sent']);
const stepStages = new Set(['Qualified', 'Inspection booked', 'Proposal sent']);
const stages = [...activeStages, 'Won', 'Lost'];
const days = iso => (Date.UTC(2026, 9, 19) - Date.parse(iso + 'T00:00:00Z')) / 86400000;
function render() {
 const data = state.records.filter(x => state.source === 'All' || x.source === state.source);
 const active = data.filter(x => activeStages.has(x.stage));
 const stale = active.filter(x => days(x.last_activity_on) >= 10);
 const missing = active.filter(x => stepStages.has(x.stage) && !x.next_step);
 const lost = data.filter(x => x.stage === 'Lost');
 for (const [id, value] of [['active', active.length], ['stalled', stale.length], ['steps', missing.length]]) document.getElementById(id).textContent = fmt(value);
 document.getElementById('reasons').textContent = lost.length ? (100 * lost.filter(x => !x.loss_reason).length / lost.length).toFixed(1) + '%' : '—';
 const flaggedProposals = stale.filter(r => r.stage === 'Proposal sent');
 document.getElementById('finding-count').textContent = fmt(flaggedProposals.length);
 document.getElementById('takeaway').textContent = flaggedProposals.length ? 'In the selected synthetic segment, these proposal records crossed an illustrative inactivity threshold. That is a reason to ask what happened—not a reason to assume the jobs are lost. I would first review a small sample and verify the context before recommending a workflow change.' : 'No proposals cross the inactivity threshold in this synthetic segment. That is a useful result too: review whether the check adds value before recommending it.';
 const counts = stages.map(stage => ({stage, value: data.filter(r => r.stage === stage).length}));
 const max = Math.max(1, ...counts.map(x => x.value));
 const bars = document.getElementById('bars'); bars.replaceChildren();
 for (const x of counts) {
  const row = document.createElement('div'); row.className = 'bar-row';
  const label = document.createElement('span'); label.textContent = x.stage;
  const track = document.createElement('div'); track.className = 'bar-track';
  const fill = document.createElement('div'); fill.className = 'bar-fill'; fill.style.width = (100 * x.value / max) + '%'; track.append(fill);
  const count = document.createElement('strong'); count.textContent = fmt(x.value); row.append(label, track, count); bars.append(row);
 }
 const queue = document.getElementById('queue'); queue.replaceChildren();
 for (const record of stale.slice(0, 4)) {
  const row = document.createElement('div'); row.className = 'queue-row';
  const detail = document.createElement('div'); const title = document.createElement('b'); title.textContent = record.job_id + ' · ' + record.stage;
  const meta = document.createElement('small'); meta.textContent = record.owner + ' · ' + (record.next_step || 'No next step recorded'); detail.append(title, meta);
  const age = document.createElement('span'); age.textContent = days(record.last_activity_on) + ' days inactive'; row.append(detail, age); queue.append(row);
 }
 if (!stale.length) queue.textContent = 'No inactive open jobs in this segment.';
 document.getElementById('filter-status').textContent = 'Oct 19, 2026 · ' + state.source + ' · ' + fmt(data.length) + ' jobs';
}
document.querySelectorAll('[data-source]').forEach(button => button.addEventListener('click', () => {
 state.source = button.dataset.source;
 document.querySelectorAll('[data-source]').forEach(el => {el.classList.toggle('active', el === button); el.setAttribute('aria-pressed', String(el === button));}); render();
}));
fetch('data/synthetic_jobs.csv').then(r => {if (!r.ok) throw Error('Cannot load dataset'); return r.text();}).then(text => {
 const [header, ...lines] = text.trim().split(/\r?\n/); const fields = header.split(',');
 state.records = lines.filter(Boolean).map(line => {const values = line.split(','); return Object.fromEntries(fields.map((f, i) => [f, values[i] || '']));});
 const allOpen = state.records.filter(r => activeStages.has(r.stage));
 const proposals = state.records.filter(r => r.stage === 'Proposal sent' && days(r.last_activity_on) >= 10).length;
 const allLost = state.records.filter(r => r.stage === 'Lost');
 const noReason = allLost.filter(r => !r.loss_reason).length;
 const previewValues = {'preview-active': allOpen.length, 'preview-proposals': proposals, 'preview-steps': allOpen.filter(r => stepStages.has(r.stage) && !r.next_step).length};
 for (const [id, value] of Object.entries(previewValues)) document.getElementById(id).textContent = fmt(value);
 document.getElementById('loss-formula').textContent = noReason + ' / ' + allLost.length + ' = ' + (100 * noReason / allLost.length).toFixed(1) + '%';
 for (const [id, stage] of [['mini-proposal', 'Proposal sent'], ['mini-qualified', 'Qualified'], ['mini-inspection', 'Inspection booked']]) {
  const count = state.records.filter(r => r.stage === stage && days(r.last_activity_on) >= 10).length;
  const el = document.getElementById(id); el.textContent = count; el.previousElementSibling.style.setProperty('--w', (count / Math.max(1, proposals) * 50) + '%');
 }
 render();
}).catch(error => {
 document.getElementById('bars').textContent = 'The dataset could not load. Reload the page or download the CSV below.';
 document.getElementById('queue').textContent = 'Review queue unavailable.';
 document.getElementById('takeaway').textContent = 'Dataset unavailable. Download the CSV to inspect the example.';
 document.getElementById('finding-count').textContent = '—';
 document.getElementById('loss-formula').textContent = 'Dataset unavailable';
 document.getElementById('filter-status').textContent = 'Dataset unavailable'; console.error(error);
});
