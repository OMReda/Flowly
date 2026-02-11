"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, X, AlertCircle, CheckCircle, FileText, Loader2 } from "lucide-react";
import { importCSV, ImportResult } from "@/app/actions/import-csv";
import { generateExampleCSV, generateExampleJSON } from "@/lib/csv-parser";
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
    const [format, setFormat] = useState<'csv' | 'json'>('csv');

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
        const isSupported = droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv') || droppedFile.type === 'application/json' || droppedFile.name.endsWith('.json'));

        if (isSupported) {
            setFile(droppedFile);
            setResult(null);
        } else {
            toast.error("Please drop a valid CSV or JSON file");
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
            const importResult = await importCSV(text, file.name);
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
        const content = format === 'csv' ? generateExampleCSV() : generateExampleJSON();
        const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
        const extension = format === 'csv' ? 'csv' : 'json';

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flowly-template.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`${extension.toUpperCase()} Template downloaded`);
    };

    const handleClose = () => {
        setFile(null);
        setResult(null);
        setIsProcessing(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
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
                                        Bulk Upload via CSV or JSON
                                    </p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-zinc-400" />
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {!result && !isProcessing && (
                                    <motion.div
                                        key="selection"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        {/* Format Instructions */}
                                        <div className={`transition-all duration-500 border rounded-2xl p-4 space-y-4 ${format === 'csv' ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50' : 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FileText className={`w-4 h-4 transition-colors duration-500 ${format === 'csv' ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`} />
                                                    <span className={`text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${format === 'csv' ? 'text-blue-900 dark:text-blue-100' : 'text-amber-900 dark:text-amber-100'}`}>
                                                        Requirements
                                                    </span>
                                                </div>
                                                <div className={`grid grid-cols-2 p-1 rounded-xl relative transition-all duration-500 overflow-hidden w-fit ${format === 'csv' ? 'bg-blue-100/40 dark:bg-blue-900/40' : 'bg-amber-100/40 dark:bg-amber-900/40'}`}>
                                                    {/* Deterministic Slider Cursor */}
                                                    <motion.div
                                                        className="absolute inset-y-1 bg-white dark:bg-zinc-900 rounded-lg shadow-sm"
                                                        initial={false}
                                                        animate={{
                                                            x: format === 'csv' ? '0%' : '100%',
                                                            left: '4px',
                                                            width: 'calc(50% - 4px)'
                                                        }}
                                                        transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                                                    />

                                                    <button
                                                        onClick={() => setFormat('csv')}
                                                        className={`relative px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 z-10 ${format === 'csv'
                                                            ? 'text-blue-600 dark:text-blue-400'
                                                            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
                                                    >
                                                        CSV
                                                    </button>
                                                    <button
                                                        onClick={() => setFormat('json')}
                                                        className={`relative px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 z-10 ${format === 'json'
                                                            ? 'text-amber-600 dark:text-amber-400'
                                                            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
                                                    >
                                                        JSON
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <p className={`text-[10px] font-mono p-4 rounded-xl border transition-all duration-500 max-h-40 overflow-y-auto whitespace-pre ${format === 'csv' ? 'bg-blue-900/10 dark:bg-blue-900/30 border-blue-200/50 dark:border-blue-800/50 text-blue-700 dark:text-blue-300' : 'bg-amber-900/10 dark:bg-amber-900/30 border-amber-200/50 dark:border-amber-800/50 text-amber-700 dark:text-amber-300'}`}>
                                                    {format === 'csv'
                                                        ? 'date,merchant,amount,type,category,description\n2024-01-15,"Starbucks",12.5,"expense","Food","Coffee"'
                                                        : generateExampleJSON()
                                                    }
                                                </p>
                                                <ul className={`grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-[10px] list-none p-0 transition-colors duration-500 ${format === 'csv' ? 'text-blue-800/70 dark:text-blue-200/70' : 'text-amber-800/70 dark:text-amber-200/70'}`}>
                                                    <li>• date: YYYY-MM-DD</li>
                                                    <li>• merchant: Store Name</li>
                                                    <li>• amount: Positive Number</li>
                                                    <li>• type: income/expense</li>
                                                    <li>• category: Category Name</li>
                                                    <li>• description: Notes</li>
                                                </ul>
                                            </div>
                                            <Button
                                                onClick={handleDownloadTemplate}
                                                variant="ghost"
                                                className={`w-full text-[10px] font-bold uppercase tracking-widest h-10 rounded-xl transition-all duration-300 ${format === 'csv' ? 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-700' : 'text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:text-amber-700'}`}
                                            >
                                                <Download className="w-3.5 h-3.5 mr-2" />
                                                Download {format.toUpperCase()} Template
                                            </Button>
                                        </div>

                                        {/* File Upload Zone */}
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
                                                            Drag and drop your CSV or JSON file here
                                                        </p>
                                                        <p className="text-xs text-zinc-500 uppercase tracking-wider">
                                                            or click to browse
                                                        </p>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    accept=".csv,.json"
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

                                        {/* Select Action */}
                                        <div className="flex gap-4 pt-4">
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
                                                Import Transactions
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {isProcessing && (
                                    <motion.div
                                        key="processing"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        className="flex flex-col items-center justify-center py-20 space-y-6"
                                    >
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                                            <Loader2 className="w-16 h-16 text-emerald-600 animate-spin relative" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <h3 className="text-xl font-serif text-zinc-900 dark:text-zinc-50">Ingesting Data...</h3>
                                            <p className="text-sm text-zinc-500">Parsing and synchronizing your records</p>
                                        </div>
                                    </motion.div>
                                )}

                                {result && (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-8"
                                    >
                                        {result.success ? (
                                            <div className="flex flex-col items-center text-center space-y-6 py-4">
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                                                    className="w-24 h-24 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center relative"
                                                >
                                                    <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full animate-pulse" />
                                                    <motion.svg
                                                        width="48"
                                                        height="48"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="text-emerald-600 dark:text-emerald-400 relative"
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ pathLength: 1 }}
                                                        transition={{ duration: 0.8, ease: "easeInOut", delay: 0.5 }}
                                                    >
                                                        <path d="M20 6L9 17l-5-5" />
                                                    </motion.svg>
                                                </motion.div>

                                                <div className="space-y-2">
                                                    <h3 className="text-3xl font-serif text-zinc-900 dark:text-zinc-50">Bulk Sync Complete</h3>
                                                    <p className="text-zinc-500">Your financial ledger has been updated successfully.</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                                                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                                        <p className="text-2xl font-serif text-emerald-600">{result.imported}</p>
                                                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Imported</p>
                                                    </div>
                                                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                                        <p className="text-2xl font-serif text-amber-600">{result.failed}</p>
                                                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Skipped</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-center space-y-6 py-4">
                                                <motion.div
                                                    animate={{ x: [0, -10, 10, -10, 10, 0] }}
                                                    transition={{ duration: 0.5, delay: 0.2 }}
                                                    className="w-24 h-24 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center relative"
                                                >
                                                    <div className="absolute inset-0 bg-rose-400/20 blur-xl rounded-full" />
                                                    <AlertCircle className="w-12 h-12 text-rose-600 dark:text-rose-400 relative" />
                                                </motion.div>

                                                <div className="space-y-2">
                                                    <h3 className="text-3xl font-serif text-zinc-900 dark:text-zinc-50">
                                                        {result.errors?.some(e => e.field === 'header') ? 'Format Mismatch' : 'Sync Failed'}
                                                    </h3>
                                                    <p className="text-rose-600/80 dark:text-rose-400/80 max-w-md mx-auto">
                                                        {result.errors?.find(e => e.field === 'header')?.message ||
                                                            "The provided data does not align with the Flowly architectural requirements."}
                                                    </p>

                                                    {result.errors?.some(e => e.field === 'header') && (
                                                        <div className="pt-2">
                                                            <Button
                                                                onClick={handleDownloadTemplate}
                                                                variant="outline"
                                                                className="text-xs h-9 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                                            >
                                                                <Download className="w-3 h-3 mr-2" />
                                                                Download Required Template
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                {result.errors && result.errors.length > 0 && !result.errors.some(e => e.field === 'header') && (
                                                    <div className="w-full max-w-md text-left max-h-48 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3 ml-1">Critical Exceptions ({result.errors.length})</p>
                                                        <div className="space-y-3">
                                                            {result.errors.slice(0, 10).map((error, idx) => (
                                                                <div key={idx} className="text-xs flex gap-3 items-start border-l-2 border-rose-500 pl-3">
                                                                    <span className="font-mono text-rose-600 dark:text-rose-400 shrink-0">L{error.row}</span>
                                                                    <div className="space-y-1">
                                                                        <p className="font-bold text-zinc-700 dark:text-zinc-300 capitalize">{error.field}</p>
                                                                        <p className="text-zinc-500 leading-relaxed">{error.message}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex gap-4 pt-4">
                                            <Button
                                                onClick={() => {
                                                    setFile(null);
                                                    setResult(null);
                                                }}
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                Import Another
                                            </Button>
                                            <Button
                                                onClick={handleClose}
                                                className="flex-1 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
                                            >
                                                Proceed to Ledger
                                            </Button>
                                        </div>
                                    </motion.div>

                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
