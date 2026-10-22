// Shared helpers + small kit-level pieces (formatting, progression rules, prefill, modal host).
const { Dialog, Badge, Icon, Stepper, IconButton } = window.WorkouterrDesignSystem_3a7282;

const exById = (id) => EXERCISES.find((e) => e.id === id);
const routineById = (id) => ROUTINES.find((r) => r.id === id);
const planById = (id) => PLANS.find((p) => p.id === id);
function entryById(id) { for (const r of ROUTINES) { const e = r.entries.find((x) => x.id === id); if (e) return e; } return null; }
const round2 = (n) => Math.round(n * 100) / 100;

/* ---------- formatting (PL: space thousands, comma decimals) ---------- */
function fmtNum(n) {
  const v = round2(Number(n) || 0);
  const parts = String(Math.abs(v)).split('.');
  return (v < 0 ? '−' : '') + parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (parts[1] ? ',' + parts[1] : '');
}
function fmtTime(s) { s = Math.round(s || 0); return s < 60 ? s + ' s' : Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function fmtClock(sec) { sec = Math.max(0, Math.floor(sec)); const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60; return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); }
const sideSfx = (ex) => (ex.perSide ? '/stronę' : '');
function fmtW(ex, w) { return (ex.added ? '+' : '') + fmtNum(w) + ' kg'; }
function fmtVal(ex, v) {
  if (ex.metric === 'WEIGHT_REPS') return fmtW(ex, v.w) + ' × ' + v.r + sideSfx(ex);
  if (ex.metric === 'REPS') return ex.perSide ? v.r + '/stronę' : v.r + ' powt.';
  return fmtTime(v.t) + sideSfx(ex);
}
function fmtTarget(ex, n, t) {
  if (ex.metric === 'WEIGHT_REPS') return n + ' × ' + t.r + sideSfx(ex) + ' @ ' + fmtW(ex, t.w);
  if (ex.metric === 'REPS') return n + ' × ' + t.r + sideSfx(ex);
  return n + ' × ' + fmtTime(t.t) + sideSfx(ex);
}
function fmtLogged(ex, sets) {
  if (!sets || !sets.length) return '—';
  if (ex.metric === 'WEIGHT_REPS') {
    const same = sets.every((s) => s.w === sets[0].w);
    return same ? sets.map((s) => s.r).join(' · ') + sideSfx(ex) + ' @ ' + fmtW(ex, sets[0].w) : sets.map((s) => fmtNum(s.w) + '×' + s.r).join(' · ') + ' kg';
  }
  if (ex.metric === 'REPS') return sets.map((s) => s.r).join(' · ') + sideSfx(ex);
  return sets.map((s) => fmtTime(s.t)).join(' · ') + sideSfx(ex);
}
function fmtStep(ex) { return ex.metric === 'WEIGHT_REPS' ? fmtNum(ex.step) + ' kg' : ex.metric === 'REPS' ? '1 powt.' : fmtTime(ex.step); }
function fmtProg(ex, entry) {
  if (ex.metric === 'WEIGHT_REPS') return entry.ladder.join(' / ') + ' powt.' + (entry.ladder.length === 1 ? ' · liniowa' : '');
  return '± ' + (ex.metric === 'REPS' ? '1 powt.' : fmtTime(ex.step));
}

