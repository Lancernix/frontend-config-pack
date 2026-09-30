/**
 * @lancernix/fe-base-config —— JS 消费入口
 *
 * 与 oxlint/base.json、templates/.oxfmtrc.json 为同一配置的两种形态：
 *   - JSON 给 .oxlintrc.json 的 extends 用（静态、零构建）
 *   - 本对象给 oxlint.config.ts / oxfmt.config.ts 的 defineConfig 用（可 import、可 spread 修改）
 *
 * 修改规则时两处需同步（1.2.0 计划：由本文件生成 JSON，消除双份漂移）。
 */
export const oxlint = {
  plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'import', 'promise'],
  env: { builtin: true, es2024: true, browser: true },
  categories: { correctness: 'error', suspicious: 'warn' },
  rules: {
    // no-undef 显式关闭：oxlint 1.86 实测未激活，且 Mantine 官方配置同样显式关闭
    'no-undef': 'off',
    'no-console': 'off',
    'typescript/no-unused-expressions': 'off',
    'typescript/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrors: 'none',
        ignoreRestSiblings: true,
      },
    ],
    // ── 防御性规则（correctness 邻域，借鉴 Mantine 官方配置）──
    'array-callback-return': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-eval': 'error',
    'no-throw-literal': 'error',
    'prefer-promise-reject-errors': 'error',
    eqeqeq: ['error', 'smart'],
    radix: 'error',
  },
};

export const oxfmt = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  endOfLine: 'lf',
  ignorePatterns: ['**/dist/**', '**/coverage/**', 'pnpm-lock.yaml', '**/*.min.*', 'package.json'],
};

export default { oxlint, oxfmt };
