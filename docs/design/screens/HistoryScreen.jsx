const { Toolbar, Button, Card, Badge, TextField, Icon } = window.WorkouterrDesignSystem_3a7282;

function num(v) { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? 0 : n; }

function HistoryScreen({ history, setHistory, selected, setSelected, notify }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(null);
  const [confirm, setConfirm] = React.useState(false);
  const s = history.find((x) => x.id === selected) || history[0];
  React.useEffect(() => { setEditing(false); }, [selected]);

  const months = [];
  history.forEach((h) => { const m = fmtMonth(h.date); let g = months.find((x) => x.m === m); if (!g) months.push((g = { m, items: [] })); g.items.push(h); });
  const view = editing ? draft : s;
  const editSet = (ei, si, key, val) => setDraft((d) => ({ ...d, ex: d.ex.map((it, i) => (i !== ei ? it : { ...it, sets: it.sets.map((v, j) => (j === si ? { ...v, [key]: num(val) } : v)) })) }));
  const editTarget = (ei, key, val) => setDraft((d) => ({ ...d, ex: d.ex.map((it, i) => (i !== ei ? it : { ...it, target: { ...it.target, [key]: num(val) } })) }));
  const editNote = (ei, val) => setDraft((d) => ({ ...d, ex: d.ex.map((it, i) => (i !== ei ? it : { ...it, note: val })) }));
  const keysOf = (ex) => (ex.metric === 'WEIGHT_REPS' ? ['w', 'r'] : ex.metric === 'REPS' ? ['r'] : ['t']);
  const sfx = { w: 'kg', r: 'powt.', t: 's' };

  return (
    <React.Fragment>
      <Toolbar title="Historia" />
      {!s ? (
        <div style={{ padding: 48, textAlign: 'center', font: 'var(--type-body)', color: 'var(--text-muted)' }}>Nie masz jeszcze żadnych treningów.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px minmax(0,1fr)', gap: 16, padding: 'var(--gutter-screen)', alignItems: 'start' }}>
          <Card padding="none">
            {months.map((g) => (
              <div key={g.m}>
                <div className="wo-caps" style={{ padding: '10px 14px 6px', background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-hairline)' }}>{g.m}</div>
                {g.items.map((h) => {
                  const on = h.id === s.id;
                  const st = sessionStats(h);
                  const d = D(h.date);
                  return (
                    <button key={h.id} type="button" onClick={() => setSelected(h.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 14px', border: 'none', borderBottom: '1px solid var(--border-hairline)', background: on ? 'var(--surface-selected)' : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                      <span style={{ width: 36, textAlign: 'center', flex: '0 0 auto' }}>
                        <span style={{ display: 'block', font: 'var(--weight-semibold) var(--text-title-3)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{d.getDate()}</span>
                        <span style={{ display: 'block', marginTop: 3, font: 'var(--weight-medium) var(--text-caption)/1 var(--font-ui)', color: 'var(--text-muted)' }}>{d.toLocaleDateString('pl-PL', { weekday: 'short' })}</span>
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ font: 'var(--weight-semibold) var(--text-body)/1.2 var(--font-ui)', color: 'var(--text-strong)' }}>{routineById(h.routine).name}</span>
                          {!h.plan && <Badge tone="neutral">Poza planem</Badge>}
                        </span>
                        <span style={{ display: 'block', marginTop: 4, font: 'var(--weight-regular) var(--text-label)/1 var(--font-mono)', color: 'var(--text-muted)' }}>{h.dur} min · {st.sets} serii · {fmtNum(st.vol)} kg</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </Card>

          <Card title={routineById(view.routine).name}
            subtitle={fmtDay(view.date, true) + ' · ' + view.start + ' (' + view.tz + ')' + (view.plan ? ' · ' + planById(view.plan).name : ' · poza planem')}
            actions={editing
              ? <React.Fragment><Button onClick={() => setEditing(false)}>Anuluj</Button><Button variant="primary" icon="check" onClick={() => { setHistory((h) => h.map((x) => (x.id === draft.id ? draft : x))); setEditing(false); notify({ tone: 'success', title: 'Zmiany zapisane', message: 'Wykresy i rekordy przeliczone.' }); }}>Zapisz</Button></React.Fragment>
              : <React.Fragment><Button icon="pencil" onClick={() => { setDraft(JSON.parse(JSON.stringify(s))); setEditing(true); }}>Edytuj</Button><Button variant="ghost" icon="trash-2" onClick={() => setConfirm(true)}>Usuń</Button></React.Fragment>}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {view.ex.map((it, ei) => {
                const ex = exById(it.exId);
                const entry = it.entryId ? entryById(it.entryId) : null;
                const n = entry && it.kind === 'routine' ? entry.sets : it.sets.length;
                return (
                  <div key={ei} style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '12px 0', borderTop: ei ? '1px solid var(--border-hairline)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ font: 'var(--weight-semibold) var(--text-body-lg)/1.2 var(--font-ui)', color: it.kind === 'skipped' ? 'var(--text-muted)' : 'var(--text-strong)' }}>{ex.name}</span>
                      <KindBadge kind={it.kind} />
                      <span style={{ flex: 1 }} />
                      <MarkBadge mark={it.mark} />
                    </div>
                    {it.kind !== 'skipped' && (editing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span className="wo-caps" style={{ width: 44 }}>Cel</span>
                          {keysOf(ex).map((k) => <TextField key={k} size="sm" numeric align="right" suffix={sfx[k]} value={String(it.target[k]).replace('.', ',')} onChange={(e) => editTarget(ei, k, e.target.value)} style={{ width: 92 }} />)}
                        </div>
                        {it.sets.map((v, si) => (
                          <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ width: 44, font: 'var(--weight-semibold) var(--text-label)/1 var(--font-mono)', color: 'var(--text-faint)' }}>{si + 1}</span>
                            {keysOf(ex).map((k) => <TextField key={k} size="sm" numeric align="right" suffix={sfx[k]} value={String(v[k]).replace('.', ',')} onChange={(e) => editSet(ei, si, k, e.target.value)} style={{ width: 92 }} />)}
                          </div>
                        ))}
                        <TextField size="sm" placeholder="Notatka" value={it.note} onChange={(e) => editNote(ei, e.target.value)} />
                      </div>
                    ) : (
                      <React.Fragment>
                        <span style={{ font: 'var(--type-label)', color: 'var(--text-muted)' }}>Cel: <span style={{ fontFamily: 'var(--font-mono)' }}>{fmtTarget(ex, n, it.target)}</span></span>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {it.sets.map((v, si) => (
                            <span key={si} style={{ display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 9px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-sunken)', border: '1px solid var(--border-hairline)', font: 'var(--weight-semibold) var(--text-label)/1 var(--font-mono)', color: meets(ex, v, it.target) ? 'var(--text-strong)' : 'var(--text-muted)' }}>{fmtVal(ex, v)}</span>
                          ))}
                        </div>
                        {it.note && <span style={{ font: 'var(--type-label)', color: 'var(--text-muted)' }}>„{it.note}”</span>}
                      </React.Fragment>
                    ))}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      <Modal open={confirm} width={400} title="Usunąć trening?"
        description={s ? routineById(s.routine).name + ', ' + fmtDay(s.date) + '. Rotacja planu, wykresy i rekordy zostaną przeliczone.' : ''}
        onClose={() => setConfirm(false)}
        secondaryAction={<Button size="lg" onClick={() => setConfirm(false)}>Anuluj</Button>}
        primaryAction={<Button size="lg" variant="danger" onClick={() => { const id = s.id; const rest = history.filter((x) => x.id !== id); setHistory(rest); setSelected(rest[0] ? rest[0].id : null); setConfirm(false); notify({ tone: 'info', title: 'Trening usunięty' }); }}>Usuń</Button>} />
    </React.Fragment>
  );
}
Object.assign(window, { HistoryScreen });
