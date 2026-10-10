const { Toolbar, Button, Card, Badge, TextField, Switch, SegmentedControl, Icon } = window.WorkouterrDesignSystem_3a7282;

function SettingsScreen({ settings, setSettings, notify, onLogout }) {
  const [emailForm, setEmailForm] = React.useState(false);
  const [pending, setPending] = React.useState(null);
  const [newEmail, setNewEmail] = React.useState('');
  const [del, setDel] = React.useState(false);
  const row = { display: 'flex', alignItems: 'center', gap: 12, minHeight: 40 };

  return (
    <React.Fragment>
      <Toolbar title="Ustawienia" />
      <div style={{ padding: 'var(--gutter-screen)', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <Card title="Adres e-mail">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={row}>
                <Icon name="mail" size={15} color="var(--text-muted)" />
                <span style={{ flex: 1, font: 'var(--type-body)', color: 'var(--text-strong)' }}>{USER.email}</span>
                {!emailForm && !pending && <Button size="sm" onClick={() => setEmailForm(true)}>Zmień</Button>}
              </div>
              {emailForm && (
                <React.Fragment>
                  <TextField label="Nowy adres e-mail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="nowy@example.com" />
                  <TextField label="Hasło" type="password" placeholder="••••••••" />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="primary" onClick={() => { setPending(newEmail || 'nowy@example.com'); setEmailForm(false); }}>Wyślij link weryfikacyjny</Button>
                    <Button variant="ghost" onClick={() => setEmailForm(false)}>Anuluj</Button>
                  </div>
                </React.Fragment>
              )}
              {pending && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)', border: '1px solid var(--border-hairline)' }}>
                  <Badge tone="highlight" icon="clock">Oczekuje na potwierdzenie</Badge>
                  <span style={{ font: 'var(--type-label)', color: 'var(--text-muted)', textWrap: 'pretty' }}>Adres zmieni się na <b style={{ color: 'var(--text-strong)' }}>{pending}</b> po kliknięciu linku. Na obecny adres wyślemy powiadomienie.</span>
                  <div style={{ display: 'flex', gap: 8 }}><Button size="sm">Wyślij ponownie</Button><Button size="sm" variant="ghost" onClick={() => setPending(null)}>Anuluj zmianę</Button></div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Hasło" subtitle="Po zmianie wylogujemy wszystkie inne urządzenia.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <TextField label="Obecne hasło" type="password" placeholder="••••••••" />
              <TextField label="Nowe hasło" type="password" placeholder="••••••••" />
              <Button variant="primary" onClick={() => notify({ tone: 'success', title: 'Hasło zmienione', message: 'Inne urządzenia zostały wylogowane.' })} style={{ alignSelf: 'flex-start' }}>Zmień hasło</Button>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <Card title="Preferencje">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={row}>
                <span style={{ flex: 1, font: 'var(--type-body)', color: 'var(--text-body)' }}>Język</span>
                <SegmentedControl items={[{ value: 'en', label: 'English' }, { value: 'pl', label: 'Polski' }]} value={settings.lang} onChange={(v) => setSettings((s) => ({ ...s, lang: v }))} />
              </div>
              <div style={row}>
                <span style={{ flex: 1, font: 'var(--type-body)', color: 'var(--text-body)' }}>Jednostka ciężaru</span>
                <span style={{ font: 'var(--weight-medium) var(--text-label)/1 var(--font-mono)', color: 'var(--text-muted)' }}>kg · 2 miejsca po przecinku</span>
              </div>
              <Switch label="Dźwięk na koniec przerwy" description="Pełnoekranowy sygnał pojawia się zawsze" checked={settings.sound} onChange={(v) => setSettings((s) => ({ ...s, sound: v }))} />
            </div>
          </Card>

          <Card title="Twoje dane" subtitle="Archiwum ZIP: workouterr-export.json (wszystko, z wersją formatu) i sets.csv (jedna seria w wierszu). Format neutralny: angielskie kolumny, kropka dziesiętna, daty ISO 8601.">
            <Button icon="download" onClick={() => notify({ tone: 'success', title: 'Eksport gotowy', message: 'Pobieranie workouterr-export.zip' })}>Eksportuj dane (ZIP)</Button>
          </Card>

          <Card title="Usuń konto" subtitle="Usunięcie jest natychmiastowe i obejmuje wszystkie dane. Z kopii zapasowych znikną w ciągu 30 dni.">
            <Button variant="danger" icon="trash-2" onClick={() => setDel(true)}>Usuń konto</Button>
          </Card>
        </div>
      </div>

      <Modal open={del} width={400} title="Usunąć konto?" description="Ćwiczenia, rutyny, plany i wszystkie treningi zostaną usunięte. Tego nie da się cofnąć."
        onClose={() => setDel(false)}
        secondaryAction={<Button size="lg" onClick={() => setDel(false)}>Anuluj</Button>}
        primaryAction={<Button size="lg" variant="danger" onClick={() => { setDel(false); onLogout(); }}>Usuń na zawsze</Button>}>
        <TextField label="Potwierdź hasłem" type="password" placeholder="••••••••" />
      </Modal>
    </React.Fragment>
  );
}
Object.assign(window, { SettingsScreen });
