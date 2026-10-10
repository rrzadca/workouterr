// components/core/StatTile.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StatTile({
  label,
  value,
  unit,
  delta,
  deltaTone,
  icon,
  tone = 'default',
  style,
  ...rest
}) {
  const accented = tone === 'accent';
  const dTone = deltaTone || (String(delta || '').trim().startsWith('-') ? 'danger' : 'success');
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      padding: 14,
      background: accented ? 'var(--accent-soft)' : 'var(--surface-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: accented ? 'none' : 'var(--shadow-card)',
      minWidth: 0,
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      color: 'var(--text-muted)'
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 13
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-semibold) var(--text-caption)/1 var(--font-ui)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-caps)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, label)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 4,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-metric)',
      fontVariantNumeric: 'tabular-nums',
      color: 'var(--text-strong)'
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-medium) var(--text-label)/1 var(--font-ui)',
      color: 'var(--text-muted)'
    }
  }, unit)), delta && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      font: 'var(--weight-medium) var(--text-caption)/1 var(--font-mono)',
      color: dTone === 'danger' ? 'var(--status-danger)' : dTone === 'muted' ? 'var(--text-muted)' : 'var(--status-success)'
    }
  }, dTone !== 'muted' && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: dTone === 'danger' ? 'trending-down' : 'trending-up',
    size: 12
  }), delta));
}
Object.assign(__ds_scope, { StatTile });
