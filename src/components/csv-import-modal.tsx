"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, X, AlertCircle, CheckCircle, FileText, Loader2 } from "lucide-react";
import { importCSV, ImportResult } from "@/app/actions/import-csv";
import { generateExampleCSV } from "@/lib/csv-parser";
import { toast } from "sonner";

interface CSVImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CSVImportModal({ isOpen, onClose }: CSVImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'text/csv') {
            setFile(droppedFile);
            setResult(null);
        } else {
            toast.error("Please drop a valid CSV file");
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setIsProcessing(true);
        try {
            const text = await file.text();
            const importResult = await importCSV(text);
            setResult(importResult);

            if (importResult.success && importResult.imported > 0) {
                toast.success(`Successfully imported ${importResult.imported} transactions`);
                if (importResult.failed > 0) {
                    toast.warning(`${importResult.failed} rows had errors and were skipped`);
                }
            } else if (importResult.error) {
                toast.error(importResult.error);
            }
        } catch (err) {
            toast.error("Failed to read file. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownloadTemplate = () => {
        const csv = generateExampleCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'spendwise-template.csv';
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Template downloaded");
    };

    const handleClose = () => {
        setFile(null);
        setResult(null);
        setIsProcessing(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
            >
                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-serif tracking-tight text-zinc-900 dark:text-zinc-50">
                                Import Transactions
                            </h2>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
                                Bulk Upload via CSV
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    {/* Format Instructions */}
                    {!result && (
                        <div className="bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                        Required CSV Format
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 font-mono bg-blue-100/50 dark:bg-blue-900/30 p-2 rounded">
                                        date,merchant,amount,type,category,description
                                    </p>
                                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 pl-1">
                                        <li>• <strong>date:</strong> YYYY-MM-DD format (e.g., 2024-01-15)</li>
                                        <li>• <strong>merchant:</strong> Store or entity name</li>
                                        <li>• <strong>amount:</strong> Positive number (e.g., 12.50)</li>
                                        <li>• <strong>type:</strong> Either "income" or "expense"</li>
                                        <li>• <strong>category:</strong> Category name (e.g., Food, Transport)</li>
                                        <li>• <strong>description:</strong> Optional notes</li>
                                    </ul>
                                </div>
                            </div>
                            <Button
                                onClick={handleDownloadTemplate}
                                variant="ghost"
                                className="w-full text-xs font-bold uppercase tracking-widest h-10"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Example Template
                            </Button>
                        </div>
                    )}

                    {/* File Upload Zone */}
                    {!result && (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl p-8 transition-all ${isDragging
                                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                }`}
                        >
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800">
                                    <Upload className="w-8 h-8 text-zinc-400" />
                                </div>
                                {file ? (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                            Drag and drop your CSV file here
                                        </p>
                                        <p className="text-xs text-zinc-500 uppercase tracking-wider">
                                            or click to browse
                                        </p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="csv-upload"
                                />
                                <label htmlFor="csv-upload">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="cursor-pointer"
                                        onClick={() => document.getElementById('csv-upload')?.click()}
                                    >
                                        Select File
                                    </Button>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Result Display */}
                    {result && (
                        <div className="space-y-4">
                            {result.success ? (
                                <div className="bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                        <div className="space-y-2 flex-1">
                                            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                                                Import Successful
                                            </p>
                                            <div className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                                                <p>✓ {result.imported} transactions imported</p>
                                                {result.failed > 0 && (
                                                    <p className="text-amber-600 dark:text-amber-400">
                                                        ⚠ {result.failed} rows skipped due to errors
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                        <div className="space-y-2 flex-1">
                                            <p className="text-sm font-medium text-rose-900 dark:text-rose-100">
                                                {result.error || "Data doesn't match required format"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error List */}
                            {result.errors && result.errors.length > 0 && (
                                <div className="max-h-48 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                                        Validation Errors ({result.errors.length})
                                    </p>
                                    <div className="space-y-2">
                                        {result.errors.slice(0, 10).map((error, idx) => (
                                            <div key={idx} className="text-xs text-zinc-600 dark:text-zinc-400">
                                                <span className="font-mono text-rose-600 dark:text-rose-400">
                                                    Row {error.row}
                                                </span>
                                                {' - '}
                                                <span className="font-medium">{error.field}:</span>
                                                {' '}
                                                {error.message}
                                            </div>
                                        ))}
                                        {result.errors.length > 10 && (
                                            <p className="text-xs text-zinc-500 italic pt-2">
                                                ...and {result.errors.length - 10} more errors
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        {result ? (
                            <>
                                <Button
                                    onClick={() => {
                                        setFile(null);
                                        setResult(null);
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Import Another File
                                </Button>
                                <Button
                                    onClick={handleClose}
                                    className="flex-1 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
                                >
                                    Done
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    onClick={handleClose}
                                    variant="outline"
                                    className="flex-1"
                                    disabled={isProcessing}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleImport}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    disabled={!file || isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Import Transactions'
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
