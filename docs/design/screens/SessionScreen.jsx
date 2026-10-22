const { Toolbar, Button, Card, RestTimer, StatTile, Badge, Checkbox, Stepper, TextField, Icon } = window.WorkouterrDesignSystem_3a7282;

function ExtraSaveRow({ item, cfg, onChange }) {
  const ex = exById(item.exId);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)', border: '1px solid var(--border-hairline)' }}>
      <Checkbox label={ex.name} description={item.kind === 'swap' ? 'Zamiast: ' + exById(item.replaces).name : 'Ćwiczenie dodatkowe'} checked={cfg.on} onChange={(e) => onChange({ on: e.target.checked })} />
      {cfg.on && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', paddingLeft: 23 }}>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><FieldLabel>Serie</FieldLabel><Stepper value={cfg.sets} min={1} max={20} onChange={(v) => onChange({ sets: v })} /></span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><FieldLabel>Przerwa</FieldLabel><Stepper value={cfg.rest} step={15} min={15} max={600} format={fmtTime} onChange={(v) => onChange({ rest: v })} /></span>
          {ex.metric === 'WEIGHT_REPS'
            ? <TextField label="Drabinka powtórzeń" value={cfg.ladder} onChange={(e) => onChange({ ladder: e.target.value })} style={{ width: 130 }} />
            : <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><FieldLabel>Progresja</FieldLabel><span style={{ font: 'var(--weight-semibold) var(--text-body)/28px var(--font-mono)', color: 'var(--text-strong)' }}>± {ex.metric === 'REPS' ? '1 powt.' : fmtTime(ex.step)}</span></span>}
        </div>
      )}
    </div>
  );
}

