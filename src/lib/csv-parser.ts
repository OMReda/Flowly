import { Transaction } from "./types";

export interface CSVRow {
    date: string;
    merchant: string;
    amount: string;
    type: string;
    category: string;
    description?: string;
}

export interface CSVValidationError {
    row: number;
    field: string;
    message: string;
}

export interface CSVParseResult {
    valid: CSVRow[];
    errors: CSVValidationError[];
    totalRows: number;
}

/**
 * Expected CSV format:
 * date,merchant,amount,type,category,description
 * 2024-01-15,Starbucks,12.50,expense,Food,Morning coffee
 */
/**
 * Universal Data Parser
 * Supports: CSV, JSON
 */

export function parseData(text: string, filename?: string): CSVParseResult {
    const isJson = filename?.toLowerCase().endsWith('.json') || (text.trim().startsWith('[') || text.trim().startsWith('{'));

    if (isJson) {
        return parseJSON(text);
    }
    return parseCSV(text);
}

export function parseJSON(jsonText: string): CSVParseResult {
    const valid: CSVRow[] = [];
    const errors: CSVValidationError[] = [];
    let totalRows = 0;

    try {
        const data = JSON.parse(jsonText);
        const rows = Array.isArray(data) ? data : [data];
        totalRows = rows.length;

        rows.forEach((item, index) => {
            const rowNumber = index + 1;
            const row: Partial<CSVRow> = {};
            let hasError = false;

            // Date validation
            if (!item.date) {
                errors.push({ row: rowNumber, field: 'date', message: 'Date is required (YYYY-MM-DD).' });
                hasError = true;
            } else if (!isValidDate(item.date)) {
                errors.push({ row: rowNumber, field: 'date', message: 'Invalid date format. Use YYYY-MM-DD.' });
                hasError = true;
            } else {
                row.date = item.date;
            }

            // Merchant validation
            if (!item.merchant) {
                errors.push({ row: rowNumber, field: 'merchant', message: 'Merchant name is required.' });
                hasError = true;
            } else {
                row.merchant = item.merchant;
            }

            // Amount validation
            if (item.amount === undefined || item.amount === null) {
                errors.push({ row: rowNumber, field: 'amount', message: 'Amount is required.' });
                hasError = true;
            } else {
                const amount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount);
                if (isNaN(amount)) {
                    errors.push({ row: rowNumber, field: 'amount', message: 'Amount must be a valid number.' });
                    hasError = true;
                } else if (amount <= 0) {
                    errors.push({ row: rowNumber, field: 'amount', message: 'Amount must be a positive number.' });
                    hasError = true;
                } else {
                    row.amount = amount.toString();
                }
            }

            // Type validation
            if (!item.type) {
                errors.push({ row: rowNumber, field: 'type', message: 'Transaction type is required.' });
                hasError = true;
            } else if (item.type !== 'income' && item.type !== 'expense') {
                errors.push({ row: rowNumber, field: 'type', message: 'Type must be "income" or "expense".' });
                hasError = true;
            } else {
                row.type = item.type;
            }

            // Category validation
            if (!item.category) {
                errors.push({ row: rowNumber, field: 'category', message: 'Category is required.' });
                hasError = true;
            } else {
                row.category = item.category;
            }

            // Optional description
            if (item.description) {
                row.description = item.description;
            }

            if (!hasError) {
                valid.push(row as CSVRow);
            }
        });

    } catch (e) {
        errors.push({
            row: 0,
            field: 'json',
            message: 'Invalid JSON format. Please ensure your file is a valid JSON array or object.'
        });
    }

    return { valid, errors, totalRows };
}

