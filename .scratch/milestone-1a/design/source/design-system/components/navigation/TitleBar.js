// components/navigation/TitleBar.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const LIGHTS = ['#ff5f57', '#febc2e', '#28c840'];
function TitleBar({
  title,
  subtitle,
  leading,
  trailing,
  height,
  translucent = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("header", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      height: height || 'var(--titlebar-h)',
      padding: '0 12px',
      background: translucent ? 'var(--surface-chrome)' : 'var(--surface-card)',
      backdropFilter: translucent ? 'var(--blur-vibrancy)' : undefined,
      WebkitBackdropFilter: translucent ? 'var(--blur-vibrancy)' : undefined,
      borderBottom: '1px solid var(--border-hairline)',
      flex: '0 0 auto',
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 8,
      flex: '0 0 auto'
    }
  }, LIGHTS.map(c => /*#__PURE__*/React.createElement("span", {
    key: c,
    style: {
      width: 12,
      height: 12,
      borderRadius: '50%',
      background: c,
      boxShadow: 'inset 0 0 0 .5px rgba(0,0,0,.18)'
    }
  }))), leading, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      textAlign: 'center'
    }
  }, title && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-semibold) var(--text-title-3)/1.2 var(--font-ui)',
      color: 'var(--text-strong)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--weight-regular) var(--text-caption)/1.2 var(--font-ui)',
      color: 'var(--text-muted)'
    }
  }, subtitle)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flex: '0 0 auto'
    }
  }, trailing));
}
Object.assign(__ds_scope, { TitleBar });
