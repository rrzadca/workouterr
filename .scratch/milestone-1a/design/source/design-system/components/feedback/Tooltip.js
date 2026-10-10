// components/feedback/Tooltip.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tooltip({
  label,
  children,
  side = 'top',
  shortcut,
  style,
  ...rest
}) {
  const [show, setShow] = React.useState(false);
  const pos = side === 'bottom' ? {
    top: '100%',
    marginTop: 6
  } : side === 'left' ? {
    right: '100%',
    marginRight: 6,
    top: '50%',
    transform: 'translateY(-50%)'
  } : side === 'right' ? {
    left: '100%',
    marginLeft: 6,
    top: '50%',
    transform: 'translateY(-50%)'
  } : {
    bottom: '100%',
    marginBottom: 6
  };
  const centered = side === 'top' || side === 'bottom';
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false),
    style: {
      position: 'relative',
      display: 'inline-flex',
      ...style
    }
  }), children, show && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: 'absolute',
      zIndex: 70,
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 7px',
      left: centered ? '50%' : undefined,
      transform: centered ? 'translateX(-50%)' : pos.transform,
      background: 'var(--brand-navy)',
      color: '#fff',
      borderRadius: 'var(--radius-xs)',
      font: 'var(--weight-medium) var(--text-caption)/1.2 var(--font-ui)',
      boxShadow: 'var(--shadow-popover)',
      animation: 'wo-fade-up var(--dur-fast) var(--ease-out)',
      ...pos
    }
  }, label, shortcut && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      opacity: .6
    }
  }, shortcut)));
}
Object.assign(__ds_scope, { Tooltip });
