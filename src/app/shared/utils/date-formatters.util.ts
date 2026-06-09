import { formatDate } from "@angular/common";

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

/**
 * Formats the period string to format yyyy-MM-dd
 * @param date the date to format
 * @returns The formatted period in string value
 */
export function convertToDateFormat(date: string | Date): string {
    // Case 1: Object Date native
    if (date instanceof Date) {
        return formatDate(date, 'yyyy-MM-dd', 'en-US');
    }

    // Case 2: string format 'dd/MM/yyyy'
    if (typeof date === 'string' && date.includes('/')) {
        const [day, month, year] = date.split('/').map(Number);
        const jsDate = new Date(year, month - 1, day);

        return formatDate(jsDate, 'yyyy-MM-dd', 'en-US');
    }

    // Case 3: valid string format 'yyyy-MM-dd'
    return date;
}