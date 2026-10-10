// components/core/IconButton.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: 22,
  md: 28,
  lg: 34
};
function IconButton({
  icon = 'plus',
  size = 'md',
  variant = 'ghost',
  label,
  active = false,
  disabled = false,
  style,
  ...rest
}) {
  const d = SIZES[size] || SIZES.md;
  const [hover, setHover] = React.useState(false);
  const isSolid = variant === 'primary';
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: d,
      height: d,
      borderRadius: 'var(--radius-sm)',
      cursor: disabled ? 'default' : 'pointer',
      border: variant === 'secondary' ? '1px solid var(--border-field)' : '1px solid transparent',
      background: isSolid ? 'var(--accent)' : active ? 'var(--surface-active)' : hover ? 'var(--surface-hover)' : variant === 'secondary' ? 'var(--surface-card)' : 'transparent',
      color: isSolid ? 'var(--text-on-accent)' : active ? 'var(--text-strong)' : 'var(--text-muted)',
      boxShadow: variant === 'secondary' || isSolid ? 'var(--shadow-control)' : 'none',
      opacity: disabled ? 0.4 : 1,
      transition: 'var(--transition-control)',
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: Math.round(d * 0.55)
  }));
}
Object.assign(__ds_scope, { IconButton });
