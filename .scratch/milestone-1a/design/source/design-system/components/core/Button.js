// components/core/Button.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    h: 'var(--control-h-sm)',
    px: 8,
    fs: 'var(--text-caption)',
    icon: 12,
    r: 'var(--radius-xs)'
  },
  md: {
    h: 'var(--control-h-md)',
    px: 12,
    fs: 'var(--text-body)',
    icon: 14,
    r: 'var(--radius-sm)'
  },
  lg: {
    h: 'var(--control-h-lg)',
    px: 16,
    fs: 'var(--text-body-lg)',
    icon: 16,
    r: 'var(--radius-md)'
  },
  xl: {
    h: 'var(--control-h-xl)',
    px: 22,
    fs: 'var(--text-body-lg)',
    icon: 18,
    r: 'var(--radius-lg)'
  }
};
const VARIANTS = {
  primary: {
    background: 'var(--accent)',
    color: 'var(--text-on-accent)',
    border: '1px solid transparent',
    boxShadow: 'var(--shadow-control)'
  },
  secondary: {
    background: 'var(--surface-card)',
    color: 'var(--text-strong)',
    border: '1px solid var(--border-field)',
    boxShadow: 'var(--shadow-control)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-body)',
    border: '1px solid transparent',
    boxShadow: 'none'
  },
  highlight: {
    background: 'var(--highlight)',
    color: 'var(--text-on-amber)',
    border: '1px solid transparent',
    boxShadow: 'var(--shadow-control)'
  },
  danger: {
    background: 'var(--status-danger)',
    color: '#fff',
    border: '1px solid transparent',
    boxShadow: 'var(--shadow-control)'
  }
};
function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconEnd,
  fullWidth = false,
  disabled = false,
  loading = false,
  style,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.secondary;
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const tint = press ? 'brightness(.92)' : hover ? 'brightness(1.05)' : 'none';
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled || loading,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false)
  }, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: s.h,
      padding: '0 ' + s.px + 'px',
      width: fullWidth ? '100%' : undefined,
      font: 'var(--weight-medium) ' + s.fs + '/1 var(--font-ui)',
      letterSpacing: 'var(--tracking-normal)',
      borderRadius: s.r,
      cursor: disabled ? 'default' : 'pointer',
      whiteSpace: 'nowrap',
      transition: 'var(--transition-control), filter var(--dur-fast) var(--ease-standard)',
      filter: tint,
      opacity: disabled ? 0.4 : 1,
      backgroundColor: variant === 'ghost' && hover ? 'var(--surface-hover)' : undefined,
      ...v,
      ...style
    }
  }), loading ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "loader-circle",
    size: s.icon,
    style: {
      animation: 'wo-spin 900ms linear infinite'
    }
  }) : icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.icon
  }) : null, children, iconEnd ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconEnd,
    size: s.icon
  }) : null);
}
Object.assign(__ds_scope, { Button });
