// UPDATE BASE_URL before testing on a physical device
// Use your LAN IP not localhost
// Run ipconfig (Windows) or ifconfig (Mac) to find it
// Example: http://192.168.1.42:8000
const BASE_URL = 'http://localhost:8000';

export type Concern = {
  body_area: string;
  symptom: string;
  urgency_level: 'low' | 'medium' | 'high';
  severity: number;
  notes?: string;
  date_logged?: string;
  language?: string;
};

export type TimelineEntry = {
  visit_date: string;
  visit_reason: string;
  diagnosis: string;
  advice: string;
  follow_up: string;
  body_area: string;
};

async function get(path: string) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function post(path: string, body: object) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export const api = {
  healthCheck:    () => get('/api/health'),
  getConcerns:    () => get('/api/concerns'),
  getTimeline:    () => get('/api/timeline'),
  logConcern:     (concern: Concern) => post('/api/log-concern', concern),
  generatePrep:   () => post('/api/prep', {}),
  extractNotes:   (raw_text: string) => post('/api/extract', { raw_text }),
  analyzeLabs:    (raw_text: string) => post('/api/analyze-labs', { raw_text }),
  saveVisit:      (entry: TimelineEntry) => post('/api/save-visit', entry),
  runAgentChain:  (concern: Concern) => post('/api/run-agent-chain', { ...concern }),
};