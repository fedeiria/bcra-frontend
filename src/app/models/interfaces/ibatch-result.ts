import { ICreditSummary } from "./icredit-summary";

/**
 * Represents a failed result for a single CUIT in a batch request.
 * The `error: true` literal is the discriminant of the IBatchResult union.
 * `isTransient` indicates whether the error is retryable (true) or permanent (false).
 */
export interface IBatchError {
    cuit: string;
    error: true;
    message: string;
    isTransient: boolean;
}

/**
 * Discriminated union returned by the batch-summary endpoint.
 * Use isBatchError() to narrow safely — do NOT use `'error' in res`
 * because TypeScript cannot guarantee ICreditSummary lacks that key at runtime.
 */
export type IBatchResult = ICreditSummary | IBatchError;

/**
 * Type guard to narrow IBatchResult to IBatchError.
 * Checks the literal discriminant `error === true` via a cast-free approach.
 */
export function isBatchError(result: IBatchResult): result is IBatchError {
    return (result as IBatchError).error === true;
}