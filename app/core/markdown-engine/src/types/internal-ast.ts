/**
 * Internal AST — Markdown Engine Core Protocol (IMPLEMENTATION Decision 3).
 *
 * Engine 内所有模块（Transformer / Compiler / Plugin）只能操作 Internal AST。
 * Internal AST 不依赖任何 Parser 专有实现（mdast / markdown-it Token / micromark Node）。
 *
 * 本文件从 ast/types.ts re-export，作为 Internal AST 的显式协议入口。
 * 上层业务代码禁止直接 import InternalAST 具体字段 — 必须通过 public API（compile / run / parse）。
 */
import type {
  AstNode as _AstNode,
  RootAstNode as _RootAstNode,
  TransformedAstNode as _TransformedAstNode,
  TransformedRootAstNode as _TransformedRootAstNode,
  HeadingNode as _HeadingNode,
  CodeNode as _CodeNode,
  MathNode as _MathNode,
  LinkNode as _LinkNode,
  ListNode as _ListNode,
  AstNodeType as _AstNodeType,
  ParserOptions,
  TransformerContext,
  TransformerExtraData,
  TocEntry,
  HeadingInfo,
  ReadingTimeInfo,
  LinkInfo,
  ReferenceInfo
} from '../ast/types'

export type InternalNodeType = _AstNodeType
export type InternalAstNode = _AstNode
export type InternalRootAstNode = _RootAstNode
export type TransformedInternalAstNode = _TransformedAstNode
export type TransformedInternalRootAstNode = _TransformedRootAstNode
export type InternalHeadingNode = _HeadingNode
export type InternalCodeNode = _CodeNode
export type InternalMathNode = _MathNode
export type InternalLinkNode = _LinkNode
export type InternalListNode = _ListNode

export type {
  ParserOptions,
  TransformerContext,
  TransformerExtraData,
  TocEntry,
  HeadingInfo,
  ReadingTimeInfo,
  LinkInfo,
  ReferenceInfo
}
