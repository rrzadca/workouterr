// guidelines/tailwind.config.js (compiled)
/** Workouterr tokens as a Tailwind v3 config. `darkMode:'selector'` maps to `[data-theme="dark"]`
 * to match this system's CSS-variable theming (see tokens/colors.css). Merge into your app's config. */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#08202f',
          800: '#0e2d40',
          700: '#14405a',
          600: '#1c5375',
          500: '#2a6a92'
        },
        teal: {
          700: '#28595f',
          600: '#2f6e75',
          500: '#3f858c',
          400: '#5aa1a8',
          300: '#8cc3c8',
          200: '#bfdedf',
          100: '#e6f1f2'
        },
        amber: {
          700: '#a8720f',
          600: '#c4881b',
          500: '#f2ae2e',
          400: '#f7c561',
          300: '#fadfa2',
          100: '#fdf3dc'
        },
        gray: {
          0: '#ffffff',
          25: '#fafbfc',
          50: '#f3f5f7',
          100: '#eaeef1',
          200: '#dde3e8',
          300: '#c6ced5',
          400: '#9aa5ad',
          500: '#77838b',
          600: '#576269',
          700: '#3b444a',
          800: '#242c31',
          900: '#141a1e'
        },
        success: '#2e9e6b',
        danger: '#d64545',
        warn: '#e08a17',
        info: '#2f7fd1',
        brand: {
          navy: '#0e2d40',
          teal: '#3f858c',
          amber: '#f2ae2e'
        }
      },
      fontFamily: {
        ui: ['Geist', '-apple-system', 'BlinkMacSystemFont', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"Geist Mono"', '"SF Mono"', 'ui-monospace', 'monospace'],
        display: ['"Black Ops One"', 'Geist', 'sans-serif']
      },
      fontSize: {
        'display-1': ['44px', {
          lineHeight: '1.08'
        }],
        'display-2': ['34px', {
          lineHeight: '1.08'
        }],
        'title-1': ['26px', {
          lineHeight: '1.25'
        }],
        'title-2': ['20px', {
          lineHeight: '1.25'
        }],
        'title-3': ['17px', {
          lineHeight: '1.25'
        }],
        'body-lg': ['15px', {
          lineHeight: '1.45'
        }],
        body: ['13px', {
          lineHeight: '1.45'
        }],
        label: ['12px', {
          lineHeight: '1.3'
        }],
        caption: ['11px', {
          lineHeight: '1.35'
        }],
        metric: ['32px', {
          lineHeight: '1'
        }],
        'metric-xl': ['56px', {
          lineHeight: '1'
        }]
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      },
      letterSpacing: {
        display: '-0.02em',
        title: '-0.01em',
        normal: '0em',
        caps: '0.09em'
      },
      spacing: {
        0: '0px',
        1: '2px',
        2: '4px',
        3: '6px',
        4: '8px',
        5: '12px',
        6: '16px',
        7: '20px',
        8: '24px',
        9: '32px',
        10: '40px',
        11: '56px',
        12: '72px',
        'gutter-card': '16px',
        'gutter-screen': '24px',
        'gutter-section': '32px',
        'control-sm': '22px',
        'control-md': '28px',
        'control-lg': '34px',
        'control-xl': '44px',
        sidebar: '228px',
        inspector: '280px',
        titlebar: '44px',
        toolbar: '52px',
        tabbar: '56px'
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        DEFAULT: '8px',
        lg: '10px',
        xl: '14px',
        '2xl': '18px',
        window: '12px',
        pill: '999px'
      },
      boxShadow: {
        control: '0 1px 1px rgba(8,32,47,.09), inset 0 1px 0 rgba(255,255,255,.55)',
        card: '0 1px 2px rgba(8,32,47,.07), 0 6px 18px -8px rgba(8,32,47,.14)',
        raised: '0 2px 6px rgba(8,32,47,.09), 0 18px 40px -14px rgba(8,32,47,.22)',
        window: '0 24px 70px -20px rgba(8,32,47,.4), 0 0 0 1px rgba(8,32,47,.1)',
        popover: '0 8px 30px -8px rgba(8,32,47,.3), 0 0 0 1px rgba(8,32,47,.08)',
        'control-dark': '0 1px 1px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.08)',
        'card-dark': '0 1px 2px rgba(0,0,0,.4), 0 8px 22px -10px rgba(0,0,0,.55)',
        'raised-dark': '0 2px 8px rgba(0,0,0,.45), 0 20px 44px -16px rgba(0,0,0,.6)',
        'window-dark': '0 24px 70px -20px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.08)',
        'popover-dark': '0 10px 34px -10px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.1)'
      },
      ringColor: {
        accent: 'rgba(63,133,140,.35)'
      },
      transitionDuration: {
        instant: '80ms',
        fast: '140ms',
        base: '200ms',
        slow: '320ms',
        sheet: '420ms'
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(.4,0,.2,1)',
        out: 'cubic-bezier(.16,1,.3,1)',
        in: 'cubic-bezier(.5,0,1,1)',
        spring: 'cubic-bezier(.34,1.4,.64,1)'
      },
      backdropBlur: {
        vibrancy: '30px',
        scrim: '6px'
      }
    }
  }
};
