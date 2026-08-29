# @bubu/configs

BuBu 的前端共享配置包，一个包管全所有工程化配置：

- **oxlint 预设**：Vue3 / React / SolidJS 2.0 三套 TS 预设（含响应性规则与 2.0 已删除 API 拦截）
- **tsconfig 基座**：base + vue / react / solid 三个框架变体
- **一键初始化**：`init <framework>` 生成 oxfmt / gitignore / CI workflow / commitlint / lint-staged / .oxlintrc.json

> 发布前把 `@bubu` 换成你自己的 npm scope（package.json / bin.js / 本 README）。

## 宿主项目使用

```bash
# 装包（发布后用 @bubu/configs；本地调试用 @bubu/configs@file:<本包绝对路径>）
pnpm add -D oxlint @bubu/configs

# 一条命令生成全套项目根配置（vue | react | solid 二选一）
pnpm exec configs-init init vue
```

`init` 会生成：`AGENTS.md`（AI 助手规范说明）、`.oxlintrc.json`（按框架选好预设）、`.oxfmtrc.json`、`.editorconfig`、`.gitignore`、`.github/workflows/ci.yml`、`commitlint.config.mjs`、`lint-staged.config.mjs`。已存在的文件默认跳过，`--force` 覆盖。

然后手动补三样（init 不碰已有文件）：

1. **tsconfig.json**（预设里刻意不带 `include`，必须自己声明）：

   ```json
   { "extends": "./node_modules/@bubu/configs/tsconfig/vue.json", "include": ["src"] }
   ```

2. **package.json** 加依赖和脚本：

   ```json
   {
     "scripts": {
       "lint": "oxlint",
       "lint:fix": "oxlint --fix",
       "fmt": "oxfmt",
       "fmt:check": "oxfmt --check",
       "check": "oxfmt --check && oxlint",
       "typecheck": "tsc --noEmit",
       "prepare": "husky"
     }
   }
   ```

   `fmt:check` 这一条别漏——CI 模板跑的就是它，漏了 CI 第一步会 `Command "fmt:check" not found`。

   ```bash
   pnpm add -D oxfmt husky lint-staged typescript \
     @commitlint/cli @commitlint/config-conventional
   # Vue 项目另加 vue-tsc；Solid 项目另加 solid-js
   ```

3. **husky 钩子**：`.husky/pre-commit` → `pnpm exec lint-staged`；`.husky/commit-msg` → `pnpm exec commitlint --edit "$1"`。

## 已知边界（实测结论）

- oxlint 的 `extends` 不认包名，必须写 node_modules 里的文件路径（init 已自动生成正确写法）
- `jsPlugins` 相对路径从宿主项目根解析，所以 solid 插件用裸包名 `oxlint-plugin-solidjs`（本包自带该依赖，宿主无需安装）
- npm 打包会剥掉 `.gitignore` 文件名，模板存为 `gitignore`，拷贝时补点
- CI 模板里的 typecheck 步骤假设 package.json 有 `typecheck` 脚本
- 三个 tsconfig 变体都写了 `types: ["vite/client"]`，项目需装有 vite；非 Vite 项目（webpack/rspack 等）在自己的 tsconfig.json 里覆盖 `types` 即可
- tsconfig 预设**不带 `include`**：TS 的 `extends` 会把继承来的相对路径按「预设文件所在目录」解析，写在预设里会被解析到 `node_modules/@bubu/configs/tsconfig/src/**`（TS18003），所以 include 由宿主项目自己声明
- `.oxfmtrc.json` 模板把 `package.json` 放进了 `ignorePatterns`：oxfmt 会重排 package.json 的字段顺序（如把 `scripts` 提到前面），与 pnpm/npm 写入的顺序冲突，会让 `fmt:check` 无故失败并产生无意义 diff

## 发布

```bash
cd packages/configs
pnpm publish --access public
```

## 本仓库开发

根目录脚本用 `-c` 直接指向包内预设跑 examples 冒烟测试：

```bash
pnpm lint:vue && pnpm lint:react && pnpm lint:solid && pnpm fmt:check
```
