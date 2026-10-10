// components/navigation/Tabs.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tabs({
  items = [],
  value,
  onChange,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist"
  }, rest, {
    style: {
      display: 'flex',
      gap: 18,
      borderBottom: '1px solid var(--border-hairline)',
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
        gap: 6,
        padding: '0 0 9px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: on ? 'var(--text-strong)' : 'var(--text-muted)',
        font: (on ? 'var(--weight-semibold) ' : 'var(--weight-medium) ') + 'var(--text-body-lg)/1 var(--font-ui)',
        boxShadow: on ? 'inset 0 -2px 0 var(--accent)' : 'none',
        transition: 'var(--transition-control)'
      }
    }, typeof it !== 'string' && it.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 14
    }), label, typeof it !== 'string' && it.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-caption)',
        color: 'var(--text-faint)'
      }
    }, it.count));
  }));
}
Object.assign(__ds_scope, { Tabs });
