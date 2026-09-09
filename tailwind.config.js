/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#17181C',
        'ink-soft': '#63676F',
        paper: '#F6F5F1',
        surface: '#FFFFFF',
        line: '#E4E1D9',
        accent: '#2E4CE6',
        'accent-dim': '#EAEDFB',
        'accent-ink': '#16255E',
        todo: '#6B7280',
        progress: '#B7791F',
        done: '#0F766E',
        low: '#0F766E',
        medium: '#B7791F',
        high: '#B3261E',
        // Deterministic per-board accent tabs — cycled by board id, not
        // random per render, so a board keeps its "color" consistently.
        tab1: '#2E4CE6',
        tab2: '#0F766E',
        tab3: '#7C3AED',
        tab4: '#B45309',
        tab5: '#475569',
      },
      boxShadow: {
        card: '0 1px 2px rgba(23, 24, 28, 0.05)',
        lift: '0 8px 24px rgba(23, 24, 28, 0.08)',
      },
      fontFeatureSettings: {
        tabular: '"tnum"',
      },
    },
  },
  plugins: [],
};
