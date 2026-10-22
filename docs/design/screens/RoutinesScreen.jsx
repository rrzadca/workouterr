const { Toolbar, Button, IconButton, Card, Badge, Tag, TextField, Stepper, Icon } = window.WorkouterrDesignSystem_3a7282;

function LadderEditor({ ladder, onChange }) {
  const [v, setV] = React.useState('');
  const add = () => {
    const n = parseInt(v, 10);
    if (n >= 1 && n <= 100 && !ladder.includes(n) && ladder.length < 10) onChange([...ladder, n].sort((a, b) => a - b));
    setV('');
  };
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
      {ladder.map((r) => <Tag key={r} onRemove={ladder.length > 1 ? () => onChange(ladder.filter((x) => x !== r)) : undefined}>{r}</Tag>)}
      {ladder.length < 10 && <TextField size="sm" numeric align="center" placeholder="+" value={v} onChange={(e) => setV(e.target.value.replace(/\D/g, ''))} onKeyDown={(e) => { if (e.key === 'Enter') add(); }} onBlur={add} style={{ width: 48 }} />}
    </div>
  );
}

function RoutineEntry({ entry, idx, count, onMove, onRemove, onChange }) {
  const ex = exById(entry.ex);
  const col = (label, node) => <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span className="wo-caps">{label}</span>{node}</span>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)', border: '1px solid var(--border-hairline)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          <IconButton icon="chevron-up" size="sm" label="W górę" disabled={idx === 0} onClick={() => onMove(-1)} />
          <IconButton icon="chevron-down" size="sm" label="W dół" disabled={idx === count - 1} onClick={() => onMove(1)} />
        </span>
        <span style={{ width: 18, font: 'var(--weight-semibold) var(--text-label)/1 var(--font-mono)', color: 'var(--text-faint)' }}>{idx + 1}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ font: 'var(--weight-semibold) var(--text-body)/1.25 var(--font-ui)', color: 'var(--text-strong)' }}>{ex.name}</span>
            {entry.isNew && <Badge tone="accent">Nowa pozycja</Badge>}
          </span>
          <span style={{ display: 'block', marginTop: 3, font: 'var(--type-label)', color: 'var(--text-muted)' }}>
            {entry.isNew ? 'Pierwszy cel z ostatniego wykonania tego ćwiczenia' : METRICS_SHORT[ex.metric] + ' · krok ' + fmtStep(ex) + (ex.perSide ? ' · na stronę' : '')}
          </span>
        </span>
        <IconButton icon="trash-2" label="Usuń z rutyny" onClick={onRemove} />
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start', paddingLeft: 56 }}>
        {col('Serie', <Stepper value={entry.sets} min={1} max={20} onChange={(v) => onChange({ sets: v })} />)}
        {col('Przerwa', <Stepper value={entry.rest} step={15} min={15} max={600} format={fmtTime} onChange={(v) => onChange({ rest: v })} />)}
        {col('Progresja', ex.metric === 'WEIGHT_REPS'
          ? <LadderEditor ladder={entry.ladder} onChange={(l) => onChange({ ladder: l })} />
          : <span style={{ font: 'var(--weight-semibold) var(--text-body)/32px var(--font-mono)', color: 'var(--text-strong)' }}>{fmtProg(ex, entry)}</span>)}
      </div>
    </div>
  );
}

