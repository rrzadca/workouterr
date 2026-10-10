const { Toolbar, Button, Card, TextField, Tag, Switch, SegmentedControl, Icon } = window.WorkouterrDesignSystem_3a7282;

const METRIC_ITEMS = [{ value: 'WEIGHT_REPS', label: 'Ciężar + powt.' }, { value: 'REPS', label: 'Powtórzenia' }, { value: 'TIME', label: 'Czas' }];

function ExercisesScreen({ notify }) {
  const [, force] = React.useReducer((x) => x + 1, 0);
  const [tab, setTab] = React.useState('active');
  const [q, setQ] = React.useState('');
  const [groups, setGroups] = React.useState([]);
  const [sel, setSel] = React.useState('bench');
  const [draft, setDraft] = React.useState(null);
  const [blocked, setBlocked] = React.useState(null);
  const ex = sel === 'new' ? null : exById(sel);

  React.useEffect(() => {
    if (sel === 'new') setDraft({ name: '', desc: '', metric: 'WEIGHT_REPS', step: 2.5, perSide: false, muscles: [] });
    else { const e = exById(sel); setDraft({ ...e, muscles: [...e.muscles] }); }
  }, [sel]);

  const rows = EXERCISES.filter((e) => (tab === 'archived' ? e.archived : !e.archived)
    && (!groups.length || e.muscles.some((m) => groups.includes(m)))
    && e.name.toLowerCase().includes(q.toLowerCase()));
  const usedIn = (id) => ROUTINES.filter((r) => !r.archived && r.entries.some((e) => e.ex === id));
  const toggleGroup = (k) => setGroups((g) => (g.includes(k) ? g.filter((x) => x !== k) : [...g, k]));
  const toggleDraftGroup = (k) => setDraft((d) => ({ ...d, muscles: d.muscles.includes(k) ? d.muscles.filter((x) => x !== k) : [...d.muscles, k] }));
  const locked = ex && ex.used;
  const cols = 'minmax(0,1fr) 150px 112px 62px';

  const save = () => {
    if (!draft.name.trim() || !draft.muscles.length) { notify({ tone: 'danger', title: 'Uzupełnij ćwiczenie', message: 'Nazwa i co najmniej jedna partia są wymagane.' }); return; }
    if (sel === 'new') { const id = 'c' + Date.now(); EXERCISES.push({ ...draft, id, used: false, archived: false, added: false }); setSel(id); }
    else Object.assign(ex, draft);
    force();
    notify({ tone: 'success', title: 'Ćwiczenie zapisane' });
  };
  const archive = () => {
    const rs = usedIn(ex.id);
    if (rs.length) { setBlocked(rs); return; }
    ex.archived = true; force();
    notify({ tone: 'info', title: 'Ćwiczenie zarchiwizowane', message: 'Zostaje w historii, wykresach i rekordach.' });
  };
  const restore = () => { ex.archived = false; force(); notify({ tone: 'success', title: 'Ćwiczenie przywrócone' }); };

  return (
    <React.Fragment>
      <Toolbar title="Ćwiczenia" right={<React.Fragment>
        <SegmentedControl items={[{ value: 'active', label: 'Aktywne' }, { value: 'archived', label: 'Archiwum' }]} value={tab} onChange={setTab} />
        <Button variant="primary" icon="plus" onClick={() => setSel('new')}>Nowe ćwiczenie</Button>
      </React.Fragment>} />
      <div style={{ padding: 'var(--gutter-screen)', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField icon="search" placeholder="Szukaj ćwiczenia" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 200, marginRight: 4 }} />
            {MUSCLE_KEYS.map((k) => <Tag key={k} selected={groups.includes(k)} onClick={() => toggleGroup(k)}>{MUSCLES[k]}</Tag>)}
          </div>
          <Card padding="none">
            <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 10, padding: '9px 14px', borderBottom: '1px solid var(--border-hairline)', background: 'var(--surface-sunken)' }}>
              {['Ćwiczenie', 'Partie', 'Mierzone', 'Krok'].map((h) => <span key={h} className="wo-caps">{h}</span>)}
            </div>
            {rows.map((e) => (
              <div key={e.id} onClick={() => setSel(e.id)} style={{ display: 'grid', gridTemplateColumns: cols, gap: 10, alignItems: 'center', padding: '8px 14px', minHeight: 46, cursor: 'pointer', borderBottom: '1px solid var(--border-hairline)', background: e.id === sel ? 'var(--surface-selected)' : 'transparent' }}>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', font: 'var(--weight-medium) var(--text-body)/1.25 var(--font-ui)', color: 'var(--text-strong)' }}>{e.name}</span>
                  {e.perSide && <span style={{ display: 'block', marginTop: 2, font: 'var(--type-label)', color: 'var(--text-muted)' }}>na stronę</span>}
                </span>
                <MuscleBadges muscles={e.muscles} />
                <span style={{ font: 'var(--type-label)', color: 'var(--text-muted)' }}>{METRICS_SHORT[e.metric]}</span>
                <span style={{ font: 'var(--weight-medium) var(--text-label)/1 var(--font-mono)', color: 'var(--text-body)' }}>{fmtStep(e)}</span>
              </div>
            ))}
            {!rows.length && <div style={{ padding: 28, textAlign: 'center', font: 'var(--type-body)', color: 'var(--text-muted)' }}>{tab === 'archived' ? 'Archiwum jest puste.' : 'Brak ćwiczeń dla tych filtrów.'}</div>}
          </Card>
        </div>

        {draft && (
          <Card title={sel === 'new' ? 'Nowe ćwiczenie' : draft.name || 'Ćwiczenie'} subtitle={ex ? (ex.archived ? 'Zarchiwizowane' : ex.used ? 'Używane w treningach' : 'Jeszcze nieużywane') : 'Trafi do Twojej biblioteki'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <TextField label="Nazwa" value={draft.name} onChange={(e) => { const v = e.target.value; setDraft((d) => ({ ...d, name: v })); }} />
              <TextField label="Opis" value={draft.desc} onChange={(e) => { const v = e.target.value; setDraft((d) => ({ ...d, desc: v })); }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <FieldLabel>Mierzone wartości</FieldLabel>
                <div style={{ opacity: locked ? 0.55 : 1, pointerEvents: locked ? 'none' : 'auto' }}>
                  <SegmentedControl fullWidth size="sm" items={METRIC_ITEMS} value={draft.metric} onChange={(v) => setDraft((d) => ({ ...d, metric: v, step: v === 'TIME' ? 5 : v === 'REPS' ? 1 : 2.5 }))} />
                </div>
                {locked && <span style={{ display: 'flex', gap: 6, font: 'var(--weight-regular) var(--text-caption)/1.4 var(--font-ui)', color: 'var(--text-faint)' }}><Icon name="lock" size={11} style={{ marginTop: 2 }} />Ćwiczenie było używane w treningu — utwórz nowe, żeby mierzyć coś innego.</span>}
              </div>
              {draft.metric === 'WEIGHT_REPS' && <TextField label="Krok ciężaru" hint="Dla przycisków +/− i progresji" numeric align="right" suffix="kg" value={String(draft.step).replace('.', ',')} onChange={(e) => { const v = parseFloat(e.target.value.replace(',', '.')); setDraft((d) => ({ ...d, step: isNaN(v) ? 0 : v })); }} />}
              {draft.metric === 'TIME' && <TextField label="Krok czasu" hint="Od 1 s do 10 min" numeric align="right" suffix="s" value={String(draft.step)} onChange={(e) => { const v = parseInt(e.target.value, 10); setDraft((d) => ({ ...d, step: isNaN(v) ? 0 : v })); }} />}
              {draft.metric === 'REPS' && <span style={{ font: 'var(--type-label)', color: 'var(--text-muted)' }}>Krok powtórzeń jest zawsze 1.</span>}
              <Switch label="Na stronę" description="Wartości liczone dla każdej strony, np. 10/stronę" checked={draft.perSide} onChange={(v) => setDraft((d) => ({ ...d, perSide: v }))} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <FieldLabel>Partie mięśniowe</FieldLabel>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{MUSCLE_KEYS.map((k) => <Tag key={k} selected={draft.muscles.includes(k)} onClick={() => toggleDraftGroup(k)}>{MUSCLES[k]}</Tag>)}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button variant="primary" onClick={save}>Zapisz</Button>
                {ex && !ex.archived && <Button variant="ghost" icon="archive" onClick={archive}>Archiwizuj</Button>}
                {ex && ex.archived && <Button icon="archive-restore" onClick={restore}>Przywróć</Button>}
              </div>
            </div>
          </Card>
        )}
      </div>

      <Modal open={!!blocked} width={420} title="Nie można zarchiwizować"
        description={ex ? '„' + ex.name + '” jest w rutynach. Najpierw usuń je z:' : ''}
        onClose={() => setBlocked(null)}>
        {blocked && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>{blocked.map((r) => <Tag key={r.id} icon="list-checks">{r.name}</Tag>)}</div>}
      </Modal>
    </React.Fragment>
  );
}
Object.assign(window, { ExercisesScreen });
