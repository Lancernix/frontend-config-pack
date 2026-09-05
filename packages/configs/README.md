# @lancernix/fe-base-config

Lancernix 的前端工程化共享配置包，包含：

- **oxlint 预设**：Vue3 / React / SolidJS 2.0 三套 TypeScript 预设（Solid 预设含响应性规则与 2.0 已删除 API 拦截）
- **tsconfig 基座**：base 与 vue / react / solid 三个框架变体
- **初始化命令**：`configs-init init <framework>` 生成项目根配置（oxlint / oxfmt / gitignore / CI workflow / commitlint / lint-staged）

## 宿主项目接入

### 1. 安装依赖

```bash
pnpm add -D oxlint @lancernix/fe-base-config
```

本地调试时可通过 `@lancernix/fe-base-config@file:<本包绝对路径>` 指向开发仓库。

### 2. 生成项目根配置

```bash
pnpm exec configs-init init vue   # vue | react | solid
```

生成文件：`.oxlintrc.json`、`.oxfmtrc.json`、`.editorconfig`、`.gitignore`、`.github/workflows/ci.yml`、`commitlint.config.mjs`、`lint-staged.config.mjs`、`AGENTS.md`（AI 助手协作规范）。已存在的文件默认跳过，`--force` 参数可强制覆盖。

### 3. 补充 tsconfig.json

tsconfig 预设不包含 `include`（原因见「注意事项」），需在项目 tsconfig.json 中声明：

```json
{ "extends": "./node_modules/@lancernix/fe-base-config/tsconfig/vue.json", "include": ["src"] }
```

### 4. 补充 package.json

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

CI 模板依赖 `fmt:check` 脚本，缺失时 CI 将报 `Command "fmt:check" not found`。

```bash
pnpm add -D oxfmt husky lint-staged typescript \
  @commitlint/cli @commitlint/config-conventional
# Vue 项目另加 vue-tsc；Solid 项目另加 solid-js
```

### 5. 配置 husky 钩子

- `.husky/pre-commit` → `pnpm exec lint-staged`
- `.husky/commit-msg` → `pnpm exec commitlint --edit "$1"`

## 注意事项

- oxlint 的 `extends` 不支持 npm 包名，只能引用 node_modules 内的文件路径；`configs-init` 生成的 `.oxlintrc.json` 已使用正确写法
- tsconfig 预设不包含 `include`：TypeScript 按被继承文件所在目录解析相对路径，写在预设内会被解析为 `node_modules/@lancernix/fe-base-config/tsconfig/src/**`（TS18003），因此 `include` 必须由宿主项目声明
- 三个 tsconfig 变体均声明 `types: ["vite/client"]`，项目需安装 vite；非 Vite 项目可在自身 tsconfig.json 中覆盖 `types`
- solid 预设通过 `jsPlugins` 加载 `oxlint-plugin-solidjs`（本包已声明该依赖，宿主无需安装）；`jsPlugins` 的相对路径从宿主项目根解析，因此必须使用裸包名
- `.oxfmtrc.json` 模板将 `package.json` 加入 `ignorePatterns`：oxfmt 会重排 package.json 的字段顺序，与 pnpm/npm 的写入顺序冲突，会导致 `fmt:check` 失败并产生无意义 diff
- lint-staged 配置对 `package.json` / `pnpm-lock.yaml` 使用否定模式排除，避免「传入文件全部被 oxfmt 忽略」导致 pre-commit 以 exit 2 失败
- CI 模板的 typecheck 步骤假设 package.json 已配置 `typecheck` 脚本
- npm 打包会忽略名为 `.gitignore` 的文件，模板以 `gitignore` 名称存放，`configs-init` 拷贝时自动补全点前缀

## 发布

发版由 GitHub Actions 自动完成：push 到 master 触发 `release.yml`，semantic-release 按 Conventional Commits 推导版本（`feat` → minor、`fix` → 补丁、breaking → major），通过 npm OIDC trusted publishing 发布（带 provenance，无需配置 token），并创建对应的 GitHub Release。

首次发版需完成两步前置（npm 要求包已存在才能配置 trusted publisher）：

1. 本地发布占位版本（发布时在浏览器完成 2FA 认证）：

   ```bash
   cd packages/configs
   npm version 0.0.1 --no-git-tag-version && npm publish --access public
   git checkout package.json   # 还原为 0.0.0-development，版本号由 semantic-release 管理
   ```

2. 在 npmjs.com 的包 Settings → Trusted Publisher 中登记 GitHub Actions：
   owner=`Lancernix`、repo=`frontend-config-pack`、workflow=`release.yml`、environment=`release`

## 本仓库开发

- **冒烟测试**：根目录脚本通过 `-c` 指向包内预设检查 examples 目录：

  ```bash
  pnpm lint:vue && pnpm lint:react && pnpm lint:solid && pnpm fmt:check
  ```

- **修改预设规则**：编辑 `packages/configs/oxlint/` 下的预设文件，push 到 master 后由 CI 自动发版
- **宿主项目 E2E 验证**：在临时项目安装 `@lancernix/fe-base-config@file:<本包绝对路径>` 后执行 `configs-init init <framework>`，可完整验证接入链路（配置生成、fmt:check、lint）
