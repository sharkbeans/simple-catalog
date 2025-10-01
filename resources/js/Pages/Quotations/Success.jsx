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

                            {/* View Quotation Button */}
                            <div className="mb-6">
                                <Link
                                    href={`/quotations/${quotation.access_token}/view`}
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
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                    View & Print Quotation
                                </Link>
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
                                    <strong>Note:</strong> You can view and print your quotation using your browser's print function (Ctrl+P or Cmd+P).
                                    Contact us if you need any modifications to this quotation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
