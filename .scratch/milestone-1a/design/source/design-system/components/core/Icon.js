// components/core/Icon.jsx (compiled)
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CDN = 'https://unpkg.com/lucide-static@0.427.0/icons/';
const cache = {};
function load(name) {
  if (!cache[name]) {
    cache[name] = fetch(CDN + name + '.svg').then(r => r.ok ? r.text() : '').then(t => t.replace('width="24"', 'width="100%"').replace('height="24"', 'height="100%"')).catch(() => '');
  }
  return cache[name];
}
function Icon({
  name = 'circle',
  size = 16,
  color = 'currentColor',
  style,
  ...rest
}) {
  const [svg, setSvg] = React.useState(null);
  React.useEffect(() => {
    let live = true;
    load(name).then(t => {
      if (live) setSvg(t);
    });
    return () => {
      live = false;
    };
  }, [name]);
  return /*#__PURE__*/React.createElement("span", _extends({
    "aria-hidden": "true"
  }, rest, {
    dangerouslySetInnerHTML: svg ? {
      __html: svg
    } : undefined,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      flex: '0 0 auto',
      color,
      lineHeight: 0,
      ...style
    }
  }));
}
Object.assign(__ds_scope, { Icon });
