module.exports = {
  purge: {
    content: ['./pages/**/*.tsx', './src/components/**/*.tsx'],
    options: {
      safelist: [
        'm-0',
        'mt-2',
        'mt-4',
        'px-2',
        'pt-6',
        'pt-8',
        'relative',
        'absolute',
        '-left-1',
        '-top-1',
        'bg-gray-300',
      ],
    },
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
