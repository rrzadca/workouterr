const { Toolbar, Card, SegmentedControl, VolumeChart, StatTile, Select, Icon } = window.WorkouterrDesignSystem_3a7282;

function ProgressScreen() {
  const ids = Object.keys(PROGRESS);
  const [exId, setExId] = React.useState('bench');
  const [mode, setMode] = React.useState('top');
  const ex = exById(exId);
  const pts = PROGRESS[exId];
  const wr = ex.metric === 'WEIGHT_REPS';
  const valOf = (p) => (wr ? (mode === 'top' ? p.w : p.w * p.r * p.n) : ex.metric === 'REPS' ? p.r : p.t);
  const data = pts.map((p, i) => ({ label: p.d, value: valOf(p), highlight: i === pts.length - 1 }));
  const unit = wr ? 'kg' : ex.metric === 'REPS' ? 'powt.' : 's';
  const last = pts[pts.length - 1];
  const subtitle = wr ? (mode === 'top' ? 'Najcięższa seria w każdym treningu' : 'Objętość: Σ ciężar × powtórzenia') : 'Najlepsza seria w każdym treningu';
  const rm = REPMAX[exId] || [];
  const heaviest = rm.length ? Math.max(...rm.map((x) => x[1])) : null;
  const best = pts.reduce((m, p) => Math.max(m, valOf(p)), 0);

  return (
    <React.Fragment>
      <Toolbar title="Postęp" right={<Select options={ids.map((id) => ({ value: id, label: exById(id).name }))} value={exId} onChange={(e) => { setExId(e.target.value); setMode('top'); }} style={{ width: 240 }} />} />
      <div style={{ padding: 'var(--gutter-screen)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card title={ex.name} subtitle={subtitle + ' · ze wszystkich rutyn'}
          actions={wr ? <SegmentedControl size="sm" items={[{ value: 'top', label: 'Najcięższa seria' }, { value: 'vol', label: 'Objętość' }]} value={mode} onChange={setMode} /> : null}>
          <VolumeChart data={data} height={190} unit={unit} />
          <div style={{ marginTop: 12, font: 'var(--type-label)', color: 'var(--text-muted)' }}>
            Ostatnio ({last.d}): <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-strong)' }}>{wr ? (mode === 'top' ? fmtVal(ex, last) : fmtNum(valOf(last)) + ' kg') : fmtVal(ex, last)}</span>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
          <Card title="Rekordy ćwiczenia" subtitle="Liczone z zapisanych serii, bez szacowanego 1RM">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {wr && <StatTile label="Najcięższy ciężar" value={fmtNum(heaviest)} unit="kg" icon="trophy" tone="accent" />}
              {ex.metric === 'REPS' && <StatTile label="Najwięcej powtórzeń" value={best} unit="w serii" icon="trophy" tone="accent" />}
              {ex.metric === 'TIME' && <StatTile label="Najdłuższa seria" value={fmtTime(best)} icon="trophy" tone="accent" />}
              {wr && (
                <div style={{ border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 70px', gap: 10, padding: '8px 12px', background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-hairline)' }}>
                    {['Powtórzenia', 'Najlepszy ciężar', 'Data'].map((h) => <span key={h} className="wo-caps">{h}</span>)}
                  </div>
                  {rm.map(([r, w, d]) => (
                    <div key={r} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 70px', gap: 10, padding: '0 12px', height: 36, alignItems: 'center', borderBottom: '1px solid var(--border-hairline)' }}>
                      <span style={{ font: 'var(--weight-medium) var(--text-body)/1 var(--font-mono)', color: 'var(--text-body)' }}>{r}</span>
                      <span style={{ font: 'var(--weight-semibold) var(--text-body)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{fmtNum(w)} kg</span>
                      <span style={{ font: 'var(--weight-regular) var(--text-label)/1 var(--font-mono)', color: 'var(--text-faint)' }}>{d}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card title="Rekordy osobiste" subtitle="Przeliczane z historii po każdej edycji" bodyStyle={{ padding: '4px 6px 8px' }}>
            {RECORDS.map((r) => (
              <div key={r.ex} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 38, padding: '0 10px' }}>
                <Icon name="trophy" size={14} color="var(--highlight)" />
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', font: 'var(--type-body)', color: 'var(--text-strong)' }}>{exById(r.ex).name}</span>
                <span style={{ font: 'var(--weight-semibold) var(--text-label)/1 var(--font-mono)', color: 'var(--text-strong)', whiteSpace: 'nowrap' }}>{r.v}</span>
                <span style={{ width: 40, textAlign: 'right', font: 'var(--weight-regular) var(--text-caption)/1 var(--font-mono)', color: 'var(--text-faint)' }}>{r.d}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
}
Object.assign(window, { ProgressScreen });
