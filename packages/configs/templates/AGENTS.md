# AGENTS.md — 工程化规范（AI 助手必读）

本项目的 lint/format/tsconfig 等工程化配置统一来自 npm 包 **@bubu/configs**。
AI 助手在本仓库工作时必须遵守以下约定。

## 核心规则

1. **禁止引入 ESLint / Prettier**。lint 只用 oxlint，格式化只用 oxfmt。
2. **禁止在项目里手写 lint 规则**。规则统一维护在 @bubu/configs 包里，
   项目根的 `.oxlintrc.json` 只做一件事：extends 对应框架预设。
3. **tsconfig 必须继承共享基座**，不手写编译选项；`include` 由项目自己声明（预设里刻意不带）：
   `{ "extends": "./node_modules/@bubu/configs/tsconfig/<framework>.json", "include": ["src"] }`
4. **Git 提交信息遵循 Conventional Commits**：`feat:` / `fix:` / `docs:` /
   `refactor:` / `perf:` / `chore:` 等，格式由 commitlint 强制校验。

## 新项目接入（AI 按此执行）

```bash
pnpm add -D oxlint oxfmt husky lint-staged typescript \
  @commitlint/cli @commitlint/config-conventional \
  @bubu/configs          # Vue 项目另加 vue-tsc；Solid 项目另加 solid-js

pnpm exec configs-init init vue   # 或 react / solid，生成全套根配置
```

init 之后手动补齐：

1. `tsconfig.json`（预设里不带 `include`，必须自己声明）：
   `{ "extends": "./node_modules/@bubu/configs/tsconfig/vue.json", "include": ["src"] }`
2. `package.json` scripts（`fmt:check` 别漏，CI 模板跑的是它）：
   ```json
   {
     "lint": "oxlint",
     "lint:fix": "oxlint --fix",
     "fmt": "oxfmt",
     "fmt:check": "oxfmt --check",
     "check": "oxfmt --check && oxlint",
     "typecheck": "tsc --noEmit",
     "prepare": "husky"
   }
   ```
3. `.husky/pre-commit` → `pnpm exec lint-staged`
   `.husky/commit-msg` → `pnpm exec commitlint --edit "$1"`

## 常用命令

| 命令                          | 说明                                              |
| ----------------------------- | ------------------------------------------------- |
| `pnpm lint` / `pnpm lint:fix` | oxlint 检查 / 自动修复                            |
| `pnpm fmt`                    | oxfmt 格式化（JS/TS/Vue/CSS/JSON/YAML/MD 全类型） |
| `pnpm check`                  | fmt:check + lint，CI 与提交前跑这个               |

## 修改规则的正确姿势

想调整 lint 规则或格式化风格时，**不要改项目里的 override**（除非是临时豁免），
而是去 @bubu/configs 的开发仓库改预设并发新版本，然后各项目 `pnpm up @bubu/configs`。
