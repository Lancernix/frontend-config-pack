/**
 * commitlint：校验提交信息是否符合 Conventional Commits
 * 合法示例：
 *   feat(login): 支持手机号验证码登录
 *   fix: 修复列表分页参数丢失
 *   docs(readme): 补充接入说明
 *
 * type 可选值见下方 typeEnum，团队有需要可自行增删（如 feat/fix/ui）
 *
 * 注意：先声明具名常量再 export default，不要写匿名对象默认导出——
 * oxlint（correctness 级的 no-anonymous-default-export）会报 warning。
 * 对象 key 保持字母序（sort-keys，Vue 预设 style 类别开着）。
 */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 中文 subject 也允许，放宽对纯小写的要求
    'subject-case': [0],
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 缺陷修复
        'docs', // 文档
        'style', // 代码格式（不影响逻辑）
        'refactor', // 重构（既非新增也非修复）
        'perf', // 性能优化
        'test', // 测试
        'build', // 构建/依赖变更
        'ci', // CI 配置
        'chore', // 杂项
        'revert', // 回滚
      ],
    ],
  },
};

export default config;