/* ---------- dates ---------- */
const D = (iso) => new Date(iso + 'T12:00:00');
const daysAgo = (iso) => Math.round((D(TODAY) - D(iso)) / 86400000);
function fmtAgo(iso) {
  const d = daysAgo(iso);
  if (d <= 0) return 'dzisiaj';
  if (d === 1) return 'wczoraj';
  if (d < 7) return d + ' dni temu';
  const w = Math.floor(d / 7);
  return w === 1 ? 'tydzień temu' : w + ' tyg. temu';
}
function fmtDay(iso, long) { return D(iso).toLocaleDateString('pl-PL', long ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' } : { weekday: 'short', day: 'numeric', month: 'short' }); }
function fmtMonth(iso) { return D(iso).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' }); }

/* ---------- progression rules (spec: Progression rules) ---------- */
function progress(ex, entry, t, mark) {
  if (!mark || mark === 'keep' || !entry) return t;
  const up = mark === 'up';
  if (ex.metric === 'WEIGHT_REPS') {
    const L = entry.ladder, bot = L[0], top = L[L.length - 1];
    const rr = t.r > top ? top : t.r < bot ? bot : t.r;
    if (up) {
      const nxt = L.find((x) => x > rr);
      return nxt === undefined ? { w: round2(t.w + ex.step), r: bot } : { w: t.w, r: nxt };
    }
    const prv = [...L].reverse().find((x) => x < rr);
    if (prv !== undefined) return { w: t.w, r: prv };
    if (t.w <= 0) return t;
    return { w: Math.max(0, round2(t.w - ex.step)), r: top };
  }
  if (ex.metric === 'REPS') return up ? { r: t.r + 1 } : t.r - 1 >= 1 ? { r: t.r - 1 } : t;
  return up ? { t: t.t + ex.step } : t.t - ex.step >= ex.step ? { t: t.t - ex.step } : t;
}
function meets(ex, s, t) {
  if (ex.metric === 'WEIGHT_REPS') return s.w >= t.w && s.r >= t.r;
  if (ex.metric === 'REPS') return s.r >= t.r;
  return s.t >= t.t;
}
// Increase is pre-selected when every routine set was logged and met the target; decrease never is.
function autoMark(item, ex, entry) {
  if (!entry) return null;
  const base = item.sets.slice(0, entry.sets);
  if (base.length < entry.sets) return 'keep';
  return base.every((s) => s.done && meets(ex, s, item.target)) ? 'up' : 'keep';
}

/* ---------- history-derived values ---------- */
function sessionStats(s) {
  let sets = 0, vol = 0;
  s.ex.forEach((it) => { const ex = exById(it.exId); it.sets.forEach((v) => { sets++; if (ex.metric === 'WEIGHT_REPS') vol += v.w * v.r; }); });
  return { sets, vol: round2(vol) };
}
function nextInPlan(plan, history) {
  const last = history.find((s) => s.plan === plan.id);
  if (!last || plan.routines[last.planPos] !== last.routine) return 0;
  return (last.planPos + 1) % plan.routines.length;
}
const lastDone = (rid, history) => history.find((s) => s.routine === rid);

function findPrev(history, entryId, exId) {
  const pack = (s, it, viaEntry) => ({ date: s.date, sets: it.sets, note: it.note, target: it.target, mark: it.mark, entryId: it.entryId, kind: it.kind, viaEntry, routine: s.routine });
  if (entryId) for (const s of history) { const it = s.ex.find((x) => x.entryId === entryId && x.kind === 'routine' && x.sets.length); if (it) return pack(s, it, true); }
  for (const s of history) { const it = s.ex.find((x) => x.exId === exId && x.sets.length); if (it) return pack(s, it, false); }
  return null;
}
function prefillTarget(ex, prev) {
  if (prev.mark && prev.kind === 'routine' && prev.entryId) return progress(ex, entryById(prev.entryId), prev.target, prev.mark);
  return prev.target;
}
function emptyTarget(ex) { return ex.metric === 'WEIGHT_REPS' ? { w: 0, r: 10 } : ex.metric === 'REPS' ? { r: 10 } : { t: 30 }; }

let woUid = 0;
function buildItem(exId, entryId, kind, n, history) {
  const ex = exById(exId);
  const prev = findPrev(history, entryId, exId);
  const target = prev ? prefillTarget(ex, prev) : emptyTarget(ex);
  return { uid: 'i' + (++woUid), exId, entryId, kind, target, sets: Array.from({ length: n }, () => ({ ...target, done: false })), note: '', mark: null, skipped: false, prev };
}
function buildSession(rid, history, planInfo) {
  const r = routineById(rid), d = new Date();
  return {
    routineId: rid, planId: planInfo ? planInfo.planId : null, pos: planInfo ? planInfo.pos : null,
    startedAt: Date.now(), startLabel: String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'),
    rest: null, items: r.entries.map((e) => buildItem(e.ex, e.id, 'routine', e.sets, history)),
  };
}
function demoSession(history) {
  const s = buildSession('push', history, { planId: 'ppl', pos: 0 });
  s.startedAt = Date.now() - 24 * 60000;
  s.startLabel = '18:04';
  s.items[0].sets[0].done = true;
  s.items[0].sets[1].done = true;
  s.rest = { endAt: Date.now() + 20000, total: 150, paused: false, cued: false };
  return s;
}
function sessionToHistory(s) {
  return {
    id: 's' + Date.now(), date: TODAY, start: s.startLabel, tz: 'Europe/Warsaw', routine: s.routineId, plan: s.planId, planPos: s.pos,
    dur: Math.max(1, Math.round((Date.now() - s.startedAt) / 60000)),
    ex: s.items.map((it) => {
      const ex = exById(it.exId);
      const entry = it.entryId ? entryById(it.entryId) : null;
      return {
        exId: it.exId, entryId: it.entryId, kind: it.skipped ? 'skipped' : it.kind, target: it.target, note: it.note,
        sets: it.skipped ? [] : it.sets.filter((x) => x.done).map((x) => { const v = { ...x }; delete v.done; return v; }),
        mark: it.kind === 'routine' && !it.skipped ? it.mark || autoMark(it, ex, entry) : null,
      };
    }),
  };
}
function sessionProgress(s) {
  let done = 0, total = 0, vol = 0;
  s.items.forEach((it) => { if (it.skipped) return; const ex = exById(it.exId); it.sets.forEach((x) => { total++; if (x.done) { done++; if (ex.metric === 'WEIGHT_REPS') vol += x.w * x.r; } }); });
  return { done, total, vol: round2(vol) };
}

function beep() {
  try {
    const C = window.AudioContext || window.webkitAudioContext; const c = new C();
    [0, 0.3].forEach((d) => {
      const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 880; o.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(0.0001, c.currentTime + d); g.gain.exponentialRampToValueAtTime(0.2, c.currentTime + d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d + 0.22); o.start(c.currentTime + d); o.stop(c.currentTime + d + 0.25);
    });
  } catch (e) { /* audio blocked */ }
}

/* ---------- modal host (dialogs cover the app window, not the scroll area) ---------- */
const ModalHostCtx = React.createContext(null);
function Overlay({ open, children }) {
  const host = React.useContext(ModalHostCtx);
  if (!open || !host) return null;
  return ReactDOM.createPortal(<div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>{children}</div>, host);
}
function Modal(props) { return <Overlay open={props.open}><Dialog {...props} open /></Overlay>; }

/* ---------- small shared pieces ---------- */
function MuscleBadges({ muscles }) {
  return <span style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap' }}>{muscles.map((m) => <Badge key={m} tone="neutral">{MUSCLES[m]}</Badge>)}</span>;
}
function MarkBadge({ mark }) {
  if (mark === 'up') return <Badge tone="accent" icon="arrow-up">Zwiększ</Badge>;
  if (mark === 'down') return <Badge tone="neutral" icon="arrow-down">Zmniejsz</Badge>;
  if (mark === 'keep') return <Badge tone="neutral" icon="equal">Utrzymaj</Badge>;
  return null;
}
function KindBadge({ kind }) {
  if (kind === 'extra') return <Badge tone="accent">Dodatkowe</Badge>;
  if (kind === 'swap') return <Badge tone="accent">Zamienione</Badge>;
  if (kind === 'skipped') return <Badge tone="neutral">Pominięte</Badge>;
  return null;
}
function FieldLabel({ children }) { return <span style={{ font: 'var(--type-label)', color: 'var(--text-muted)' }}>{children}</span>; }

function MetricSteppers({ ex, value, onChange, min = 0, size = 'md' }) {
  if (ex.metric === 'TIME') return <Stepper size={size} value={value.t} step={ex.step} min={min} max={3600} format={(v) => fmtTime(v) + (ex.perSide ? '/str.' : '')} onChange={(t) => onChange({ ...value, t })} />;
  const reps = <Stepper size={size} value={value.r} step={1} min={min} max={100} unit={ex.perSide ? '/str.' : 'powt.'} onChange={(r) => onChange({ ...value, r })} />;
  if (ex.metric === 'REPS') return reps;
  return <React.Fragment><Stepper size={size} value={value.w} step={ex.step} min={0} max={1000} unit="kg" onChange={(w) => onChange({ ...value, w })} />{reps}</React.Fragment>;
}

function SetLine({ ex, n, set, next, onChange, onLog, onUnlog }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 42, padding: '4px 8px', borderRadius: 'var(--radius-sm)', background: next ? 'var(--accent-soft)' : 'transparent' }}>
      <span style={{ width: 16, font: 'var(--weight-semibold) var(--text-label)/1 var(--font-mono)', color: next ? 'var(--accent-hover)' : 'var(--text-faint)' }}>{n}</span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {set.done
          ? <span style={{ font: 'var(--weight-semibold) var(--text-body-lg)/1 var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--text-strong)' }}>{fmtVal(ex, set)}</span>
          : <MetricSteppers ex={ex} value={set} onChange={onChange} />}
      </div>
      {set.done
        ? <IconButton icon="check" label="Cofnij zapis serii" onClick={onUnlog} style={{ background: 'var(--status-success)', color: '#fff' }} />
        : <IconButton icon="check" variant={next ? 'primary' : 'secondary'} label="Zapisz serię" onClick={onLog} />}
    </div>
  );
}

