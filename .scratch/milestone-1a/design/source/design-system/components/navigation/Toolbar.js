// components/navigation/Toolbar.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Toolbar({
  children,
  right,
  title,
  translucent = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: 'var(--toolbar-h)',
      padding: '0 16px',
      background: translucent ? 'var(--surface-chrome)' : 'var(--surface-card)',
      backdropFilter: translucent ? 'var(--blur-vibrancy)' : undefined,
      WebkitBackdropFilter: translucent ? 'var(--blur-vibrancy)' : undefined,
      borderBottom: '1px solid var(--border-hairline)',
      flex: '0 0 auto',
      ...style
    }
  }), title && /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: 'var(--weight-semibold) var(--text-title-2)/1.2 var(--font-ui)',
      letterSpacing: 'var(--tracking-title)',
      color: 'var(--text-strong)'
    }
  }, title), children, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), right);
}
Object.assign(__ds_scope, { Toolbar });
