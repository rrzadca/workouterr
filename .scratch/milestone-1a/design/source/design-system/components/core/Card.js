// components/core/Card.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PAD = {
  none: 0,
  sm: 12,
  md: 16,
  lg: 20
};
function Card({
  children,
  title,
  subtitle,
  actions,
  padding = 'md',
  elevation = 'card',
  inset = false,
  style,
  bodyStyle,
  ...rest
}) {
  const shadow = elevation === 'none' ? 'none' : elevation === 'raised' ? 'var(--shadow-raised)' : 'var(--shadow-card)';
  const p = PAD[padding] ?? PAD.md;
  return /*#__PURE__*/React.createElement("section", _extends({}, rest, {
    style: {
      background: inset ? 'var(--surface-sunken)' : 'var(--surface-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: inset ? 'none' : shadow,
      overflow: 'hidden',
      color: 'var(--text-body)',
      ...style
    }
  }), (title || actions) && /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: p + 'px ' + p + 'px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, title && /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: 'var(--weight-semibold) var(--text-title-3)/1.25 var(--font-ui)',
      letterSpacing: 'var(--tracking-title)',
      color: 'var(--text-strong)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '3px 0 0',
      font: 'var(--type-body)',
      color: 'var(--text-muted)'
    }
  }, subtitle)), actions), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: p,
      ...bodyStyle
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
