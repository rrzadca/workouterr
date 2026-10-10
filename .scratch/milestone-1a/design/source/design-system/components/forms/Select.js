// components/forms/Select.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  label,
  options = [],
  size = 'md',
  hint,
  disabled = false,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const h = size === 'sm' ? 'var(--control-h-sm)' : size === 'lg' ? 'var(--control-h-lg)' : 'var(--control-h-md)';
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
      minWidth: 0,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      color: 'var(--text-muted)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false)
  }, rest, {
    style: {
      appearance: 'none',
      width: '100%',
      height: h,
      padding: '0 26px 0 9px',
      font: 'var(--type-body)',
      color: 'var(--text-strong)',
      background: 'linear-gradient(180deg, rgba(255,255,255,.6), rgba(255,255,255,0)), var(--surface-card)',
      border: '1px solid ' + (focus ? 'var(--accent)' : 'var(--border-field)'),
      borderRadius: 'var(--radius-sm)',
      boxShadow: focus ? 'var(--focus-ring)' : 'var(--shadow-control)',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? .55 : 1,
      transition: 'var(--transition-control)'
    }
  }), options.map(o => {
    const v = typeof o === 'string' ? o : o.value;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, typeof o === 'string' ? o : o.label);
  })), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevrons-up-down",
    size: 13,
    color: "var(--text-muted)",
    style: {
      position: 'absolute',
      right: 8,
      pointerEvents: 'none'
    }
  })), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-regular) var(--text-caption)/1.35 var(--font-ui)',
      color: 'var(--text-faint)'
    }
  }, hint));
}
Object.assign(__ds_scope, { Select });
