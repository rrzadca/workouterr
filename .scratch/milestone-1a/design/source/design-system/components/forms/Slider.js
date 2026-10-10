// components/forms/Slider.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Slider({
  value = 0,
  min = 0,
  max = 10,
  step = 1,
  onChange,
  label,
  showValue = true,
  unit,
  disabled = false,
  style,
  ...rest
}) {
  const pct = (value - min) / (max - min || 1) * 100;
  return /*#__PURE__*/React.createElement("label", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      minWidth: 0,
      ...style
    }
  }, rest), (label || showValue) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      font: 'var(--type-label)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", null, label), showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      color: 'var(--text-strong)'
    }
  }, String(value).replace('.', ','), unit ? ' ' + unit : '')), /*#__PURE__*/React.createElement("input", {
    type: "range",
    value: value,
    min: min,
    max: max,
    step: step,
    disabled: disabled,
    onChange: e => onChange && onChange(Number(e.target.value)),
    style: {
      appearance: 'none',
      WebkitAppearance: 'none',
      width: '100%',
      height: 20,
      margin: 0,
      background: 'transparent',
      backgroundImage: 'linear-gradient(var(--accent), var(--accent)), linear-gradient(var(--surface-sunken), var(--surface-sunken))',
      backgroundSize: pct + '% 4px, 100% 4px',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'left center',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? .5 : 1
    }
  }));
}
Object.assign(__ds_scope, { Slider });
