export default {
  hooks: {
    'pre-commit': 'lint-staged && npm run type-check',
  },
}
