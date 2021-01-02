module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-controls',
  ],
  babel: async (options) => {
    options.presets.push([
      'next/babel',
      {
        'styled-jsx': {
          plugins: ['styled-jsx-plugin-postcss'],
        },
      },
    ]);
    return options;
  },
};
