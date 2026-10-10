// components/core/Badge.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: ['var(--surface-sunken)', 'var(--text-muted)'],
  accent: ['var(--accent-soft)', 'var(--accent-hover)'],
  highlight: ['var(--highlight-soft)', 'var(--amber-700)'],
  success: ['var(--status-success-soft)', 'var(--status-success)'],
  danger: ['var(--status-danger-soft)', 'var(--status-danger)'],
  solid: ['var(--brand-navy)', '#fff']
};
function Badge({
  children,
  tone = 'neutral',
  icon,
  pill = true,
  style,
  ...rest
}) {
  const [bg, fg] = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      height: 20,
      padding: '0 8px',
      background: bg,
      color: fg,
      borderRadius: pill ? 'var(--radius-pill)' : 'var(--radius-xs)',
      font: 'var(--weight-semibold) var(--text-caption)/1 var(--font-ui)',
      whiteSpace: 'nowrap',
      ...style
    }
  }), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 11
  }), children);
}
Object.assign(__ds_scope, { Badge });