function RoutinesScreen({ notify }) {
  const [, force] = React.useReducer((x) => x + 1, 0);
  const [sel, setSel] = React.useState('push');
  const [picker, setPicker] = React.useState(false);
  const [blocked, setBlocked] = React.useState(null);
  const r = routineById(sel);
  const plansUsing = (id) => PLANS.filter((p) => p.routines.includes(id));
  const mut = (fn) => { fn(r); force(); };
  const move = (i, d) => mut((x) => { const e = x.entries; const j = i + d; [e[i], e[j]] = [e[j], e[i]]; });
  const active = ROUTINES.filter((x) => !x.archived);
  const archived = ROUTINES.filter((x) => x.archived);

  const archive = () => {
    const ps = plansUsing(r.id);
    if (ps.length) { setBlocked(ps); return; }
    mut((x) => { x.archived = true; });
    notify({ tone: 'info', title: 'Rutyna zarchiwizowana' });
  };
  const newRoutine = () => { const id = 'r' + Date.now(); ROUTINES.push({ id, name: 'Nowa rutyna', desc: '', entries: [], archived: false }); setSel(id); };

  const listRow = (x) => (
    <button key={x.id} type="button" onClick={() => setSel(x.id)} style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%', padding: '11px 14px', border: 'none', borderBottom: '1px solid var(--border-hairline)', background: x.id === sel ? 'var(--surface-selected)' : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
      <span style={{ font: 'var(--weight-semibold) var(--text-body)/1.2 var(--font-ui)', color: x.archived ? 'var(--text-muted)' : 'var(--text-strong)' }}>{x.name}</span>
      <span style={{ font: 'var(--type-label)', color: 'var(--text-muted)' }}>{x.entries.length} ćwiczenia{x.desc ? ' · ' + x.desc : ''}</span>
      {plansUsing(x.id).length > 0 && <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{plansUsing(x.id).map((p) => <Badge key={p.id} tone="neutral" icon="repeat">{p.name}</Badge>)}</span>}
    </button>
  );

  return (
    <React.Fragment>
      <Toolbar title="Rutyny" right={<React.Fragment>
        {!r.archived ? <Button variant="ghost" icon="archive" onClick={archive}>Archiwizuj</Button> : <Button icon="archive-restore" onClick={() => mut((x) => { x.archived = false; })}>Przywróć</Button>}
        <Button icon="plus" onClick={newRoutine}>Nowa rutyna</Button>
        <Button variant="primary" icon="check" onClick={() => notify({ tone: 'success', title: 'Rutyna zapisana', message: 'Zmiany obowiązują od następnego treningu.' })}>Zapisz</Button>
      </React.Fragment>} />
      <div style={{ padding: 'var(--gutter-screen)', display: 'grid', gridTemplateColumns: '240px minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
        <Card padding="none">
          {active.map(listRow)}
          {archived.length > 0 && <div className="wo-caps" style={{ padding: '10px 14px 6px', background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-hairline)' }}>Zarchiwizowane</div>}
          {archived.map(listRow)}
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          <Card padding="md">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 12 }}>
              <TextField label="Nazwa" value={r.name} onChange={(e) => { const v = e.target.value; mut((x) => { x.name = v; }); }} />
              <TextField label="Opis" value={r.desc} onChange={(e) => { const v = e.target.value; mut((x) => { x.desc = v; }); }} />
            </div>
            <span style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginTop: 10, font: 'var(--weight-regular) var(--text-caption)/1.45 var(--font-ui)', color: 'var(--text-muted)' }}>
              <Icon name="info" size={12} style={{ marginTop: 2 }} />Zmiany obowiązują od następnego treningu. Pozycje zachowują historię przy zmianie kolejności, serii, przerwy i progresji — ćwiczenia w pozycji nie da się zmienić.
            </span>
          </Card>
          {r.entries.map((e, i) => (
            <RoutineEntry key={e.id} entry={e} idx={i} count={r.entries.length} onMove={(d) => move(i, d)}
              onRemove={() => mut((x) => { x.entries = x.entries.filter((y) => y.id !== e.id); })}
              onChange={(p) => mut(() => { Object.assign(e, p); })} />
          ))}
          {!r.entries.length && <Card inset padding="lg"><span style={{ font: 'var(--type-body)', color: 'var(--text-muted)' }}>Rutyna jest pusta — dodaj pierwsze ćwiczenie.</span></Card>}
          <Button size="lg" icon="plus" onClick={() => setPicker(true)} style={{ alignSelf: 'flex-start' }}>Dodaj ćwiczenie</Button>
        </div>
      </div>

      <ExercisePicker open={picker} title="Dodaj ćwiczenie do rutyny" subtitle="To samo ćwiczenie może wystąpić w rutynie kilka razy." preset={[]} exclude={[]} onClose={() => setPicker(false)}
        onPick={(exId) => { const ex = exById(exId); mut((x) => { x.entries.push({ id: 'n' + Date.now(), ex: exId, sets: 3, rest: 90, ladder: ex.metric === 'WEIGHT_REPS' ? [8, 10, 12] : undefined, isNew: true }); }); setPicker(false); }} />

      <Modal open={!!blocked} width={420} title="Nie można zarchiwizować"
        description={'Rutyna „' + r.name + '” jest w planach treningowych. Najpierw usuń ją z:'} onClose={() => setBlocked(null)}>
        {blocked && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>{blocked.map((p) => <Tag key={p.id} icon="repeat">{p.name}</Tag>)}</div>}
      </Modal>
    </React.Fragment>
  );
}
Object.assign(window, { RoutinesScreen });
