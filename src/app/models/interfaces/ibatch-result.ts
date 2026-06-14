import { ICreditSummary } from "./icredit-summary";

export type IBatchResult = ICreditSummary | { cuit: string; error: true; message: string };