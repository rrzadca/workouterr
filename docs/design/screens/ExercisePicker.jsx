const { Button, TextField, Tag } = window.WorkouterrDesignSystem_3a7282;

// Picker for swap / extra / new routine entry. Filters by muscle group (an exercise matches if it has the group).
function ExercisePicker({ open, title, subtitle, preset = [], exclude = [], onPick, onClose }) {
  const [groups, setGroups] = React.useState(preset);
  const [q, setQ] = React.useState('');
  React.useEffect(() => { if (open) { setGroups(preset); setQ(''); } }, [open, preset.join(',')]);
  const toggle = (k) => setGroups((g) => (g.includes(k) ? g.filter((x) => x !== k) : [...g, k]));
  const list = EXERCISES.filter((e) => !e.archived && !exclude.includes(e.id)
    && (!groups.length || e.muscles.some((m) => groups.includes(m)))
    && e.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <Modal open={open} title={title} description={subtitle} width={520} onClose={onClose}
      primaryAction={<Button size="lg" onClick={onClose}>Anuluj</Button>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <TextField icon="search" placeholder="Szukaj ćwiczenia" value={q} onChange={(e) => setQ(e.target.value)} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {MUSCLE_KEYS.map((k) => <Tag key={k} selected={groups.includes(k)} onClick={() => toggle(k)}>{MUSCLES[k]}</Tag>)}
        </div>
        <div className="wo-scroll" style={{ maxHeight: 250, overflowY: 'auto', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)' }}>
          {list.map((e) => (
            <button key={e.id} type="button" onClick={() => onPick(e.id)}
              onMouseEnter={(ev) => { ev.currentTarget.style.background = 'var(--surface-hover)'; }}
              onMouseLeave={(ev) => { ev.currentTarget.style.background = 'transparent'; }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', border: 'none', borderBottom: '1px solid var(--border-hairline)', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ font: 'var(--weight-medium) var(--text-body)/1.2 var(--font-ui)', color: 'var(--text-strong)' }}>{e.name}</span>
                <MuscleBadges muscles={e.muscles} />
              </span>
              <span style={{ font: 'var(--type-label)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{METRICS_SHORT[e.metric]}{e.perSide ? ' · na stronę' : ''}</span>
            </button>
          ))}
          {!list.length && <div style={{ padding: 20, textAlign: 'center', font: 'var(--type-body)', color: 'var(--text-muted)' }}>Brak ćwiczeń dla tych filtrów.</div>}
        </div>
      </div>
    </Modal>
  );
}
Object.assign(window, { ExercisePicker });
