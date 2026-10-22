const { Button, Card, ExerciseCard, TextField, SegmentedControl, Icon } = window.WorkouterrDesignSystem_3a7282;

const MARK_ITEMS = [
  { value: 'down', label: 'Zmniejsz', icon: 'arrow-down' },
  { value: 'keep', label: 'Utrzymaj', icon: 'equal' },
  { value: 'up', label: 'Zwiększ', icon: 'arrow-up' },
];

function SessionExercise({ item, active, onUpdate, onLog, onUnlog, onSwap, onRemove }) {
  const ex = exById(item.exId);
  const entry = item.entryId ? entryById(item.entryId) : null;

  if (item.skipped) {
    return (
      <Card padding="sm" inset>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="skip-forward" size={15} color="var(--text-faint)" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: 'var(--weight-semibold) var(--text-body)/1.3 var(--font-ui)', color: 'var(--text-muted)' }}>{ex.name}</div>
            <div style={{ font: 'var(--type-label)', color: 'var(--text-faint)' }}>Pominięte — następnym razem cel z ostatniego wykonania.</div>
          </div>
          <Button size="sm" icon="rotate-ccw" onClick={() => onUpdate((it) => ({ ...it, skipped: false }))}>Przywróć</Button>
        </div>
      </Card>
    );
  }

  // Changing the target updates only sets not yet logged.
  const setTarget = (t) => onUpdate((it) => ({ ...it, target: t, sets: it.sets.map((s) => (s.done ? s : { ...s, ...t })) }));
  const setSet = (i, v) => onUpdate((it) => ({ ...it, sets: it.sets.map((s, j) => (j === i ? { ...s, ...v } : s)) }));
  const addSet = () => onUpdate((it) => ({ ...it, sets: [...it.sets, { ...it.target, done: false }] }));
  const removeSet = () => onUpdate((it) => ({ ...it, sets: it.sets.slice(0, -1) }));
  const nextIdx = item.sets.findIndex((s) => !s.done);
  const auto = autoMark(item, ex, entry);
  const mark = item.mark || auto || 'keep';
  const nextT = entry ? progress(ex, entry, item.target, mark) : item.target;
  const name = item.kind === 'routine' ? ex.name : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>{ex.name}<KindBadge kind={item.kind} /></span>;

  return (
    <ExerciseCard name={name} muscle={ex.muscles.map((m) => MUSCLES[m]).join(' · ')} target={'Cel: ' + fmtTarget(ex, item.sets.length, item.target)} active={active}
      footer={
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button size="sm" icon="plus" onClick={addSet}>Seria</Button>
          <Button size="sm" icon="minus" onClick={removeSet} disabled={item.sets.length <= 1}>Seria</Button>
          <span style={{ flex: 1 }} />
          <Button size="sm" variant="ghost" icon="replace" onClick={onSwap}>Zamień</Button>
          {item.kind === 'routine'
            ? <Button size="sm" variant="ghost" icon="skip-forward" onClick={() => onUpdate((it) => ({ ...it, skipped: true }))}>Pomiń</Button>
            : <Button size="sm" variant="ghost" icon="trash-2" onClick={onRemove}>Usuń</Button>}
        </div>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 8px 6px' }}>
        <PrevStrip ex={ex} prev={item.prev} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '0 8px' }}>
          <span className="wo-caps" style={{ width: 34 }}>Cel</span>
          <MetricSteppers ex={ex} value={item.target} min={ex.metric === 'TIME' ? 1 : 1} onChange={setTarget} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {item.sets.map((s, i) => (
            <SetLine key={i} ex={ex} n={i + 1} set={s} next={active && i === nextIdx}
              onChange={(v) => setSet(i, v)} onLog={() => onLog(i)} onUnlog={() => onUnlog(i)} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField placeholder="Notatka do ćwiczenia" value={item.note} onChange={(e) => { const v = e.target.value; onUpdate((it) => ({ ...it, note: v })); }} style={{ flex: '1 1 180px' }} />
          {entry && <SegmentedControl items={MARK_ITEMS} value={mark} onChange={(v) => onUpdate((it) => ({ ...it, mark: v }))} />}
        </div>
        <span style={{ font: 'var(--type-label)', color: 'var(--text-muted)' }}>
          {entry
            ? <React.Fragment>Następnym razem: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-strong)' }}>{fmtTarget(ex, entry.sets, nextT)}</span>{!item.mark && auto === 'up' ? ' · zaznaczone automatycznie — wszystkie serie na celu' : ''}</React.Fragment>
            : 'Bez progresji — cel przejdzie bez zmian. Przy zakończeniu możesz dodać ćwiczenie do rutyny.'}
        </span>
      </div>
    </ExerciseCard>
  );
}
Object.assign(window, { SessionExercise, MARK_ITEMS });
