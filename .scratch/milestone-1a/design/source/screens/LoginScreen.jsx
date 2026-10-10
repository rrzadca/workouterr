const { TextField, Button, Checkbox, Icon } = window.WorkouterrDesignSystem_3a7282;

function LoginScreen({ onLogin, dark = false }) {
  const [mode, setMode] = React.useState('login');
  const [remember, setRemember] = React.useState(true);
  const [terms, setTerms] = React.useState(false);
  const isLogin = mode === 'login';
  return (
    <div data-theme={dark ? 'dark' : undefined} style={{ display: 'flex', height: '100%', background: 'var(--surface-app)' }}>
      <div style={{
        flex: '0 0 44%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18,
        background: 'var(--brand-navy)', padding: 40, position: 'relative', overflow: 'hidden',
      }}>
        <img src={dark ? window.__resources.logoFullTeal : window.__resources.logoFullTeal} alt="Workouterr" style={{ width: '58%', maxWidth: 260, objectFit: 'contain' }} />
        <p style={{ margin: 0, textAlign: 'center', maxWidth: 280, font: 'var(--type-body)', color: 'rgba(255,255,255,.6)' }}>
          Śledź treningi, tonaż i rekordy — wszystko w jednym miejscu.
        </p>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h1 style={{ margin: 0, font: 'var(--weight-semibold) var(--text-title-1)/1.2 var(--font-ui)', letterSpacing: 'var(--tracking-title)', color: 'var(--text-strong)' }}>
              {isLogin ? 'Zaloguj się' : 'Załóż konto'}
            </h1>
            <p style={{ margin: '6px 0 0', font: 'var(--type-body)', color: 'var(--text-muted)' }}>
              {isLogin ? 'Wróć do swojego planu treningowego.' : 'Zacznij śledzić swoje treningi.'}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!isLogin && <TextField label="Imię" placeholder="Marek" />}
            <TextField label="E-mail" type="email" placeholder="marek@example.com" icon="mail" />
            <TextField label="Hasło" type="password" placeholder="••••••••" icon="lock" />
            {isLogin
              ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Checkbox label="Zapamiętaj mnie" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <a href="#" style={{ font: 'var(--type-label)' }}>Nie pamiętasz hasła?</a>
                </div>
              : <Checkbox label="Akceptuję regulamin i politykę prywatności" checked={terms} onChange={(e) => setTerms(e.target.checked)} />}
            <Button variant="primary" size="xl" fullWidth onClick={onLogin}>{isLogin ? 'Zaloguj się' : 'Utwórz konto'}</Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-faint)' }}>
            <span style={{ flex: 1, height: 1, background: 'var(--border-hairline)' }} /><span style={{ font: 'var(--type-label)' }}>lub</span><span style={{ flex: 1, height: 1, background: 'var(--border-hairline)' }} />
          </div>
          <Button size="lg" icon="apple" fullWidth>Kontynuuj przez Apple</Button>
          <p style={{ margin: 0, textAlign: 'center', font: 'var(--type-label)', color: 'var(--text-muted)' }}>
            {isLogin ? 'Nie masz konta? ' : 'Masz już konto? '}
            <a href="#" onClick={(e) => { e.preventDefault(); setMode(isLogin ? 'register' : 'login'); }}>{isLogin ? 'Zarejestruj się' : 'Zaloguj się'}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { LoginScreen });
