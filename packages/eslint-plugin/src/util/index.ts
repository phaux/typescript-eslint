import { ESLintUtils } from '@typescript-eslint/utils';

export * from './addBracesToArrowFix';
export * from './astUtils';
export * from './collectUnusedVariables';
export * from './createRule';
export * from './discardReturnValueFix';
export * from './getBaseTypesOfClassMember';
export * from './getConstraintInfo';
export * from './getFixOrSuggest';
export * from './getFunctionHeadLoc';
export * from './getNameFromExpression';
export * from './getOperatorPrecedence';
export * from './getRangeWithParens';
export * from './getStaticStringValue';
export * from './getStringLength';
export * from './getTextWithParentheses';
export * from './getThisExpression';
export * from './getValueOfLiteralType';
export * from './getWrappingFixer';
export * from './hasOverloadSignatures';
export * from './isArrayMethodCallWithPredicate';
export * from './isAssignee';
export * from './isHigherPrecedenceThanAwait';
export * from './isNodeEqual';
export * from './isNullLiteral';
export * from './isStartOfExpressionStatement';
export * from './isUndefinedIdentifier';
export * from './misc';
export * from './needsPrecedingSemiColon';
export * from './needsToBeAwaited';
export * from './objectIterators';
export * from './scopeUtils';
export * from './skipChainExpression';
export * from './truthinessUtils';
export * from './types';
export * from './walkStatements';

// this is done for convenience - saves migrating all of the old rules
export * from '@typescript-eslint/type-utils';

export const {
  applyDefault,
  deepMerge,
  getParserServices,
  isObjectNotArray,
  nullThrows,
  NullThrowsReasons,
} = ESLintUtils;
export type InferMessageIdsTypeFromRule<T> =
  ESLintUtils.InferMessageIdsTypeFromRule<T>;
export type InferOptionsTypeFromRule<T> =
  ESLintUtils.InferOptionsTypeFromRule<T>;
