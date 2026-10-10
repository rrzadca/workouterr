// ui_kits/mobile-app/MobileApp.jsx (compiled)
const {
  Card,
  Button,
  IconButton,
  Icon,
  Badge,
  ExerciseCard,
  RestTimer,
  SegmentedControl,
  VolumeChart,
  Select,
  StatTile
} = window.WorkouterrDesignSystem_3a7282;
function Phone({
  children,
  dark,
  label
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    "data-theme": dark ? 'dark' : undefined,
    style: {
      width: 320,
      height: 660,
      padding: 10,
      borderRadius: 46,
      background: 'var(--navy-900)',
      boxShadow: 'var(--shadow-window)',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: '100%',
      borderRadius: 36,
      overflow: 'hidden',
      background: 'var(--surface-app)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '11px 20px 4px',
      font: 'var(--weight-semibold) var(--text-label)/1 var(--font-ui)',
      color: 'var(--text-strong)',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("span", null, "9:41"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "signal",
    size: 13
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "wifi",
    size: 13
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "battery-full",
    size: 16
  }))), children)), /*#__PURE__*/React.createElement("span", {
    className: "wo-caps"
  }, label));
}
function TabBar({
  value,
  onChange,
  hasSession
}) {
  const items = [{
    v: 'start',
    i: 'house',
    l: 'Start'
  }, {
    v: 'train',
    i: 'dumbbell',
    l: 'Trening'
  }, {
    v: 'history',
    i: 'history',
    l: 'Historia'
  }, {
    v: 'progress',
    i: 'chart-column',
    l: 'Postęp'
  }];
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      height: 'var(--tabbar-h)',
      flex: '0 0 auto',
      paddingBottom: 6,
      background: 'var(--surface-chrome)',
      backdropFilter: 'var(--blur-vibrancy)',
      WebkitBackdropFilter: 'var(--blur-vibrancy)',
      borderTop: '1px solid var(--border-hairline)'
    }
  }, items.map(it => {
    const on = it.v === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.v,
      type: "button",
      onClick: () => onChange(it.v),
      style: {
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        minHeight: 44,
        color: on ? 'var(--accent)' : 'var(--text-faint)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: it.i,
      size: 19
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--weight-medium) 10px/1 var(--font-ui)'
      }
    }, it.l), it.v === 'train' && hasSession && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 6,
        left: '58%',
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: 'var(--highlight)'
      }
    }));
  }));
}
function ScreenHeader({
  title,
  sub,
  right
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 10,
      padding: '8px 18px 12px',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, sub && /*#__PURE__*/React.createElement("span", {
    className: "wo-caps"
  }, sub), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '2px 0 0',
      font: 'var(--weight-semibold) var(--text-title-1)/1.15 var(--font-ui)',
      letterSpacing: 'var(--tracking-title)',
      color: 'var(--text-strong)'
    }
  }, title)), right);
}
const scroll = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  padding: '0 14px 16px',
  display: 'grid',
  alignContent: 'start',
  gridAutoRows: 'max-content',
  gap: 12
};
function StartM({
  onStart
}) {
  const plan = planById('ppl');
  const pos = nextInPlan(plan, HISTORY);
  const next = routineById(plan.routines[pos]);
  const others = ROUTINES.filter(r => r.id !== next.id).map(r => ({
    r,
    last: lastDone(r.id, HISTORY)
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "wo-scroll",
    style: scroll
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "none",
    style: {
      background: 'var(--brand-navy)',
      border: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-semibold) var(--text-caption)/1.3 var(--font-ui)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-caps)',
      color: 'rgba(255,255,255,.55)'
    }
  }, "Nast\u0119pny w planie \xB7 ", plan.name), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: 'var(--weight-semibold) var(--text-title-1)/1.1 var(--font-ui)',
      color: '#fff'
    }
  }, next.name), /*#__PURE__*/React.createElement(RotationChips, {
    plan: plan,
    pos: pos,
    onDark: true
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "highlight",
    size: "xl",
    icon: "play",
    fullWidth: true,
    onClick: onStart
  }, "Rozpocznij trening"))), /*#__PURE__*/React.createElement(Card, {
    title: "Inna rutyna",
    bodyStyle: {
      padding: '2px 4px 8px'
    }
  }, others.map(({
    r,
    last
  }) => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      minHeight: 48,
      padding: '0 8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--weight-semibold) var(--text-body)/1.2 var(--font-ui)',
      color: 'var(--text-strong)'
    }
  }, r.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 2,
      font: 'var(--type-label)',
      color: 'var(--text-muted)'
    }
  }, last ? fmtAgo(last.date) : 'nigdy')), /*#__PURE__*/React.createElement(IconButton, {
    icon: "play",
    label: 'Rozpocznij ' + r.name,
    variant: "secondary",
    size: "lg"
  })))));
}
function TrainM() {
  const [item, setItem] = React.useState(() => {
    const s = demoSession(HISTORY);
    return s.items[0];
  });
  const [rest, setRest] = React.useState({
    endAt: Date.now() + 74000,
    total: 150
  });
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  const ex = exById(item.exId),
    entry = entryById(item.entryId);
  const idx = item.sets.findIndex(s => !s.done);
  const auto = autoMark(item, ex, entry);
  const mark = item.mark || auto || 'keep';
  const log = () => {
    if (idx < 0) return;
    setItem(it => ({
      ...it,
      sets: it.sets.map((s, j) => j === idx ? {
        ...s,
        done: true
      } : s)
    }));
    setRest({
      endAt: Date.now() + entry.rest * 1000,
      total: entry.rest
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "wo-scroll",
    style: scroll
  }, /*#__PURE__*/React.createElement(RestTimer, {
    remaining: Math.max(0, Math.ceil((rest.endAt - now) / 1000)),
    total: rest.total,
    running: true,
    onSkip: () => setRest({
      endAt: Date.now(),
      total: rest.total
    })
  }), /*#__PURE__*/React.createElement(ExerciseCard, {
    name: ex.name,
    target: 'Cel: ' + fmtTarget(ex, item.sets.length, item.target),
    active: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: '0 6px 6px'
    }
  }, /*#__PURE__*/React.createElement(PrevStrip, {
    ex: ex,
    prev: item.prev
  }), item.sets.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: 38,
      padding: '0 8px',
      borderRadius: 'var(--radius-sm)',
      background: i === idx ? 'var(--accent-soft)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 14,
      font: 'var(--weight-semibold) var(--text-label)/1 var(--font-mono)',
      color: 'var(--text-faint)'
    }
  }, i + 1), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: 'var(--weight-semibold) var(--text-body-lg)/1 var(--font-mono)',
      color: s.done ? 'var(--text-muted)' : 'var(--text-strong)'
    }
  }, fmtVal(ex, s)), s.done ? /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check",
    size: 18,
    color: "var(--status-success)"
  }) : i === idx ? /*#__PURE__*/React.createElement(Badge, {
    tone: "accent"
  }, "Teraz") : null)))), idx >= 0 && /*#__PURE__*/React.createElement(Card, {
    title: 'Seria ' + (idx + 1),
    bodyStyle: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      justifyContent: 'space-between',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(MetricSteppers, {
    ex: ex,
    size: "lg",
    value: item.sets[idx],
    onChange: v => setItem(it => ({
      ...it,
      sets: it.sets.map((s, j) => j === idx ? {
        ...s,
        ...v
      } : s)
    }))
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "xl",
    icon: "check",
    fullWidth: true,
    onClick: log
  }, "Zapisz seri\u0119"))), /*#__PURE__*/React.createElement(Card, {
    title: "Na nast\u0119pny trening",
    bodyStyle: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(SegmentedControl, {
    fullWidth: true,
    size: "lg",
    items: [{
      value: 'down',
      label: 'Zmniejsz'
    }, {
      value: 'keep',
      label: 'Utrzymaj'
    }, {
      value: 'up',
      label: 'Zwiększ'
    }],
    value: mark,
    onChange: v => setItem(it => ({
      ...it,
      mark: v
    }))
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      color: 'var(--text-muted)'
    }
  }, "Nast\u0119pnym razem: ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, fmtTarget(ex, entry.sets, progress(ex, entry, item.target, mark)))))));
}
function HistoryM() {
  return /*#__PURE__*/React.createElement("div", {
    className: "wo-scroll",
    style: scroll
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "none"
  }, HISTORY.map(h => {
    const st = sessionStats(h),
      d = D(h.date);
    return /*#__PURE__*/React.createElement("div", {
      key: h.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minHeight: 56,
        padding: '8px 14px',
        borderBottom: '1px solid var(--border-hairline)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 32,
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        font: 'var(--weight-semibold) var(--text-title-3)/1 var(--font-mono)',
        color: 'var(--text-strong)'
      }
    }, d.getDate()), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        marginTop: 3,
        font: 'var(--weight-medium) var(--text-caption)/1 var(--font-ui)',
        color: 'var(--text-muted)'
      }
    }, d.toLocaleDateString('pl-PL', {
      month: 'short'
    }))), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--weight-semibold) var(--text-body)/1.2 var(--font-ui)',
        color: 'var(--text-strong)'
      }
    }, routineById(h.routine).name), !h.plan && /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral"
    }, "Poza planem")), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        marginTop: 3,
        font: 'var(--weight-regular) var(--text-label)/1 var(--font-mono)',
        color: 'var(--text-muted)'
      }
    }, h.dur, " min \xB7 ", st.sets, " serii")), /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14,
      color: "var(--text-faint)"
    }));
  })));
}
function ProgressM() {
  const [exId, setExId] = React.useState('bench');
  const ex = exById(exId),
    pts = PROGRESS[exId];
  const val = p => ex.metric === 'WEIGHT_REPS' ? p.w : ex.metric === 'REPS' ? p.r : p.t;
  return /*#__PURE__*/React.createElement("div", {
    className: "wo-scroll",
    style: scroll
  }, /*#__PURE__*/React.createElement(Select, {
    size: "lg",
    options: Object.keys(PROGRESS).map(id => ({
      value: id,
      label: exById(id).name
    })),
    value: exId,
    onChange: e => setExId(e.target.value)
  }), /*#__PURE__*/React.createElement(Card, {
    title: "Najci\u0119\u017Csza seria",
    subtitle: "Jeden punkt na trening"
  }, /*#__PURE__*/React.createElement(VolumeChart, {
    data: pts.slice(-6).map((p, i, a) => ({
      label: p.d,
      value: val(p),
      highlight: i === a.length - 1
    })),
    height: 130
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Rekordy",
    bodyStyle: {
      padding: '2px 4px 8px'
    }
  }, RECORDS.slice(0, 5).map(r => /*#__PURE__*/React.createElement("div", {
    key: r.ex,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      minHeight: 40,
      padding: '0 8px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trophy",
    size: 14,
    color: "var(--highlight)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      font: 'var(--type-body)',
      color: 'var(--text-strong)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, exById(r.ex).name), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-semibold) var(--text-label)/1 var(--font-mono)',
      color: 'var(--text-strong)'
    }
  }, r.v)))));
}
function PhoneApp({
  start = 'start',
  dark = false,
  label
}) {
  const [tab, setTab] = React.useState(start);
  const heads = {
    start: [fmtDay(TODAY), 'Cześć, Marek'],
    train: ['Push · 0:24', 'Trening'],
    history: [HISTORY.length + ' treningów', 'Historia'],
    progress: ['Wykresy i rekordy', 'Postęp']
  };
  const [sub, title] = heads[tab];
  return /*#__PURE__*/React.createElement(Phone, {
    dark: dark,
    label: label
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: title,
    sub: sub,
    right: tab === 'train' ? /*#__PURE__*/React.createElement(Button, {
      size: "lg",
      variant: "primary"
    }, "Zako\u0144cz") : /*#__PURE__*/React.createElement(IconButton, {
      icon: "settings",
      label: "Ustawienia",
      variant: "secondary",
      size: "lg"
    })
  }), tab === 'start' && /*#__PURE__*/React.createElement(StartM, {
    onStart: () => setTab('train')
  }), tab === 'train' && /*#__PURE__*/React.createElement(TrainM, null), tab === 'history' && /*#__PURE__*/React.createElement(HistoryM, null), tab === 'progress' && /*#__PURE__*/React.createElement(ProgressM, null), /*#__PURE__*/React.createElement(TabBar, {
    value: tab,
    onChange: setTab,
    hasSession: tab === 'train'
  }));
}
function MobileGallery() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PhoneApp, {
    start: "start",
    label: "Start \u2014 jasny motyw"
  }), /*#__PURE__*/React.createElement(PhoneApp, {
    start: "train",
    dark: true,
    label: "Trening \u2014 ciemny motyw"
  }), /*#__PURE__*/React.createElement(PhoneApp, {
    start: "history",
    label: "Historia"
  }));
}
Object.assign(window, {
  Phone,
  TabBar,
  PhoneApp,
  MobileGallery
});
