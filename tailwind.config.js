/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#12365A',
        blue: '#1769AA',
        teal: '#149B91',
        tealdark: '#0E766E',
        bg: '#F7FAFC',
        softblue: '#EAF4FB',
        softteal: '#E8F7F4',
        softamber: '#FBF1E3',
        softred: '#FBECEC',
        ink: '#182B3A',
        muted: '#5B6C7B',
        amber: '#B56B14',
        danger: '#B83A3A',
        line: '#DCE5EC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(18,54,90,0.06), 0 6px 20px rgba(18,54,90,0.06)',
      },
    },
  },
  plugins: [],
}
