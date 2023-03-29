module.exports = {
    '*.{ts,tsx}': [() => 'npm run format', 'npm run lint', 'npm run test', 'git add .'],
};