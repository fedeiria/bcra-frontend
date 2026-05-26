/**
 * Formats the period string from "YYYYMM" to "MM/YYYY" 
 * @param periodoRaw The raw period string in "YYYYMM" format
 * @returns The formatted period string in "MM/YYYY" format, or the original string if it doesn't match the expected format
 */
export function formatPeriod(periodoRaw: string | number): string {
    const pStr = String(periodoRaw);
    if (pStr.length !== 6) return pStr;

    const year = pStr.substring(0, 4);
    const month = pStr.substring(4, 6);
    return `${month}/${year}`;
}