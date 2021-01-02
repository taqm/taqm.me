module.exports = {
  purge: {
    content: [
      './pages/**/*.tsx',
      './src/components/**/*.tsx',
      './src/styles/*.css',
    ],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
  important: true,
};
