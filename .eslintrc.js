module.exports = {
  env: {
    node: true,
    commonjs: true,
    es6: true,
    mocha: true,
  },
  extends: [
    'airbnb-base',
    'prettier',
  ],
  rules: {
    'prettier/prettier': 'error',
  },
  plugins: [
    'mocha',
    'prettier',
  ],
};
