/**
 * lint-staged：只处理 git 暂存区文件，提交快、不误伤他人代码
 * 顺序：先 oxlint --fix（安全自动修复），再 oxfmt（格式化）
 *
 * 注意第一个 key 的否定模式：package.json / pnpm-lock.yaml 在 .oxfmtrc.json 的
 * ignorePatterns 里，而 oxfmt 对「传入文件全部被忽略」的批次会报错退出
 * （Expected at least one target file, exit 2），把 pre-commit 卡死——
 * 只提交版本号或 lockfile 变更时必然触发，所以在这里把它们排除。
 *
 * 另外两条工程约定：先声明具名常量再 export default（不要匿名对象默认导出，
 * oxlint correctness 级会报）；key 保持字母序（sort-keys，Vue 预设 style 类别开着，
 * lint-staged 的 key 是独立 glob，顺序不影响语义）。
 */
const config = {
  '!(package|pnpm-lock).{json,jsonc,yml,yaml,css,scss,less,html,md}': ['oxfmt --write'],
  '*.{js,mjs,cjs,ts,mts,cts,jsx,tsx,vue}': ['oxlint --fix', 'oxfmt --write'],
};

export default config;
