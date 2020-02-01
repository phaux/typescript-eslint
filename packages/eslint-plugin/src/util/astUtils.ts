import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  RuleFix,
  RuleFixer,
  SourceCode,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';

export const LINEBREAK_MATCHER = /\r\n|[\r\n\u2028\u2029]/;

export function isOptionalChainPunctuator(
  token: TSESTree.Token | TSESTree.Comment,
): token is TSESTree.PunctuatorToken & { value: '?.' } {
  return token.type === AST_TOKEN_TYPES.Punctuator && token.value === '?.';
}
export function isNotOptionalChainPunctuator(
  token: TSESTree.Token | TSESTree.Comment,
): boolean {
  return !isOptionalChainPunctuator(token);
}

export function isNonNullAssertionPunctuator(
  token: TSESTree.Token | TSESTree.Comment,
): token is TSESTree.PunctuatorToken & { value: '!' } {
  return token.type === AST_TOKEN_TYPES.Punctuator && token.value === '!';
}
export function isNotNonNullAssertionPunctuator(
  token: TSESTree.Token | TSESTree.Comment,
): boolean {
  return !isNonNullAssertionPunctuator(token);
}

/**
 * Returns true if and only if the node represents: foo?.() or foo.bar?.()
 */
export function isOptionalOptionalChain(
  node: TSESTree.Node,
): node is TSESTree.OptionalCallExpression & { optional: true } {
  return (
    node.type === AST_NODE_TYPES.OptionalCallExpression &&
    // this flag means the call expression itself is option
    // i.e. it is foo.bar?.() and not foo?.bar()
    node.optional
  );
}

/**
 * Returns true if and only if the node represents logical OR
 */
export function isLogicalOrOperator(
  node: TSESTree.Node,
): node is TSESTree.LogicalExpression & { operator: '||' } {
  return (
    node.type === AST_NODE_TYPES.LogicalExpression && node.operator === '||'
  );
}

/**
 * Determines whether two adjacent tokens are on the same line
 */
export function isTokenOnSameLine(
  left: TSESTree.Token | TSESTree.Comment,
  right: TSESTree.Token | TSESTree.Comment,
): boolean {
  return left.loc.end.line === right.loc.start.line;
}

/**
 * Checks if a node is a type assertion:
 * - x as foo
 * - <foo>x
 */
export function isTypeAssertion(
  node: TSESTree.Node | undefined | null,
): node is TSESTree.TSAsExpression | TSESTree.TSTypeAssertion {
  if (!node) {
    return false;
  }
  return (
    node.type === AST_NODE_TYPES.TSAsExpression ||
    node.type === AST_NODE_TYPES.TSTypeAssertion
  );
}

/**
 * Determines if a node is surrounded by parentheses.
 * @param sourceCode The ESLint source code object
 * @param node The node to be checked.
 * @returns True if the node is parenthesised.
 */
export function isParenthesised(
  sourceCode: SourceCode,
  node: TSESTree.Node,
): boolean {
  const previousToken = sourceCode.getTokenBefore(node),
    nextToken = sourceCode.getTokenAfter(node);

  return (
    previousToken != null &&
    nextToken != null &&
    previousToken.value === '(' &&
    previousToken.range[1] <= node.range[0] &&
    nextToken.value === ')' &&
    nextToken.range[0] >= node.range[1]
  );
}

/**
 * Operator precedence
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
 * @see https://tc39.es/ecma262/#sec-ecmascript-language-expressions
 */
export enum Precedence {
  Sequence = 1,
  Yield = 2,
  Assignment = 3,
  Conditional = 4,
  LogicalOr = 5,
  LogicalAnd = 6,
  NullishCoalescing = 7,
  BinaryOr = 8,
  BinaryXor = 9,
  BinaryAnd = 10,
  Equality = 11,
  Relational = 12,
  BitwiseShift = 13,
  Additive = 14,
  Multiplicative = 15,
  Exponentiation = 16,
  Unary = 17,
  Update = 18,
  Call = 20,
}

