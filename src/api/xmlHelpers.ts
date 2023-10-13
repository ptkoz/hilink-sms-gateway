import { fromUnixTime, parse } from "date-fns";

/**
 * Returns the text content of the first element matching the selector or null if element is not found
 * or has no text content.
 */
function getTextContent(document: Document|Element, selector: string): string|null {
    const node = document.querySelector(selector);
    if (node === null) {
        return null;
    }

    const value = node.textContent;
    if (value === null || value.length === 0) {
        return null;
    }

    return value;
}

/**
 * Returns contents of given node as integer number
 */
export function extractInt(document: Document|Element, selector: string): number {
    const value = getTextContent(document, selector);
    if (value === null) {
        return 0;
    }

    const parsedValue = parseInt(value);
    return isNaN(parsedValue) ? 0 : parsedValue;
}

/**
 * Returns contents of given node as string or a fallback value if not found
 */
export function extractString(document: Document|Element, selector: string, fallback?: undefined): string|undefined;
export function extractString<T>(document: Document|Element, selector: string, fallback: T): string|T;
export function extractString<T>(document: Document|Element, selector: string, fallback: T): string|T {
    const value = getTextContent(document, selector)
    if (value === null) {
        return fallback;
    }

    return value;
}

/**
 * Returns contents of given node interpreted as date & time in hilink's format
 */
export function extractTimestamp(document: Document|Element, selector: string): Date {
    const value = getTextContent(document, selector);
    if (value === null) {
        return fromUnixTime(0);
    }

    const date = parse(value, "yyyy-MM-dd HH:mm:ss", fromUnixTime(0));
    if (isNaN(date.valueOf())) {
        return fromUnixTime(0);
    }

    return date;
}
