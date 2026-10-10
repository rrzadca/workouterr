// components/navigation/SidebarNav.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SidebarNav({
  sections = [],
  value,
  onChange,
  header,
  footer,
  width,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({}, rest, {
    className: "wo-scroll",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      width: width || 'var(--sidebar-w)',
      padding: '10px 8px',
      background: 'var(--surface-sidebar)',
      backdropFilter: 'var(--blur-vibrancy)',
      WebkitBackdropFilter: 'var(--blur-vibrancy)',
      borderRight: '1px solid var(--border-hairline)',
      overflowY: 'auto',
      flex: '0 0 auto',
      ...style
    }
  }), header, sections.map((sec, i) => /*#__PURE__*/React.createElement("div", {
    key: sec.label || i,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }
  }, sec.label && /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '4px 8px',
      font: 'var(--weight-semibold) var(--text-caption)/1 var(--font-ui)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-caps)',
      color: 'var(--text-faint)'
    }
  }, sec.label), (sec.items || []).map(it => {
    const on = it.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.value,
      type: "button",
      onClick: () => onChange && onChange(it.value),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 30,
        padding: '0 8px',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        textAlign: 'left',
        background: on ? 'var(--accent)' : 'transparent',
        color: on ? 'var(--text-on-accent)' : 'var(--text-body)',
        font: (on ? 'var(--weight-semibold) ' : 'var(--weight-medium) ') + 'var(--text-body)/1 var(--font-ui)',
        transition: 'var(--transition-control)'
      },
      onMouseEnter: e => {
        if (!on) e.currentTarget.style.background = 'var(--surface-hover)';
      },
      onMouseLeave: e => {
        if (!on) e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon || 'circle',
      size: 15,
      color: on ? 'var(--text-on-accent)' : 'var(--text-muted)'
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, it.label), it.badge != null && /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--weight-semibold) var(--text-caption)/1 var(--font-mono)',
        color: on ? 'rgba(255,255,255,.8)' : 'var(--text-faint)'
      }
    }, it.badge));
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), footer);
}
Object.assign(__ds_scope, { SidebarNav });
