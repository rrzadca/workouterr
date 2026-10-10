// components/feedback/Dialog.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Dialog({
  open = true,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  onClose,
  icon,
  width = 420,
  style,
  ...rest
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--scrim)',
      backdropFilter: 'var(--blur-scrim)',
      WebkitBackdropFilter: 'var(--blur-scrim)',
      zIndex: 60
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", _extends({
    role: "dialog",
    "aria-modal": "true",
    onClick: e => e.stopPropagation()
  }, rest, {
    style: {
      width,
      maxWidth: '90%',
      padding: 20,
      textAlign: 'center',
      background: 'var(--surface-overlay)',
      backdropFilter: 'var(--blur-vibrancy)',
      WebkitBackdropFilter: 'var(--blur-vibrancy)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-window)',
      animation: 'wo-pop var(--dur-base) var(--ease-out)',
      ...style
    }
  }), icon && /*#__PURE__*/React.createElement("img", {
    src: icon,
    alt: "",
    style: {
      width: 48,
      height: 48,
      objectFit: 'contain',
      margin: '0 auto 10px',
      display: 'block'
    }
  }), title && /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: 'var(--weight-semibold) var(--text-title-3)/1.3 var(--font-ui)',
      color: 'var(--text-strong)'
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      font: 'var(--type-body)',
      color: 'var(--text-muted)',
      textWrap: 'pretty'
    }
  }, description), children && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      textAlign: 'left'
    }
  }, children), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 18,
      justifyContent: 'flex-end'
    }
  }, secondaryAction, primaryAction || /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "primary",
    size: "lg",
    onClick: onClose
  }, "OK"))));
}
Object.assign(__ds_scope, { Dialog });
