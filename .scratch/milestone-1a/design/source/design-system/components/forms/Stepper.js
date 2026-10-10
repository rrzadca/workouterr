// components/forms/Stepper.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Stepper({
  value = 0,
  step = 1,
  min = -Infinity,
  max = Infinity,
  unit,
  format,
  onChange,
  size = 'md',
  style,
  ...rest
}) {
  const set = n => onChange && onChange(Math.min(max, Math.max(min, Math.round(n * 100) / 100)));
  const fs = size === 'lg' ? 'var(--text-title-3)' : 'var(--text-body)';
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 2,
      padding: 2,
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-md)',
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "minus",
    size: size === 'lg' ? 'lg' : 'md',
    label: "Mniej",
    onClick: () => set(value - step)
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: size === 'lg' ? 64 : 48,
      textAlign: 'center',
      font: 'var(--weight-semibold) ' + fs + '/1 var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      color: 'var(--text-strong)'
    }
  }, format ? format(value) : String(value).replace('.', ','), unit ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      color: 'var(--text-muted)'
    }
  }, " ", unit) : null), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "plus",
    size: size === 'lg' ? 'lg' : 'md',
    label: "Wi\u0119cej",
    onClick: () => set(value + step)
  }));
}
Object.assign(__ds_scope, { Stepper });
