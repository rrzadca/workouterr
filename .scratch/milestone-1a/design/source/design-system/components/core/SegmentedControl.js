// components/core/SegmentedControl.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SegmentedControl({
  items = [],
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  style,
  ...rest
}) {
  const h = size === 'sm' ? 'var(--control-h-sm)' : size === 'lg' ? 'var(--control-h-lg)' : 'var(--control-h-md)';
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist"
  }, rest, {
    style: {
      display: 'inline-grid',
      gridAutoFlow: 'column',
      gridAutoColumns: '1fr',
      gap: 2,
      padding: 2,
      height: 'calc(' + h + ' + 4px)',
      width: fullWidth ? '100%' : undefined,
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-md)',
      ...style
    }
  }), items.map(it => {
    const v = typeof it === 'string' ? it : it.value;
    const label = typeof it === 'string' ? it : it.label;
    const on = v === value;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      type: "button",
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange && onChange(v),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        padding: '0 12px',
        border: 'none',
        cursor: 'pointer',
        borderRadius: 'var(--radius-sm)',
        background: on ? 'var(--surface-card)' : 'transparent',
        boxShadow: on ? 'var(--shadow-control)' : 'none',
        color: on ? 'var(--text-strong)' : 'var(--text-muted)',
        font: (on ? 'var(--weight-semibold) ' : 'var(--weight-medium) ') + 'var(--text-label)/1 var(--font-ui)',
        transition: 'var(--transition-control)'
      }
    }, typeof it !== 'string' && it.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 13
    }), label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
