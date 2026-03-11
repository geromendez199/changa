module.exports = {
  extends: ['expo'],
  plugins: ['react-hooks'],
  rules: {
    // Catch missing/wrong useEffect dependencies to prevent stale closures
    'react-hooks/rules-of-hooks':  'error',
    'react-hooks/exhaustive-deps': 'warn',
    // Catch unused variables before they cause bugs
    'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    // Enforce consistent use of const/let
    'prefer-const': 'warn',
    // No console.log in production (use console.warn/error for intentional logs)
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  env: {
    browser: true,
    node:    true,
    es2022:  true,
  },
  ignorePatterns: ['node_modules/', 'dist/', '.expo/'],
};