function PrevStrip({ ex, prev }) {
  const box = { display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 11px', borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)', border: '1px solid var(--border-hairline)' };
  if (!prev) return <div style={box}><Icon name="history" size={14} color="var(--text-faint)" style={{ marginTop: 1 }} /><span style={{ font: 'var(--type-label)', color: 'var(--text-muted)' }}>Brak historii — ustaw cel, a wszystkie serie go skopiują.</span></div>;
  return (
    <div style={box}>
      <Icon name="history" size={14} color="var(--text-faint)" style={{ marginTop: 1 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
        <span style={{ font: 'var(--type-label)', color: 'var(--text-muted)' }}>Poprzednio · {fmtAgo(prev.date)}{prev.viaEntry ? '' : ' · ' + routineById(prev.routine).name}</span>
        <span style={{ font: 'var(--weight-semibold) var(--text-body)/1.2 var(--font-mono)', color: 'var(--text-strong)' }}>{fmtLogged(ex, prev.sets)}</span>
        {prev.note && <span style={{ font: 'var(--type-label)', color: 'var(--text-muted)' }}>„{prev.note}”</span>}
      </div>
    </div>
  );
}

Object.assign(window, {
  exById, routineById, planById, entryById, round2, fmtNum, fmtTime, fmtClock, fmtW, fmtVal, fmtTarget, fmtLogged, fmtStep, fmtProg,
  D, daysAgo, fmtAgo, fmtDay, fmtMonth, progress, meets, autoMark, sessionStats, nextInPlan, lastDone, findPrev, prefillTarget,
  buildItem, buildSession, demoSession, sessionToHistory, sessionProgress, beep,
  ModalHostCtx, Overlay, Modal, MuscleBadges, MarkBadge, KindBadge, FieldLabel, MetricSteppers, SetLine, PrevStrip,
});
