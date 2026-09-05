# frontend-config-pack

前端工程化配置包，开箱即用：**oxlint（lint）+ oxfmt（format）+ husky + lint-staged + commitlint**，覆盖 Vue3 / React / SolidJS 三套 TypeScript 预设，三套框架配置分开维护。

Rust 实现，比 ESLint + Prettier 快 1~2 个数量级，全项目 lint 毫秒级完成。

## 目录结构

```
frontend-config-pack/
├── .oxlintrc.json           # 项目根 oxlint 配置（本仓库只 extends base；业务项目换框架改这一行）
├── .oxfmtrc.json            # oxfmt 格式化配置（Prettier 兼容，原生支持 .vue SFC / TSX）
├── packages/configs/        # 要发布的 npm 包 @lancernix/configs
│   ├── oxlint/              # 三套框架预设，分开维护
│   │   ├── base.json        # 共享基础：忽略项 + 环境 + correctness/suspicious + import/promise 插件
│   │   ├── vue.json         # Vue3：vue 插件（oxlint 内置 46 条 vue/* 规则）
│   │   ├── react.json       # React：react + react-perf + jsx-a11y 插件
│   │   └── solid.json       # Solid 2.0：jsx-a11y + oxlint-plugin-solidjs + 已删除 API 拦截
│   ├── tsconfig/            # TS 基座配置（base + vue/react/solid 三个变体）
│   ├── templates/           # configs-init 一键初始化模板（oxfmt/gitignore/CI/AGENTS.md）
│   └── bin.js               # configs-init CLI
├── examples/                # 三个框架的冒烟测试示例（也是接入参考）
├── commitlint.config.mjs    # Conventional Commits 提交信息校验
├── lint-staged.config.mjs   # 只检查 git 暂存区文件
├── .husky/                  # pre-commit（lint-staged）+ commit-msg（commitlint）
└── .vscode/                 # oxc.oxc-vscode 扩展 + 保存自动修复/格式化
```

## 快速开始

```bash
pnpm install   # 安装依赖，postinstall 自动启用 husky
```

### 常用命令

| 命令                                          | 作用                                      |
| --------------------------------------------- | ----------------------------------------- |
| `pnpm lint`                                   | oxlint 检查整个项目                       |
| `pnpm lint:fix`                               | oxlint 检查并安全自动修复                 |
| `pnpm fmt`                                    | oxfmt 格式化全项目                        |
| `pnpm fmt:check`                              | CI 里检查格式（不改动，不合规则退出码 1） |
| `pnpm check`                                  | fmt:check + lint 一起跑（CI 用）          |
| `pnpm lint:vue` / `lint:react` / `lint:solid` | 用对应预设检查 examples 冒烟文件          |

### 验证三套预设（本包自带冒烟测试）

```bash
pnpm lint:vue && pnpm lint:react && pnpm lint:solid && pnpm fmt:check
```

## 接入到新项目

1. 拷贝 `packages/configs/oxlint/`、`packages/configs/tsconfig/`、`packages/configs/templates/` 内容及 `.husky/`、`.vscode/` 到项目根（或发布后直接装 `@lancernix/configs`，见 `packages/configs/README.md`）。
2. 装依赖：

```bash
pnpm add -D oxlint oxfmt husky lint-staged @commitlint/cli @commitlint/config-conventional typescript
```

3. 项目根 `.oxlintrc.json` 里 `extends` 指向对应预设：

```json
{ "extends": ["./packages/configs/oxlint/vue.json"] }
```

4. `package.json` 加脚本：

```json
{
  "scripts": {
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "fmt": "oxfmt",
    "fmt:check": "oxfmt --check",
    "prepare": "husky"
  }
}
```

## Git 提交规范

- **pre-commit**：`lint-staged` 只对暂存文件跑 `oxlint --fix` + `oxfmt`，毫秒级完成。
- **commit-msg**：`commitlint` 校验 Conventional Commits 格式，合法示例：

```
feat(login): 支持手机号验证码登录
fix: 修复列表分页参数丢失
docs(readme): 补充接入说明
```

type 可选：`feat / fix / docs / style / refactor / perf / test / build / ci / chore / revert`。

## 设计要点与已知边界

- **三套预设分开**：框架插件差异大（vue 插件共 47 条、本预设生效 34 条 / react+perf+a11y / solid 走社区插件），不混在一个配置里，`extends` base 保证基础一致。
- **类别策略**：三套预设统一 `correctness: error`（真 bug）+ `suspicious: warn`（疑似 bug），style/pedantic 一律不开（写法偏好不强制，格式由 oxfmt 全权管）。Vue 预设曾单独开过 `style: warn`，实测与惯用写法冲突严重（12 行典型 composable 报 5 条警告，累计豁免 8 条规则仍是打地鼠），已于 2026-08-30 撤除对齐 react/solid；过程见 `CR-2026-08-30.md`。想要某条风格规则时在 `rules` 里单条显式添加即可。
- **规则名坑**：oxlint 的 hooks 规则挂在 `react` 插件下（`react/exhaustive-deps`），不是 `react-hooks/*`；写不存在的规则名会导致**整个配置解析失败**，可用 `oxlint --rules -c packages/configs/oxlint/base.json` 查可用规则。
- **官方生态现状（2026-08 调研）**：oxc 官方没有"全家桶"预设包，推荐姿势就是默认 correctness + categories 按需开（本包的做法）；从 ESLint 迁移用 `@oxlint/migrate`。两个值得关注的新能力：**type-aware linting**（`oxlint-tsgolint` 包，59/61 条 typescript-eslint 类型规则，`options.typeAware: true` 开启，`--type-check` 还能替代 `tsc --noEmit`，接近稳定但默认不集成）；**`oxlint.config.ts` + `defineConfig`**（官方新的共享方式，可 import 配置对象，绕开 JSON `extends` 不认包名的坑，未来可迁移，JSON 预设目前工作正常暂不动）。
- **Solid 预设面向 2.0**（不再考虑 1.x）：通过 `jsPlugins`（oxlint 的 JS 插件 API）接入社区移植的 `oxlint-plugin-solidjs`，其响应性核心规则（`no-destructure`、`reactivity`、`prefer-for/show`）在 2.0 细粒度响应式模型下依然全部适用；另用 `no-restricted-imports` 直接拦截 2.0 已删除的 API（`createResource` / `batch` / `startTransition` / `useTransition` / `on` / `createComputed` / `produce` / `createMutable`），类型检查会再兜底一层。注意 `jsx-uses-vars` 在 oxlint 下必须关闭（未使用检测由 oxlint 原生处理）。
- **oxlint 的 vue 插件有覆盖缺口**（实测 oxlint 1.80）：目前只移植了 47 条规则（correctness 32 / suspicious 2 / restriction 3 / style 10），`require-v-for-key`（v-for 缺 key）、`no-use-v-if-with-v-for`（v-if 与 v-for 同级）、`attributes-order`、`html-self-closing` 等经典 eslint-plugin-vue 规则**均未移植**。从 ESLint 迁过来时别以为这些还有保护：模板格式交给 oxfmt，逻辑类问题目前只能靠 review 或 `vue-tsc`。
- **oxfmt 默认 printWidth 100**（Prettier 是 80），本包显式设为 100；从 Prettier 迁移想零 diff 可改成 80。
- **类型检查不归 oxlint**：TS 项目建议补 `vue-tsc --noEmit`（Vue）或 `tsc --noEmit` 进 CI。
