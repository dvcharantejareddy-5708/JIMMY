/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#111B35',
        'deep-navy': '#172544',
        'primary-purple': '#7047EB',
        'accent-cyan': '#20B8D5',
        'soft-bg': '#F6F7FB',
        'brand-dark': '#1E293B',
        'brand-muted': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft-card': '0 4px 20px -2px rgba(17, 27, 53, 0.06), 0 2px 6px -1px rgba(17, 27, 53, 0.04)',
        'glow-purple': '0 0 25px rgba(112, 71, 235, 0.25)',
        'glow-cyan': '0 0 25px rgba(32, 184, 213, 0.25)',
      },
    },
  },
  plugins: [],
}
