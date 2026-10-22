const { Toolbar, Button, IconButton, Card, Badge, TextField, Select, Icon } = window.WorkouterrDesignSystem_3a7282;

function PlansScreen({ history, activePlanId, setActivePlanId, notify }) {
  const [, force] = React.useReducer((x) => x + 1, 0);
  const [sel, setSel] = React.useState(activePlanId || PLANS[0].id);
  const [addId, setAddId] = React.useState('');
  const p = planById(sel);
  const pos = nextInPlan(p, history);
  const last = history.find((s) => s.plan === p.id);
  const isActive = p.id === activePlanId;
  const mut = (fn) => { fn(p); force(); };
  const available = ROUTINES.filter((r) => !r.archived);

  return (
    <React.Fragment>
      <Toolbar title="Plany treningowe" right={<Button icon="plus" onClick={() => { const id = 'pl' + Date.now(); PLANS.push({ id, name: 'Nowy plan', desc: '', routines: [available[0].id] }); setSel(id); }}>Nowy plan</Button>} />
      <div style={{ padding: 'var(--gutter-screen)', display: 'grid', gridTemplateColumns: '260px minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card padding="none">
            {PLANS.map((x) => (
              <button key={x.id} type="button" onClick={() => setSel(x.id)} style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%', padding: '12px 14px', border: 'none', borderBottom: '1px solid var(--border-hairline)', background: x.id === sel ? 'var(--surface-selected)' : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ font: 'var(--weight-semibold) var(--text-body)/1.2 var(--font-ui)', color: 'var(--text-strong)' }}>{x.name}</span>
                  {x.id === activePlanId && <Badge tone="success" icon="check">Aktywny</Badge>}
                </span>
                <span style={{ font: 'var(--weight-regular) var(--text-label)/1.3 var(--font-mono)', color: 'var(--text-muted)' }}>{x.routines.map((rid) => routineById(rid).name).join(' → ')}</span>
              </button>
            ))}
          </Card>
          {!activePlanId && <Card inset padding="sm"><span style={{ font: 'var(--type-label)', color: 'var(--text-muted)' }}>Brak aktywnego planu — na ekranie Start wybierasz rutynę samodzielnie.</span></Card>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <Card title={p.name} subtitle={p.desc || 'Bez opisu'}
            actions={isActive
              ? <Button onClick={() => { setActivePlanId(null); notify({ tone: 'info', title: 'Aktywny plan wyczyszczony' }); }}>Wyczyść aktywny plan</Button>
              : <Button variant="primary" icon="check" onClick={() => { setActivePlanId(p.id); notify({ tone: 'success', title: 'Plan aktywny', message: 'Następny: ' + routineById(p.routines[pos]).name }); }}>Ustaw jako aktywny</Button>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, flexWrap: 'wrap' }}>
                {p.routines.map((rid, i) => {
                  const on = i === pos;
                  return (
                    <React.Fragment key={i}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 104, padding: '10px 12px', borderRadius: 'var(--radius-lg)', background: on ? 'var(--highlight-soft)' : 'var(--surface-sunken)', border: '1px solid ' + (on ? 'var(--highlight)' : 'var(--border-hairline)') }}>
                        <span style={{ font: 'var(--weight-semibold) var(--text-caption)/1 var(--font-mono)', color: 'var(--text-faint)' }}>{i + 1}</span>
                        <span style={{ font: 'var(--weight-semibold) var(--text-body-lg)/1.2 var(--font-ui)', color: 'var(--text-strong)' }}>{routineById(rid).name}</span>
                        {on && <Badge tone="highlight">{isActive ? 'Następny' : 'Start od'}</Badge>}
                      </div>
                      {i < p.routines.length - 1 && <span style={{ display: 'flex', alignItems: 'center' }}><Icon name="arrow-right" size={14} color="var(--text-faint)" /></span>}
                    </React.Fragment>
                  );
                })}
                <span style={{ display: 'flex', alignItems: 'center' }}><Icon name="repeat" size={15} color="var(--text-faint)" /></span>
              </div>
              <span style={{ font: 'var(--type-label)', color: 'var(--text-muted)' }}>
                {last ? 'Ostatnio w tym planie: ' + routineById(last.routine).name + ' · ' + fmtDay(last.date) + ' (' + fmtAgo(last.date) + ')' : 'Plan jeszcze nieużywany — zacznie od pierwszej rutyny.'}
              </span>
            </div>
          </Card>

          <Card title="Rutyny w planie" subtitle="Rotacja wynika z historii — edycja lub usunięcie treningu sama ją koryguje. Rutyna spoza planu nie przesuwa rotacji." bodyStyle={{ padding: '6px 10px 12px' }}>
            {p.routines.map((rid, i) => {
              const r = routineById(rid);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44, padding: '0 6px', borderBottom: '1px solid var(--border-hairline)' }}>
                  <span style={{ display: 'flex' }}>
                    <IconButton icon="chevron-up" size="sm" label="W górę" disabled={i === 0} onClick={() => mut((x) => { const a = x.routines; [a[i - 1], a[i]] = [a[i], a[i - 1]]; })} />
                    <IconButton icon="chevron-down" size="sm" label="W dół" disabled={i === p.routines.length - 1} onClick={() => mut((x) => { const a = x.routines; [a[i + 1], a[i]] = [a[i], a[i + 1]]; })} />
                  </span>
                  <span style={{ width: 18, font: 'var(--weight-semibold) var(--text-label)/1 var(--font-mono)', color: 'var(--text-faint)' }}>{i + 1}</span>
                  <span style={{ flex: 1, minWidth: 0, font: 'var(--weight-medium) var(--text-body)/1.2 var(--font-ui)', color: 'var(--text-strong)' }}>{r.name}</span>
                  <span style={{ font: 'var(--type-label)', color: 'var(--text-muted)' }}>{r.entries.length} ćwiczenia</span>
                  <IconButton icon="trash-2" label="Usuń z planu" disabled={p.routines.length <= 1} onClick={() => mut((x) => { x.routines = x.routines.filter((_, j) => j !== i); })} />
                </div>
              );
            })}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', paddingTop: 12 }}>
              <Select options={[{ value: '', label: 'Wybierz rutynę…' }].concat(available.map((r) => ({ value: r.id, label: r.name })))} value={addId} onChange={(e) => setAddId(e.target.value)} style={{ width: 200 }} />
              <Button icon="plus" disabled={!addId} onClick={() => { mut((x) => { x.routines.push(addId); }); setAddId(''); }}>Dodaj do planu</Button>
            </div>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
}
Object.assign(window, { PlansScreen });