export function getPrecedence(node: TSESTree.Node): Precedence | null {
  switch (node.type) {
    case AST_NODE_TYPES.SequenceExpression:
    case AST_NODE_TYPES.ArrowFunctionExpression:
      return Precedence.Sequence;

    case AST_NODE_TYPES.YieldExpression:
      return Precedence.Yield;

    case AST_NODE_TYPES.AssignmentExpression:
      return Precedence.Assignment;

    case AST_NODE_TYPES.ConditionalExpression:
      return Precedence.Conditional;

    case AST_NODE_TYPES.LogicalExpression:
      switch (node.operator) {
        case '||':
          return Precedence.LogicalOr;
        case '&&':
          return Precedence.LogicalAnd;
        case '??':
          return Precedence.NullishCoalescing;
      }
    // falls through

    case AST_NODE_TYPES.BinaryExpression:
      switch (node.operator) {
        case '|':
          return Precedence.BinaryOr;
        case '^':
          return Precedence.BinaryXor;
        case '&':
          return Precedence.BinaryAnd;
        case '==':
        case '!=':
        case '===':
        case '!==':
          return Precedence.Equality;
        case '<':
        case '<=':
        case '>':
        case '>=':
        case 'in':
        case 'instanceof':
          return Precedence.Relational;
        case '<<':
        case '>>':
        case '>>>':
          return Precedence.BitwiseShift;
        case '+':
        case '-':
          return Precedence.Additive;
        case '*':
        case '/':
        case '%':
          return Precedence.Multiplicative;
        case '**':
          return Precedence.Exponentiation;
      }
    // falls through

    case AST_NODE_TYPES.UnaryExpression:
    case AST_NODE_TYPES.AwaitExpression:
      return Precedence.Unary;

    case AST_NODE_TYPES.UpdateExpression:
      return Precedence.Update;

    case AST_NODE_TYPES.CallExpression:
    case AST_NODE_TYPES.NewExpression:
      return Precedence.Call;
  }

  return null;
}

export interface WrappingFixerParams {
  /** The SourceCode object from ESLint. Used for getting source code string from nodes */
  sourceCode: SourceCode;
  /** The node you want to wrap */
  node: TSESTree.Node;
  /**
   * The node you want to preserve.
   * By default it is the same as `node`, but you might want to preserve only one of it's descendants.
   * Use this if you want to replace part of `node` with another expression.
   * This must be a descendant of the wrapped `node`.
   */
  innerNode?: TSESTree.Node;
  /**
   * Specify the precedence of the expression you're wrapping the node with
   * @example for ``{ change: code => `${code} == 0` }`` you would specify `Precedence.Equality`
   */
  precedence: Precedence;
  /**
   * Specify arbitrary code to output in place of wrapped `node` or `innerNode` if specified
   * @example ``code => `${code} == 0` ``
   */
  change: (innerNodeCode: string) => string;
}

export function getWrappingFixer({
  sourceCode,
  node,
  innerNode = node,
  precedence,
  change,
}: WrappingFixerParams) {
  return (fixer: RuleFixer): RuleFix => {
    let text = sourceCode.getText(innerNode);

    // check the inner expression's precedence
    if (
      (getPrecedence(innerNode) ?? Infinity) <= precedence &&
      !isParenthesised(sourceCode, node)
    ) {
      // wrap the inner expression in parens
      text = `(${text})`;
    }

    // do the code transform
    text = change(text);

    // check the outer expression's precedence
    if (
      node.parent != null &&
      (getPrecedence(node.parent) ?? 0) >= precedence &&
      !isParenthesised(sourceCode, node.parent)
    ) {
      // wrap the whole expression in parens
      text = `(${text})`;
    }

    return fixer.replaceText(node, text);
  };
}
