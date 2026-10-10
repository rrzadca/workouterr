// components/forms/Switch.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  style,
  ...rest
}) {
  const w = size === 'sm' ? 30 : 40,
    h = size === 'sm' ? 18 : 24,
    k = h - 4;
  const track = /*#__PURE__*/React.createElement("span", {
    onClick: () => !disabled && onChange && onChange(!checked),
    role: "switch",
    "aria-checked": checked,
    style: {
      position: 'relative',
      width: w,
      height: h,
      flex: '0 0 auto',
      borderRadius: 'var(--radius-pill)',
      background: checked ? 'var(--accent)' : 'var(--gray-300)',
      boxShadow: 'inset 0 1px 2px rgba(8,32,47,.14)',
      cursor: disabled ? 'default' : 'pointer',
      transition: 'background var(--dur-base) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      left: checked ? w - k - 2 : 2,
      width: k,
      height: k,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 1px 3px rgba(8,32,47,.3)',
      transition: 'left var(--dur-base) var(--ease-out)'
    }
  }));
  if (!label) return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-flex',
      opacity: disabled ? .5 : 1,
      ...style
    }
  }), track);
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      opacity: disabled ? .5 : 1,
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--text-body)'
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-regular) var(--text-caption)/1.4 var(--font-ui)',
      color: 'var(--text-muted)'
    }
  }, description)), track);
}
Object.assign(__ds_scope, { Switch });
