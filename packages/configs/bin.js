#!/usr/bin/env node
/**
 * @lancernix/configs 初始化命令
 *
 * 用法（在项目根目录执行）：
 *   pnpm dlx @lancernix/configs init vue           # 选框架：vue | react | solid
 *   pnpm dlx @lancernix/configs init react --force # 覆盖已存在的文件
 *
 * 生成内容：
 *   - .oxlintrc.json        （按所选框架 extends 对应预设）
 *   - .oxfmtrc.json / .editorconfig
 *   - .gitignore / .github/workflows/ci.yml
 *   - commitlint.config.mjs / lint-staged.config.mjs
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgDir = dirname(fileURLToPath(import.meta.url));
const templatesDir = join(pkgDir, 'templates');

const FRAMEWORKS = ['vue', 'react', 'solid'];
const args = process.argv.slice(2);
const command = args[0];
const force = args.includes('--force');
const framework = args.find((a) => FRAMEWORKS.includes(a));

const PKG_NAME = '@lancernix/configs';

function usage() {
  console.log(`${PKG_NAME}

用法:
  configs-init init <vue|react|solid>          在当前目录生成全套配置
  configs-init init <vue|react|solid> --force  覆盖已存在的文件

生成后 package.json 建议脚本:
  "lint": "oxlint",
  "lint:fix": "oxlint --fix",
  "fmt": "oxfmt",
  "fmt:check": "oxfmt --check",
  "check": "oxfmt --check && oxlint",
  "typecheck": "tsc --noEmit",       // Vue 项目用 vue-tsc --noEmit -p tsconfig.app.json
  "prepare": "husky"
`);
}

if (command !== 'init' || !framework) {
  usage();
  process.exit(command === 'init' && !framework ? 1 : 0);
}

const plainFiles = [
  'AGENTS.md',
  '.oxfmtrc.json',
  '.editorconfig',
  'commitlint.config.mjs',
  'lint-staged.config.mjs',
];

let copied = 0;
for (const file of plainFiles) {
  const dest = join(process.cwd(), file);
  if (existsSync(dest) && !force) {
    console.log(`跳过（已存在）: ${file}`);
    continue;
  }
  copyFileSync(join(templatesDir, file), dest);
  console.log(`已生成: ${file}`);
  copied++;
}

// .gitignore 特殊处理：npm 打包会剥掉叫 .gitignore 的文件，所以模板存成 gitignore
const gitignoreDest = join(process.cwd(), '.gitignore');
if (existsSync(gitignoreDest) && !force) {
  console.log('跳过（已存在）: .gitignore');
} else {
  copyFileSync(join(templatesDir, 'gitignore'), gitignoreDest);
  console.log('已生成: .gitignore');
  copied++;
}

// GitHub Actions workflow（保留宿主已有文件）
const ciDest = join(process.cwd(), '.github', 'workflows', 'ci.yml');
if (!existsSync(ciDest)) {
  mkdirSync(dirname(ciDest), { recursive: true });
  copyFileSync(join(templatesDir, '.github', 'workflows', 'ci.yml'), ciDest);
  console.log('已生成: .github/workflows/ci.yml');
  copied++;
} else {
  console.log('跳过（已存在）: .github/workflows/ci.yml');
}

// .oxlintrc.json —— 按框架生成（--force 才覆盖）
const oxlintDest = join(process.cwd(), '.oxlintrc.json');
// 直接拼 oxfmt 兼容的格式：不能用 JSON.stringify(.., null, 2)，
// 它会把 extends 数组展开成多行，而 oxfmt（printWidth 100）要求短数组压成一行，
// 否则宿主项目一跑 fmt:check 就报格式问题，CI 直接挂。
// extends 也不能写包名子路径——oxlint 的 extends 只认文件路径。
const oxlintContent = `{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "extends": ["./node_modules/${PKG_NAME}/oxlint/${framework}.json"]
}`;
if (!existsSync(oxlintDest) || force) {
  writeFileSync(oxlintDest, `${oxlintContent}\n`);
  console.log(`已生成: .oxlintrc.json（${framework} 预设）`);
  copied++;
} else {
  console.log('跳过（已存在）: .oxlintrc.json（用 --force 可覆盖切换框架）');
}

console.log(`
完成！新生成 ${copied} 个文件。

接下来：
1. tsconfig.json 指向共享基座，**并自己声明 include**
   （预设里刻意不带 include：TS extends 的相对路径会按预设文件所在目录解析，写在预设里会指错地方）：
   { "extends": "./node_modules/${PKG_NAME}/tsconfig/${framework}.json", "include": ["src"] }

2. package.json 加脚本（见上方用法输出），依赖：
   pnpm add -D oxfmt husky lint-staged typescript \\
     @commitlint/cli @commitlint/config-conventional
   Vue 项目另加：vue-tsc；Solid 项目另加：solid-js

3. git 钩子文件（init 不碰已有的）：
   .husky/pre-commit  → pnpm exec lint-staged
   .husky/commit-msg  → pnpm exec commitlint --edit "$1"

4. Solid 预设面向 SolidJS 2.0，已内置响应性规则与已删除 API 拦截。
`);