export function parseCSV(csvText: string): CSVParseResult {
    const lines = csvText.trim().split('\n');
    const valid: CSVRow[] = [];
    const errors: CSVValidationError[] = [];

    if (lines.length === 0) {
        errors.push({
            row: 0,
            field: 'file',
            message: 'CSV file is empty'
        });
        return { valid, errors, totalRows: 0 };
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const expectedHeaders = ['date', 'merchant', 'amount', 'type', 'category'];

    // Validate header
    const missingHeaders = expectedHeaders.filter(h => !header.includes(h));
    if (missingHeaders.length > 0) {
        errors.push({
            row: 0,
            field: 'header',
            message: `The CSV is missing required columns: ${missingHeaders.join(', ')}. Please ensure your file includes exactly: ${expectedHeaders.join(', ')} (and optional 'description').`
        });
        return { valid, errors, totalRows: 0 };
    }

    // Get column indices
    const dateIdx = header.indexOf('date');
    const merchantIdx = header.indexOf('merchant');
    const amountIdx = header.indexOf('amount');
    const typeIdx = header.indexOf('type');
    const categoryIdx = header.indexOf('category');
    const descriptionIdx = header.indexOf('description');

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        const values = line.split(',').map(v => v.trim());
        const rowNumber = i + 1;

        // Validate row has enough columns
        if (values.length < expectedHeaders.length) {
            errors.push({
                row: rowNumber,
                field: 'row',
                message: 'Row has missing columns'
            });
            continue;
        }

        const row: Partial<CSVRow> = {};
        let hasError = false;

        // Validate and parse date
        const dateValue = values[dateIdx];
        if (!dateValue) {
            errors.push({
                row: rowNumber,
                field: 'date',
                message: 'Date is required'
            });
            hasError = true;
        } else if (!isValidDate(dateValue)) {
            errors.push({
                row: rowNumber,
                field: 'date',
                message: 'Invalid date format. Please use YYYY-MM-DD (for example: 2024-01-15).'
            });
            hasError = true;
        } else {
            row.date = dateValue;
        }

        // Validate merchant
        const merchantValue = values[merchantIdx];
        if (!merchantValue) {
            errors.push({
                row: rowNumber,
                field: 'merchant',
                message: 'Merchant is required'
            });
            hasError = true;
        } else {
            row.merchant = merchantValue;
        }

        // Validate and parse amount
        const amountValue = values[amountIdx];
        if (!amountValue) {
            errors.push({
                row: rowNumber,
                field: 'amount',
                message: 'Amount is required'
            });
            hasError = true;
        } else if (isNaN(parseFloat(amountValue))) {
            errors.push({
                row: rowNumber,
                field: 'amount',
                message: 'Amount must be a valid number (for example: 12.50). Please remove currency symbols or commas.'
            });
            hasError = true;
        } else if (parseFloat(amountValue) <= 0) {
            errors.push({
                row: rowNumber,
                field: 'amount',
                message: 'Amount must be a positive number. Please check if this is a negative value.'
            });
            hasError = true;
        } else {
            row.amount = amountValue;
        }

        // Validate type
        const typeValue = values[typeIdx];
        if (!typeValue) {
            errors.push({
                row: rowNumber,
                field: 'type',
                message: 'Type is required'
            });
            hasError = true;
        } else if (typeValue !== 'income' && typeValue !== 'expense') {
            errors.push({
                row: rowNumber,
                field: 'type',
                message: 'Transaction type must be either "income" or "expense" (lowercase).'
            });
            hasError = true;
        } else {
            row.type = typeValue;
        }

        // Validate category
        const categoryValue = values[categoryIdx];
        if (!categoryValue) {
            errors.push({
                row: rowNumber,
                field: 'category',
                message: 'Category is required'
            });
            hasError = true;
        } else {
            row.category = categoryValue;
        }

        // Optional description
        if (descriptionIdx >= 0 && values[descriptionIdx]) {
            row.description = values[descriptionIdx];
        }

        if (!hasError) {
            valid.push(row as CSVRow);
        }
    }

    return {
        valid,
        errors,
        totalRows: lines.length - 1 // Exclude header
    };
}

function isValidDate(dateStr: string): boolean {
    // Check format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) return false;

    // Check if it's a valid date
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
}

export function generateExampleCSV(): string {
    return `date,merchant,amount,type,category,description
2024-01-15,Starbucks,12.50,expense,Food,Morning coffee
2024-01-16,Amazon,45.99,expense,Shopping,Books
2024-01-17,Paycheck,2500.00,income,Salary,Monthly salary
2024-01-18,Uber,18.75,expense,Transport,Ride to airport`;
}

export function generateExampleJSON(): string {
    return JSON.stringify([
        {
            "date": "2024-01-15",
            "merchant": "Starbucks",
            "amount": 12.50,
            "type": "expense",
            "category": "Food",
            "description": "Morning coffee"
        },
        {
            "date": "2024-01-16",
            "merchant": "Amazon",
            "amount": 45.99,
            "type": "expense",
            "category": "Shopping",
            "description": "Books"
        }
    ], null, 4);
}
