const path = require('path');

module.exports = function override(config, env) {
  config.resolve.alias['@'] = path.resolve(__dirname, 'src');
  
  // Add PostCSS Loader
  const postCSSLoader = {
    loader: 'postcss-loader',
    options: {
      postcssOptions: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ],
      },
    },
  }

  const oneOf = config.module.rules.find(rule => rule.oneOf).oneOf;
  oneOf.forEach(rule => {
    if (rule.test && rule.test.toString().includes('css')) {
      rule.use.push(postCSSLoader);
    }
  });

  return config;
}