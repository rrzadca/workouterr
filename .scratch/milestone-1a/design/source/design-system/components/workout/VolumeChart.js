// components/workout/VolumeChart.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function VolumeChart({
  data = [],
  height = 132,
  tone = 'accent',
  unit = 'kg',
  barWidth,
  style,
  ...rest
}) {
  const max = Math.max(1, ...data.map(d => d.value));
  const fill = tone === 'highlight' ? 'var(--highlight)' : 'var(--accent)';
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 6,
      height,
      ...style
    }
  }), data.map((d, i) => {
    const h = Math.round(d.value / max * (height - 22));
    const on = d.highlight;
    return /*#__PURE__*/React.createElement("div", {
      key: d.label + i,
      title: d.value + ' ' + unit,
      style: {
        flex: barWidth ? '0 0 ' + barWidth + 'px' : 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        height: height - 22
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        height: Math.max(3, h),
        borderRadius: 'var(--radius-xs)',
        background: on ? 'var(--highlight)' : fill,
        opacity: on ? 1 : .82,
        transition: 'height var(--dur-slow) var(--ease-out)'
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--weight-medium) var(--text-caption)/1 var(--font-mono)',
        color: on ? 'var(--text-strong)' : 'var(--text-faint)',
        whiteSpace: 'nowrap'
      }
    }, d.label));
  }));
}
Object.assign(__ds_scope, { VolumeChart });
