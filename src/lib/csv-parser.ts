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
            message: `Missing required columns: ${missingHeaders.join(', ')}`
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
                message: 'Invalid date format. Use YYYY-MM-DD (e.g., 2024-01-15)'
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
                message: 'Amount must be a valid number (e.g., 12.50)'
            });
            hasError = true;
        } else if (parseFloat(amountValue) <= 0) {
            errors.push({
                row: rowNumber,
                field: 'amount',
                message: 'Amount must be greater than 0'
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
                message: 'Type must be either "income" or "expense"'
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
