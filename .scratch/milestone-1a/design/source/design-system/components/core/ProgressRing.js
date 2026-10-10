// components/core/ProgressRing.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ProgressRing({
  value = 0,
  max = 100,
  size = 96,
  thickness = 9,
  tone = 'accent',
  label,
  caption,
  style,
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, value / (max || 1) * 100));
  const color = tone === 'highlight' ? 'var(--highlight)' : tone === 'success' ? 'var(--status-success)' : 'var(--accent)';
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      position: 'relative',
      width: size,
      height: size,
      flex: '0 0 auto',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      background: 'conic-gradient(' + color + ' ' + pct + '%, var(--surface-sunken) 0)',
      transition: 'background var(--dur-slow) var(--ease-out)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: thickness,
      borderRadius: '50%',
      background: 'var(--surface-card)',
      boxShadow: 'inset 0 0 0 1px var(--border-hairline)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-semibold) ' + Math.round(size * 0.24) + 'px/1 var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      color: 'var(--text-strong)'
    }
  }, label != null ? label : Math.round(pct) + '%'), caption && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-medium) var(--text-caption)/1 var(--font-ui)',
      color: 'var(--text-muted)'
    }
  }, caption)));
}
Object.assign(__ds_scope, { ProgressRing });
