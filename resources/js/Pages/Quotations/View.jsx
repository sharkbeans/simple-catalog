import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function ViewQuotation({ quotation }) {
    const handlePrint = () => {
        window.print();
    };

    const handleCopyLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link).then(() => {
            alert('Quotation link copied to clipboard!');
        }).catch(() => {
            alert('Failed to copy link');
        });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title={`Quotation ${quotation.quotation_number}`} />

            {/* Navigation - Hidden when printing */}
            <nav className="border-b border-gray-100 bg-white print:hidden">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center">
                            <Link href="/">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                            </Link>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleCopyLink}
                                className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition-colors"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                </svg>
                                Copy Link
                            </button>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-colors"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                    />
                                </svg>
                                Print / Save as PDF
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="py-12 print:py-0">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 print:max-w-full print:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg print:shadow-none print:rounded-none">
                        <div className="p-8 print:p-0">
                            {/* Company Header */}
                            <div className="border-b pb-6 mb-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">{window.APP_NAME || 'Simple Catalog'}</h1>
                                        <p className="text-gray-600 mt-1">Your Company Address</p>
                                        <p className="text-gray-600">Phone: xxx-xxx-xxx</p>
                                        <p className="text-gray-600">info@example.com</p>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-2xl font-bold text-gray-900">QUOTATION</h2>
                                        <p className="text-lg font-semibold text-gray-700 mt-2">{quotation.quotation_number}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quotation Info */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Customer Information</h3>
                                    <div className="bg-gray-50 p-4 rounded print:bg-transparent print:p-0">
                                        <p className="font-semibold text-lg">{quotation.customer_name}</p>
                                        {quotation.customer_address && (
                                            <p className="text-gray-700 mt-1">{quotation.customer_address}</p>
                                        )}
                                        {quotation.customer_contact && (
                                            <p className="text-gray-700 mt-1">{quotation.customer_contact}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Quotation Details</h3>
                                    <div className="bg-gray-50 p-4 rounded print:bg-transparent print:p-0">
                                        <div className="space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Valid From:</span>
                                                <span className="font-semibold">{new Date(quotation.valid_from).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Valid Till:</span>
                                                <span className="font-semibold">{new Date(quotation.valid_till).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="mb-6">
                                <table className="min-w-full divide-y divide-gray-200 border">
                                    <thead className="bg-gray-50 print:bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r">Item</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r">Description</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r">Qty</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase border-r">Unit Price</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {quotation.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r">{item.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500 border-r">{item.description || '-'}</td>
                                                <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{item.quantity}</td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900 border-r">RM{parseFloat(item.price).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">RM{parseFloat(item.total).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="flex justify-end mb-6">
                                <div className="w-full md:w-96 space-y-2">
                                    <div className="flex justify-between text-sm py-2 border-b">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-semibold">RM{parseFloat(quotation.subtotal).toFixed(2)}</span>
                                    </div>
                                    {quotation.tax > 0 && (
                                        <div className="flex justify-between text-sm py-2 border-b">
                                            <span className="text-gray-600">Tax:</span>
                                            <span className="font-semibold">RM{parseFloat(quotation.tax).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold py-3 bg-gray-50 px-4 rounded print:bg-transparent">
                                        <span>Total:</span>
                                        <span className="text-green-600">RM{parseFloat(quotation.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {quotation.notes && (
                                <div className="border-t pt-6">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notes</h3>
                                    <div className="bg-gray-50 p-4 rounded print:bg-transparent print:p-0">
                                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{quotation.notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
                                <p>Thank you for your business!</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Hidden when printing */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center print:hidden">
                        <button
                            onClick={handleCopyLink}
                            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors inline-flex items-center justify-center"
                        >
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                            </svg>
                            Copy Quotation Link
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors inline-flex items-center justify-center"
                        >
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                />
                            </svg>
                            Print / Save as PDF
                        </button>
                        <Link
                            href="/"
                            className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-md transition-colors text-center"
                        >
                            Back to Catalog
                        </Link>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body {
                        background: white;
                    }
                    @page {
                        margin: 2cm;
                    }
                }
            `}</style>
        </div>
    );
}