function SessionScreen({ session, setSession, history, settings, onFinish, onDiscard }) {
  const routine = routineById(session.routineId);
  const plan = session.planId ? planById(session.planId) : null;
  const [now, setNow] = React.useState(Date.now());
  const [cue, setCue] = React.useState(false);
  const [picker, setPicker] = React.useState(null);
  const [finishing, setFinishing] = React.useState(false);
  const [discarding, setDiscarding] = React.useState(false);
  const [save, setSave] = React.useState({});

  React.useEffect(() => { const t = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(t); }, []);
  const rest = session.rest;
  // The timer stores its end time, so it stays correct after the tab was hidden.
  const remaining = rest ? (rest.paused ? rest.left : Math.max(0, Math.ceil((rest.endAt - now) / 1000))) : 0;
  React.useEffect(() => {
    if (rest && !rest.paused && !rest.cued && remaining <= 0) {
      setSession((s) => ({ ...s, rest: { ...s.rest, cued: true } }));
      setCue(true);
      if (settings.sound) beep();
    }
  }, [remaining, rest]);

  const update = (uid, fn) => setSession((s) => ({ ...s, items: s.items.map((it) => (it.uid === uid ? fn(it) : it)) }));
  const logSet = (uid, i) => setSession((s) => {
    const it = s.items.find((x) => x.uid === uid);
    const entry = it.entryId ? entryById(it.entryId) : null;
    const secs = entry ? entry.rest : 90;
    return {
      ...s,
      items: s.items.map((x) => (x.uid === uid ? { ...x, sets: x.sets.map((v, j) => (j === i ? { ...v, done: true } : v)) } : x)),
      rest: { endAt: Date.now() + secs * 1000, total: secs, paused: false, cued: false },
    };
  });
  const unlog = (uid, i) => update(uid, (it) => ({ ...it, sets: it.sets.map((v, j) => (j === i ? { ...v, done: false } : v)) }));
  const togglePause = () => setSession((s) => ({ ...s, rest: s.rest.paused ? { ...s.rest, paused: false, endAt: Date.now() + s.rest.left * 1000 } : { ...s.rest, paused: true, left: remaining } }));
  const skipRest = () => setSession((s) => ({ ...s, rest: null }));

  const onPick = (exId) => {
    if (picker.mode === 'add') {
      setSession((s) => ({ ...s, items: [...s.items, buildItem(exId, null, 'extra', 3, history)] }));
    } else {
      setSession((s) => ({ ...s, items: s.items.map((it) => (it.uid === picker.uid ? { ...buildItem(exId, null, 'swap', it.sets.length, history), replaces: it.exId } : it)) }));
    }
    setPicker(null);
  };

  const activeItem = session.items.find((it) => !it.skipped && it.sets.some((s) => !s.done));
  const nextIdx = activeItem ? activeItem.sets.findIndex((s) => !s.done) : -1;
  const sp = sessionProgress(session);
  const extras = session.items.filter((it) => it.kind !== 'routine' && it.sets.some((s) => s.done));
  const cfgOf = (it) => save[it.uid] || { on: true, sets: 3, rest: 90, ladder: '8 / 10 / 12' };

  const confirmFinish = () => {
    let saved = 0;
    extras.forEach((it) => {
      const c = cfgOf(it);
      if (!c.on) return;
      const ex = exById(it.exId);
      const ladder = c.ladder.split(/[^0-9]+/).map(Number).filter((n) => n >= 1 && n <= 100);
      routine.entries.push({ id: 'e' + Date.now() + saved, ex: it.exId, sets: c.sets, rest: c.rest, ladder: ex.metric === 'WEIGHT_REPS' ? [...new Set(ladder.length ? ladder : [8, 10, 12])].sort((a, b) => a - b).slice(0, 10) : undefined });
      saved++;
    });
    setFinishing(false);
    onFinish(session, saved > 0);
  };

  return (
    <div style={{ minHeight: '100%' }}>
      <Toolbar title={routine.name} right={
        <React.Fragment>
          <Badge tone="neutral" icon="eye">Ekran nie wygaśnie</Badge>
          <Badge tone="accent" icon="clock">{fmtClock((now - session.startedAt) / 1000)}</Badge>
          <Button variant="ghost" onClick={() => setDiscarding(true)}>Odrzuć</Button>
          <Button variant="primary" icon="flag" onClick={() => setFinishing(true)}>Zakończ trening</Button>
        </React.Fragment>}>
        {plan && <Badge tone="neutral" icon="repeat">{plan.name} · {session.pos + 1}/{plan.routines.length}</Badge>}
      </Toolbar>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 288px', gap: 16, padding: 'var(--gutter-screen)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          {session.items.map((it) => (
            <SessionExercise key={it.uid} item={it} active={activeItem && activeItem.uid === it.uid}
              onUpdate={(fn) => update(it.uid, fn)} onLog={(i) => logSet(it.uid, i)} onUnlog={(i) => unlog(it.uid, i)}
              onSwap={() => setPicker({ mode: 'swap', uid: it.uid, preset: exById(it.exId).muscles, exclude: [it.exId] })}
              onRemove={() => setSession((s) => ({ ...s, items: s.items.filter((x) => x.uid !== it.uid) }))} />
          ))}
          <Button size="lg" icon="plus" onClick={() => setPicker({ mode: 'add', preset: [], exclude: [] })} style={{ alignSelf: 'flex-start' }}>Dodaj ćwiczenie</Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 16 }}>
          {rest
            ? <RestTimer remaining={remaining} total={rest.total} running={!rest.paused} onToggle={togglePause} onSkip={skipRest} />
            : <Card inset padding="sm"><span style={{ display: 'flex', gap: 8, alignItems: 'center', font: 'var(--type-label)', color: 'var(--text-muted)' }}><Icon name="timer" size={14} />Przerwa wystartuje sama po zapisaniu serii.</span></Card>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatTile label="Serie" value={sp.done + '/' + sp.total} icon="layers" />
            <StatTile label="Objętość" value={fmtNum(sp.vol)} unit="kg" icon="weight" tone="accent" />
          </div>
          <Card title="Ćwiczenia" bodyStyle={{ padding: '2px 6px 8px' }}>
            {session.items.map((it) => {
              const ex = exById(it.exId);
              const d = it.sets.filter((s) => s.done).length;
              const isActive = activeItem && activeItem.uid === it.uid;
              const icon = it.skipped ? 'skip-forward' : d === it.sets.length ? 'circle-check' : isActive ? 'circle-dot' : 'circle';
              const color = it.skipped ? 'var(--text-faint)' : d === it.sets.length ? 'var(--status-success)' : isActive ? 'var(--accent)' : 'var(--text-faint)';
              return (
                <div key={it.uid} style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 32, padding: '0 8px' }}>
                  <Icon name={icon} size={14} color={color} />
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', font: (isActive ? 'var(--weight-semibold) ' : 'var(--weight-regular) ') + 'var(--text-body)/1.2 var(--font-ui)', color: it.skipped ? 'var(--text-faint)' : 'var(--text-body)' }}>{ex.name}</span>
                  <span style={{ font: 'var(--weight-medium) var(--text-caption)/1 var(--font-mono)', color: 'var(--text-faint)' }}>{it.skipped ? '—' : d + '/' + it.sets.length}</span>
                </div>
              );
            })}
          </Card>
        </div>
      </div>

      <Overlay open={cue}>
        <div onClick={() => setCue(false)} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: 'var(--brand-navy)', color: '#fff', textAlign: 'center', padding: 32, animation: 'wo-pop var(--dur-base) var(--ease-out)' }}>
          <Icon name="timer" size={56} color="var(--highlight)" />
          <div style={{ font: 'var(--weight-regular) var(--text-display-1)/1 var(--font-display)', letterSpacing: 'var(--tracking-display)', textTransform: 'uppercase' }}>Koniec przerwy</div>
          {activeItem && <div style={{ font: 'var(--weight-medium) var(--text-title-3)/1.4 var(--font-ui)', color: 'rgba(255,255,255,.75)' }}>Seria {nextIdx + 1} · {exById(activeItem.exId).name} · <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>{fmtVal(exById(activeItem.exId), activeItem.sets[nextIdx])}</span></div>}
          <Button variant="highlight" size="xl" icon="play" onClick={() => setCue(false)} style={{ marginTop: 8 }}>Dalej</Button>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--type-label)', color: 'rgba(255,255,255,.5)' }}><Icon name={settings.sound ? 'volume-2' : 'volume-x'} size={13} />{settings.sound ? 'Dźwięk włączony' : 'Dźwięk wyłączony'} · zmienisz w ustawieniach</span>
        </div>
      </Overlay>

      <ExercisePicker open={!!picker} title={picker && picker.mode === 'swap' ? 'Zamień ćwiczenie' : 'Dodaj ćwiczenie'}
        subtitle={picker && picker.mode === 'swap' ? 'Partie zamienianego ćwiczenia są już zaznaczone.' : 'Cel z ostatniego wykonania tego ćwiczenia, bez progresji.'}
        preset={picker ? picker.preset : []} exclude={picker ? picker.exclude : []} onPick={onPick} onClose={() => setPicker(null)} />

      <Modal open={finishing} width={480} title="Zakończyć trening?"
        description={'Zapisane serie: ' + sp.done + ' z ' + sp.total + '. Niezapisane serie zostaną pominięte.'}
        onClose={() => setFinishing(false)}
        secondaryAction={<Button size="lg" onClick={() => setFinishing(false)}>Wróć</Button>}
        primaryAction={<Button size="lg" variant="primary" onClick={confirmFinish}>Zakończ trening</Button>}>
        {extras.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="wo-caps">Zapisać w rutynie {routine.name}?</span>
            {extras.map((it) => <ExtraSaveRow key={it.uid} item={it} cfg={cfgOf(it)} onChange={(p) => setSave((m) => ({ ...m, [it.uid]: { ...cfgOf(it), ...p } }))} />)}
          </div>
        )}
      </Modal>

      <Modal open={discarding} width={380} title="Odrzucić trening?" description="Nic z tego treningu nie zostanie zapisane."
        onClose={() => setDiscarding(false)}
        secondaryAction={<Button size="lg" onClick={() => setDiscarding(false)}>Wróć</Button>}
        primaryAction={<Button size="lg" variant="danger" onClick={() => { setDiscarding(false); onDiscard(); }}>Odrzuć</Button>} />
    </div>
  );
}
Object.assign(window, { SessionScreen });
