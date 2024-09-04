module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {},
  settings: {
    react: {
      version: 'detect',
    },
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  // Remove the timeout property
};