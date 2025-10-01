import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function QuotationSuccess({ quotation }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="Quotation Created Successfully" />

            {/* Navigation */}
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center">
                            <Link href="/">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-center">
                            {/* Success Icon */}
                            <div className="mb-6">
                                <svg
                                    className="w-20 h-20 mx-auto text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>

                            {/* Success Message */}
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                Quotation Created Successfully!
                            </h1>

                            <p className="text-lg text-gray-600 mb-8">
                                Your quotation <span className="font-semibold text-gray-900">{quotation.quotation_number}</span> has been created.
                            </p>

                            {/* Quotation Details */}
                            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                                <h3 className="text-lg font-semibold mb-4">Quotation Details</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Quotation Number:</span>
                                        <span className="font-semibold">{quotation.quotation_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Customer Name:</span>
                                        <span className="font-semibold">{quotation.customer_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Valid From:</span>
                                        <span className="font-semibold">{quotation.valid_from}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Valid Till:</span>
                                        <span className="font-semibold">{quotation.valid_till}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 mt-2">
                                        <span className="text-gray-600">Total Amount:</span>
                                        <span className="font-bold text-lg text-green-600">RM{parseFloat(quotation.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Download Button */}
                            <div className="mb-6">
                                <a
                                    href={`/quotations/${quotation.id}/download`}
                                    className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-colors"
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
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    Download PDF
                                </a>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/cart"
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Back to Cart
                                </Link>
                                <Link
                                    href="/"
                                    className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-md transition-colors"
                                >
                                    Back to Catalog
                                </Link>
                            </div>

                            {/* Info Note */}
                            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> Please download your quotation PDF now.
                                    You can also contact us if you need any modifications to this quotation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
