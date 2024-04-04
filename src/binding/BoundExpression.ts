import { EvaluationResult } from '../evaluation/EvaluationResult';
import { BoundBinaryOperator, BoundUnaryOperator } from './BoundOperator';

export type Type = 'number' | 'boolean';

// Generated code

export type UnaryExpression = {
    kind: "UnaryExpression";
    type: Type;
    operand: BoundExpression;
    operator: BoundUnaryOperator;
};
export type BinaryExpression = {
    kind: "BinaryExpression";
    type: Type;
    left: BoundExpression;
    operator: BoundBinaryOperator;
    right: BoundExpression;
};
export type LiteralExpression = {
    kind: "LiteralExpression";
    type: Type;
    value: EvaluationResult;
};
export type VariableExpression = {
    kind: "VariableExpression";
    type: Type;
    name: string;
};
export type AssignmentExpression = {
    kind: "AssignmentExpression";
    type: Type;
    name: string;
    expression: BoundExpression;
};
export type BoundExpression = UnaryExpression | BinaryExpression | LiteralExpression | VariableExpression | AssignmentExpression;
export function BoundUnaryExpression(type: Type, operand: BoundExpression, operator: BoundUnaryOperator): UnaryExpression {
    return {
        kind: "UnaryExpression",
        type,
        operand,
        operator
    };
}
export function BoundBinaryExpression(type: Type, left: BoundExpression, operator: BoundBinaryOperator, right: BoundExpression): BinaryExpression {
    return {
        kind: "BinaryExpression",
        type,
        left,
        operator,
        right
    };
}
export function BoundLiteralExpression(type: Type, value: EvaluationResult): LiteralExpression {
    return {
        kind: "LiteralExpression",
        type,
        value
    };
}
export function BoundVariableExpression(type: Type, name: string): VariableExpression {
    return {
        kind: "VariableExpression",
        type,
        name
    };
}
export function BoundAssignmentExpression(type: Type, name: string, expression: BoundExpression): AssignmentExpression {
    return {
        kind: "AssignmentExpression",
        type,
        name,
        expression
    };
}
