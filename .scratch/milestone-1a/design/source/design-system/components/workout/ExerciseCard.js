// components/workout/ExerciseCard.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ExerciseCard({
  name,
  muscle,
  equipment,
  target,
  sets,
  thumbnail,
  active = false,
  children,
  footer,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("article", _extends({}, rest, {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid ' + (active ? 'var(--accent)' : 'var(--border-hairline)'),
      borderRadius: 'var(--radius-xl)',
      boxShadow: active ? 'var(--shadow-raised)' : 'var(--shadow-card)',
      overflow: 'hidden',
      ...style
    }
  }), /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 14px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      flex: '0 0 auto',
      borderRadius: 'var(--radius-md)',
      background: thumbnail ? 'var(--surface-sunken)' : 'var(--accent-soft)',
      backgroundImage: thumbnail ? 'url(' + thumbnail + ')' : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }, !thumbnail && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "dumbbell",
    size: 19,
    color: "var(--accent-hover)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      font: 'var(--weight-semibold) var(--text-title-3)/1.25 var(--font-ui)',
      color: 'var(--text-strong)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, name), muscle && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "neutral"
  }, muscle)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      font: 'var(--type-label)',
      color: 'var(--text-muted)'
    }
  }, [equipment, sets != null ? sets + ' serie' : null, target].filter(Boolean).join(' · '))), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "ellipsis",
    label: "Opcje \u0107wiczenia"
  })), children && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 6px 6px'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px',
      borderTop: '1px solid var(--border-hairline)',
      background: 'var(--surface-sunken)'
    }
  }, footer));
}
Object.assign(__ds_scope, { ExerciseCard });
