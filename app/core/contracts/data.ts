import { SourceContract, assertSourceContract } from '@core/contracts/Source.js'
import type {
  SupportedCollection,
  SourceWhereClause,
  SourceFindAllOptions,
  SourceContractMethods,
  SourceContractDefinition
} from '@core/contracts/Source.js'

import { LoaderContract, assertLoaderContract } from '@core/contracts/Loader.js'
import type {
  LoaderOptions,
  ChapterListOptions,
  BaseContentEntity,
  Lesson,
  Chapter,
  Course,
  Exercise,
  Asset,
  LoaderContractMethods,
  LoaderContractDefinition
} from '@core/contracts/Loader.js'

import { QueryContract, assertQueryContract } from '@core/contracts/Query.js'
import type {
  QueryOptions,
  QueryChapterListOptions,
  QueryContractMethods,
  QueryContractDefinition
} from '@core/contracts/Query.js'

export {
  SourceContract,
  assertSourceContract,
  LoaderContract,
  assertLoaderContract,
  QueryContract,
  assertQueryContract
}

export type {
  SupportedCollection,
  SourceWhereClause,
  SourceFindAllOptions,
  SourceContractMethods,
  SourceContractDefinition,
  LoaderOptions,
  ChapterListOptions,
  BaseContentEntity,
  Lesson,
  Chapter,
  Course,
  Exercise,
  Asset,
  LoaderContractMethods,
  LoaderContractDefinition,
  QueryOptions,
  QueryChapterListOptions,
  QueryContractMethods,
  QueryContractDefinition
}

export const DATA_CONTRACTS = {
  Source: 'Source' as const,
  Loader: 'Loader' as const,
  Query: 'Query' as const
}

export type DataContractKey = typeof DATA_CONTRACTS[keyof typeof DATA_CONTRACTS]

export default {
  DATA_CONTRACTS,
  SourceContract,
  assertSourceContract,
  LoaderContract,
  assertLoaderContract,
  QueryContract,
  assertQueryContract
}
