// ui_kits/ipad-app/IpadFrame.jsx (compiled)
function IpadFrame({
  children,
  dark,
  label
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1024,
      height: 740,
      padding: 16,
      borderRadius: 34,
      background: 'var(--navy-900)',
      boxShadow: 'var(--shadow-window)',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    "data-theme": dark ? 'dark' : undefined,
    style: {
      position: 'relative',
      height: '100%',
      borderRadius: 20,
      overflow: 'hidden'
    }
  }, children)), /*#__PURE__*/React.createElement("span", {
    className: "wo-caps"
  }, label));
}
function IpadGallery() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 36
    }
  }, /*#__PURE__*/React.createElement(IpadFrame, {
    label: "Logowanie \u2014 poziomo"
  }, /*#__PURE__*/React.createElement(LoginScreen, null)), /*#__PURE__*/React.createElement(IpadFrame, {
    label: "Trening w trakcie \u2014 poziomo"
  }, /*#__PURE__*/React.createElement(AppShell, {
    chrome: "none",
    startAuthed: true,
    demo: true,
    sidebarWidth: 200
  })), /*#__PURE__*/React.createElement(IpadFrame, {
    dark: true,
    label: "Rejestracja \u2014 ciemny motyw"
  }, /*#__PURE__*/React.createElement(LoginScreen, {
    dark: true
  })));
}
Object.assign(window, {
  IpadFrame,
  IpadGallery
});
