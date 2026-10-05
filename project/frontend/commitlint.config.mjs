const config = {
  extends: ['@commitlint/config-conventional'],
  ignores: [(message) => message.trim() === 'deploy'],
  rules: {
    'header-max-length': [2, 'always', 72],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'style',
        'refactor',
        'perf',
        'a11y',
        'content',
        'docs',
        'test',
        'chore',
        'ci',
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
  },
};

export default config;
