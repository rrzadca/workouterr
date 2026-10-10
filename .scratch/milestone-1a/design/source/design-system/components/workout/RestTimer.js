// components/workout/RestTimer.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function fmt(s) {
  const m = Math.floor(s / 60);
  const r = Math.abs(s % 60);
  return m + ':' + String(r).padStart(2, '0');
}
function RestTimer({
  remaining = 90,
  total = 90,
  running = true,
  onToggle,
  onSkip,
  label = 'Przerwa',
  style,
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, remaining / (total || 1) * 100));
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '10px 14px',
      background: 'var(--brand-navy)',
      color: '#fff',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-raised)',
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "timer",
    size: 18,
    color: "var(--highlight)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-semibold) var(--text-caption)/1 var(--font-ui)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-caps)',
      color: 'rgba(255,255,255,.6)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-semibold) var(--text-title-2)/1 var(--font-mono)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, fmt(remaining))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 7,
      height: 4,
      borderRadius: 'var(--radius-pill)',
      background: 'rgba(255,255,255,.16)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + '%',
      height: '100%',
      background: 'var(--highlight)',
      borderRadius: 'var(--radius-pill)',
      transition: 'width 1s linear'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: running ? 'pause' : 'play',
    label: running ? 'Pauza' : 'Start',
    onClick: onToggle,
    style: {
      color: '#fff'
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "skip-forward",
    label: "Pomi\u0144",
    onClick: onSkip,
    style: {
      color: '#fff'
    }
  })));
}
Object.assign(__ds_scope, { RestTimer });
