/**
 * Content Engine Sources 模块的统一导出入口
 * 
 * 设计意图：
 * =========
 * 提供 Sources 模块的公共 API，所有对外暴露的类型和类都通过此文件导出。
 * 
 * 为什么需要单独的 index.ts？
 * =========================
 * 1. **统一入口**：上层代码只需从 `./sources/index` 导入，无需关心具体文件位置
 * 2. **封装实现**：隐藏内部文件结构，便于未来重构
 * 3. **类型导出**：集中管理类型定义的导出
 */
export { FileSource } from './FileSource'
export { DatabaseSource } from './DatabaseSource'
export type { ContentSource, SourceType } from './types'
