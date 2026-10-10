// components/core/ProgressBar.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ProgressBar({
  value = 0,
  max = 100,
  tone = 'accent',
  size = 'md',
  label,
  showValue = false,
  style,
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, value / (max || 1) * 100));
  const h = size === 'sm' ? 4 : size === 'lg' ? 10 : 6;
  const fill = tone === 'highlight' ? 'var(--highlight)' : tone === 'success' ? 'var(--status-success)' : tone === 'neutral' ? 'var(--text-faint)' : 'var(--accent)';
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
      ...style
    }
  }), (label || showValue) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 8,
      font: 'var(--type-label)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", null, label), showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, Math.round(pct), "%")), /*#__PURE__*/React.createElement("div", {
    role: "progressbar",
    "aria-valuenow": value,
    "aria-valuemax": max,
    style: {
      height: h,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-sunken)',
      boxShadow: 'inset 0 0 0 1px var(--border-hairline)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + '%',
      height: '100%',
      borderRadius: 'var(--radius-pill)',
      background: fill,
      transition: 'width var(--dur-slow) var(--ease-out)'
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
