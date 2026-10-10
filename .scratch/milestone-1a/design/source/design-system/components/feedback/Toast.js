// components/feedback/Toast.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  info: 'var(--accent)',
  success: 'var(--status-success)',
  danger: 'var(--status-danger)',
  highlight: 'var(--highlight)'
};
function Toast({
  title,
  message,
  tone = 'info',
  icon,
  action,
  onClose,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status"
  }, rest, {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      width: 320,
      padding: '11px 12px',
      background: 'var(--surface-overlay)',
      backdropFilter: 'var(--blur-vibrancy)',
      WebkitBackdropFilter: 'var(--blur-vibrancy)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-popover)',
      animation: 'wo-fade-up var(--dur-base) var(--ease-out)',
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon || (tone === 'success' ? 'circle-check' : tone === 'danger' ? 'circle-alert' : tone === 'highlight' ? 'trophy' : 'info'),
    size: 16,
    color: TONES[tone],
    style: {
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--weight-semibold) var(--text-body)/1.35 var(--font-ui)',
      color: 'var(--text-strong)'
    }
  }, title), message && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--weight-regular) var(--text-label)/1.4 var(--font-ui)',
      color: 'var(--text-muted)'
    }
  }, message), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, action)), onClose && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 13,
    color: "var(--text-faint)",
    onClick: onClose,
    style: {
      cursor: 'pointer'
    }
  }));
}
Object.assign(__ds_scope, { Toast });
