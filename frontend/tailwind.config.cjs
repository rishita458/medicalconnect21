module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bgPrimary: '#0B0E14',
        cyanNeon: '#00F5FF',
        cyanHover: '#00D9D9',
        textSecondary: '#B0B7C3'
      },
      boxShadow: {
        neon: '0 0 20px #00F5FF'
      }
    }
  },
  plugins: []
};
