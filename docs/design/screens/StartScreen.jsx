const { Toolbar, Button, Card, Badge, Icon } = window.WorkouterrDesignSystem_3a7282;

function RotationChips({ plan, pos, onDark }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {plan.routines.map((rid, i) => {
        const on = i === pos;
        return (
          <React.Fragment key={i}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, height: 26, padding: '0 10px', borderRadius: 'var(--radius-pill)',
              font: (on ? 'var(--weight-semibold) ' : 'var(--weight-medium) ') + 'var(--text-label)/1 var(--font-ui)',
              background: on ? 'var(--highlight)' : onDark ? 'rgba(255,255,255,.1)' : 'var(--surface-sunken)',
              color: on ? 'var(--text-on-amber)' : onDark ? 'rgba(255,255,255,.75)' : 'var(--text-body)',
              border: on || onDark ? '1px solid transparent' : '1px solid var(--border-hairline)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.7 }}>{i + 1}</span>{routineById(rid).name}
            </span>
            {i < plan.routines.length - 1 && <Icon name="chevron-right" size={13} color={onDark ? 'rgba(255,255,255,.4)' : 'var(--text-faint)'} />}
          </React.Fragment>
        );
      })}
      <Icon name="repeat" size={13} color={onDark ? 'rgba(255,255,255,.4)' : 'var(--text-faint)'} style={{ marginLeft: 2 }} />
    </div>
  );
}

function StartScreen({ go, history, activePlanId, session, onStart, onDiscardAndStart }) {
  const plan = activePlanId ? planById(activePlanId) : null;
  const pos = plan ? nextInPlan(plan, history) : null;
  const next = plan ? routineById(plan.routines[pos]) : null;
  const [pending, setPending] = React.useState(null);
  const start = (rid, info) => (session ? setPending({ rid, info }) : onStart(rid, info));
  const routines = ROUTINES.filter((r) => !r.archived).map((r) => ({ r, last: lastDone(r.id, history) }))
    .sort((a, b) => (b.last ? b.last.date : '').localeCompare(a.last ? a.last.date : ''));
  const sp = session ? sessionProgress(session) : null;
  const caps = { font: 'var(--weight-semibold) var(--text-caption)/1 var(--font-ui)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', color: 'rgba(255,255,255,.55)' };
  const h2 = { margin: '8px 0 4px', font: 'var(--weight-semibold) var(--text-title-1)/1.15 var(--font-ui)', letterSpacing: 'var(--tracking-title)', color: '#fff' };

  return (
    <React.Fragment>
      <Toolbar title="Start" />
      <div style={{ padding: 'var(--gutter-screen)', display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {session ? (
            <Card padding="lg" style={{ background: 'var(--brand-navy)', border: 'none' }}>
              <span style={caps}>Trening w trakcie</span>
              <h2 style={h2}>{routineById(session.routineId).name}</h2>
              <p style={{ margin: 0, font: 'var(--type-body)', color: 'rgba(255,255,255,.66)' }}>Rozpoczęty o {session.startLabel} · {sp.done} z {sp.total} serii zapisanych</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Button variant="highlight" size="lg" icon="play" onClick={() => go('session')}>Wróć do treningu</Button>
              </div>
            </Card>
          ) : plan ? (
            <Card padding="lg" style={{ background: 'var(--brand-navy)', border: 'none' }}>
              <span style={caps}>Następny w planie · {plan.name}</span>
              <h2 style={h2}>{next.name}</h2>
              <p style={{ margin: '0 0 14px', font: 'var(--type-body)', color: 'rgba(255,255,255,.66)', textWrap: 'pretty' }}>{next.entries.map((e) => exById(e.ex).name).join(' · ')}</p>
              <RotationChips plan={plan} pos={pos} onDark />
              <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                <Button variant="highlight" size="lg" icon="play" onClick={() => start(next.id, { planId: plan.id, pos })}>Rozpocznij trening</Button>
                <Button variant="ghost" size="lg" icon="repeat" onClick={() => go('plans')} style={{ color: '#fff' }}>Zmień plan</Button>
              </div>
            </Card>
          ) : (
            <Card title="Brak aktywnego planu" subtitle="Wybierz rutynę poniżej albo ustaw plan, a aplikacja będzie podpowiadać kolejny trening."
              actions={<Button icon="repeat" onClick={() => go('plans')}>Ustaw plan</Button>} />
          )}

          <Card title={plan ? 'Inna rutyna' : 'Wybierz rutynę'} subtitle="Ostatnio wykonywane na górze" bodyStyle={{ padding: '4px 6px 8px' }}>
            {routines.map(({ r, last }) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ font: 'var(--weight-semibold) var(--text-body)/1.2 var(--font-ui)', color: 'var(--text-strong)' }}>{r.name}</span>
                    {plan && !plan.routines.includes(r.id) && <Badge tone="neutral">Poza planem</Badge>}
                  </span>
                  <span style={{ display: 'block', marginTop: 3, font: 'var(--type-label)', color: 'var(--text-muted)' }}>{r.entries.length} ćwiczenia · {r.desc}</span>
                </span>
                <span style={{ font: 'var(--weight-medium) var(--text-label)/1 var(--font-mono)', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>{last ? fmtAgo(last.date) : 'nigdy'}</span>
                <Button size="sm" icon="play" onClick={() => start(r.id, null)}>Rozpocznij</Button>
              </div>
            ))}
          </Card>
        </div>

        <Card title="Ostatnie treningi" actions={<Button size="sm" variant="ghost" iconEnd="arrow-right" onClick={() => go('history')}>Historia</Button>} bodyStyle={{ padding: '4px 6px 8px' }}>
          {history.slice(0, 5).map((s) => {
            const st = sessionStats(s);
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 46, padding: '4px 10px' }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', font: 'var(--weight-semibold) var(--text-body)/1.2 var(--font-ui)', color: 'var(--text-strong)' }}>{routineById(s.routine).name}</span>
                  <span style={{ display: 'block', marginTop: 3, font: 'var(--type-label)', color: 'var(--text-muted)' }}>{fmtDay(s.date)} · {s.dur} min</span>
                </span>
                <span style={{ font: 'var(--weight-medium) var(--text-label)/1 var(--font-mono)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{st.sets} serii</span>
              </div>
            );
          })}
        </Card>
      </div>

      <Modal open={!!pending} title="Masz trening w trakcie" width={400}
        description={session ? routineById(session.routineId).name + ' — ' + sp.done + ' z ' + sp.total + ' serii. Zakończ go albo odrzuć, zanim zaczniesz nowy.' : ''}
        onClose={() => setPending(null)}
        secondaryAction={<Button size="lg" onClick={() => { setPending(null); go('session'); }}>Wróć do treningu</Button>}
        primaryAction={<Button size="lg" variant="danger" onClick={() => { const p = pending; setPending(null); onDiscardAndStart(p.rid, p.info); }}>Odrzuć i zacznij nowy</Button>} />
    </React.Fragment>
  );
}
Object.assign(window, { StartScreen, RotationChips });
