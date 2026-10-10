const { TitleBar, SidebarNav, IconButton, Toast, Tooltip } = window.WorkouterrDesignSystem_3a7282;

function AppShell({ chrome = 'mac', startAuthed = false, demo = false, sidebarWidth }) {
  const [authed, setAuthed] = React.useState(startAuthed);
  const [dark, setDark] = React.useState(false);
  const [history, setHistory] = React.useState(HISTORY);
  const [activePlanId, setActivePlanId] = React.useState('ppl');
  const [session, setSession] = React.useState(() => (demo ? demoSession(HISTORY) : null));
  const [view, setView] = React.useState(demo ? 'session' : 'start');
  const [selectedSession, setSelectedSession] = React.useState(HISTORY[0].id);
  const [settings, setSettings] = React.useState({ lang: 'pl', sound: true });
  const [toast, setToast] = React.useState(null);
  const [host, setHost] = React.useState(null);
  const notify = (t) => { setToast(t); clearTimeout(window.__woToast); window.__woToast = setTimeout(() => setToast(null), 4000); };

  const startSession = (rid, planInfo) => {
    let info = planInfo;
    if (!info && activePlanId) { const p = planById(activePlanId); const i = p.routines.indexOf(rid); if (i >= 0) info = { planId: p.id, pos: i }; }
    setSession(buildSession(rid, history, info));
    setView('session');
  };
  const finishSession = (s, saved) => {
    const item = sessionToHistory(s);
    setHistory((h) => [item, ...h]);
    setSession(null); setSelectedSession(item.id); setView('history');
    notify({ tone: 'success', title: 'Trening zapisany', message: routineById(s.routineId).name + ' · ' + sessionStats(item).sets + ' serii' + (saved ? ' · rutyna zaktualizowana' : '') });
  };
  const discardSession = () => { setSession(null); setView('start'); notify({ tone: 'info', title: 'Trening odrzucony' }); };
  const logout = () => { setAuthed(false); setView('start'); };

  const rootStyle = { position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: chrome === 'mac' ? 'var(--radius-window)' : 0, overflow: 'hidden', boxShadow: chrome === 'mac' ? 'var(--shadow-window)' : 'none', background: 'var(--surface-app)' };

  if (!authed) {
    return <div data-theme={dark ? 'dark' : undefined} style={rootStyle}><LoginScreen dark={dark} onLogin={() => setAuthed(true)} /></div>;
  }

  const v = view === 'session' && !session ? 'start' : view;
  let screen;
  if (v === 'session') screen = <SessionScreen session={session} setSession={setSession} history={history} settings={settings} onFinish={finishSession} onDiscard={discardSession} />;
  else if (v === 'history') screen = <HistoryScreen history={history} setHistory={setHistory} selected={selectedSession} setSelected={setSelectedSession} notify={notify} />;
  else if (v === 'exercises') screen = <ExercisesScreen notify={notify} />;
  else if (v === 'routines') screen = <RoutinesScreen notify={notify} />;
  else if (v === 'plans') screen = <PlansScreen history={history} activePlanId={activePlanId} setActivePlanId={setActivePlanId} notify={notify} />;
  else if (v === 'progress') screen = <ProgressScreen />;
  else if (v === 'settings') screen = <SettingsScreen settings={settings} setSettings={setSettings} notify={notify} onLogout={logout} />;
  else screen = <StartScreen go={setView} history={history} activePlanId={activePlanId} session={session} onStart={startSession} onDiscardAndStart={(rid, info) => { setSession(null); startSession(rid, info); }} />;

  const trainItems = [{ value: 'start', label: 'Start', icon: 'house' }];
  if (session) trainItems.push({ value: 'session', label: 'Trening w trakcie', icon: 'dumbbell', badge: '•' });
  trainItems.push({ value: 'history', label: 'Historia', icon: 'history', badge: history.length });

  return (
    <ModalHostCtx.Provider value={host}>
      <div data-theme={dark ? 'dark' : undefined} style={rootStyle}>
        {chrome === 'mac' && (
          <TitleBar title="Workouterr" subtitle={session ? routineById(session.routineId).name + ' · w trakcie' : fmtDay(TODAY, true)}
            trailing={<Tooltip label={dark ? 'Jasny motyw' : 'Ciemny motyw'}><IconButton icon={dark ? 'sun' : 'moon'} label="Motyw" onClick={() => setDark(!dark)} /></Tooltip>} />
        )}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <SidebarNav value={v} onChange={setView} width={sidebarWidth}
            header={<div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px 6px' }}>
              <img src={dark ? window.__resources.logoMarkTeal : window.__resources.logoMarkNavy} alt="" style={{ height: 26 }} />
              <img src={dark ? window.__resources.logoWordTeal : window.__resources.logoWordNavy} alt="Workouterr" style={{ height: 13 }} />
            </div>}
            footer={<div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderTop: '1px solid var(--border-hairline)' }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: 'var(--weight-semibold) var(--text-label)/1 var(--font-ui)' }}>{USER.initials}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', font: 'var(--weight-semibold) var(--text-label)/1.2 var(--font-ui)', color: 'var(--text-strong)' }}>{USER.name}</span>
                <span style={{ display: 'block', font: 'var(--weight-regular) var(--text-caption)/1.2 var(--font-ui)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activePlanId ? planById(activePlanId).name : 'Bez aktywnego planu'}</span>
              </span>
              <IconButton icon="log-out" label="Wyloguj" size="sm" onClick={logout} />
            </div>}
            sections={[
              { label: 'Trening', items: trainItems },
              { label: 'Biblioteka', items: [
                { value: 'exercises', label: 'Ćwiczenia', icon: 'dumbbell', badge: EXERCISES.filter((e) => !e.archived).length },
                { value: 'routines', label: 'Rutyny', icon: 'list-checks', badge: ROUTINES.filter((r) => !r.archived).length },
                { value: 'plans', label: 'Plany', icon: 'repeat', badge: PLANS.length },
              ] },
              { label: 'Postęp', items: [{ value: 'progress', label: 'Wykresy i rekordy', icon: 'chart-column' }] },
              { label: 'Konto', items: [{ value: 'settings', label: 'Ustawienia', icon: 'settings' }] },
            ]} />
          <main className="wo-scroll" style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>{screen}</main>
        </div>
        {toast && <div style={{ position: 'absolute', right: 16, bottom: 16, zIndex: 80 }}><Toast {...toast} onClose={() => setToast(null)} /></div>}
        <div ref={setHost} style={{ position: 'absolute', inset: 0, zIndex: 60, pointerEvents: 'none' }} />
      </div>
    </ModalHostCtx.Provider>
  );
}
Object.assign(window, { AppShell });
