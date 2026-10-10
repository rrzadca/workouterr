// components/workout/SetRow.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SetRow({
  index,
  weight,
  reps,
  rpe,
  state = 'pending',
  pr = false,
  note,
  onToggle,
  style,
  ...rest
}) {
  const done = state === 'done';
  const active = state === 'active';
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'grid',
      gridTemplateColumns: '22px minmax(0,1fr) minmax(0,1fr) minmax(0,auto) 20px',
      alignItems: 'center',
      gap: 8,
      height: 38,
      padding: '0 10px',
      borderRadius: 'var(--radius-sm)',
      background: active ? 'var(--accent-soft)' : 'transparent',
      boxShadow: active ? 'inset 0 0 0 1px var(--accent)' : 'none',
      opacity: done ? .62 : 1,
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-semibold) var(--text-label)/1 var(--font-mono)',
      color: active ? 'var(--accent-hover)' : 'var(--text-faint)'
    }
  }, index), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-semibold) var(--text-body-lg)/1 var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      color: 'var(--text-strong)',
      textDecoration: done ? 'line-through' : 'none'
    }
  }, String(weight).replace('.', ',')), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      color: 'var(--text-faint)'
    }
  }, "kg")), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-semibold) var(--text-body-lg)/1 var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      color: 'var(--text-strong)'
    }
  }, reps), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      color: 'var(--text-faint)'
    }
  }, "powt.")), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      minWidth: 0,
      overflow: 'hidden'
    }
  }, pr ? /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "highlight",
    icon: "trophy"
  }, "PR") : rpe != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-medium) var(--text-caption)/1 var(--font-mono)',
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap'
    }
  }, "RPE ", String(rpe).replace('.', ',')) : note ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      color: 'var(--text-faint)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, note) : null), /*#__PURE__*/React.createElement("span", {
    onClick: onToggle,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 20,
      height: 20,
      borderRadius: 'var(--radius-xs)',
      cursor: onToggle ? 'pointer' : 'default',
      background: done ? 'var(--status-success)' : 'var(--surface-card)',
      border: '1px solid ' + (done ? 'transparent' : 'var(--border-field)'),
      color: '#fff',
      boxShadow: 'var(--shadow-control)',
      transition: 'var(--transition-control)'
    }
  }, done && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 12
  })));
}
Object.assign(__ds_scope, { SetRow });
