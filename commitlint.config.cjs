/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'refactor',
        'test',
        'docs',
        'chore',
        'ci',
        'perf',
        'build',
        'style',
        'revert',
      ],
    ],
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
  },
};
