import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function QuotationSuccess({ quotation, message }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="Quotation Request Submitted" />

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
                                Quotation Request Submitted!
                            </h1>

                            <p className="text-lg text-gray-600 mb-2">
                                Your quotation request <span className="font-semibold text-gray-900">{quotation.quotation_number}</span> has been submitted successfully.
                            </p>

                            <p className="text-md text-gray-500 mb-8">
                                {message || 'We will review your request and send you the approved quotation soon.'}
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

                            {/* Info Box */}
                            <div className="mb-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                <div className="flex items-start">
                                    <svg className="w-6 h-6 text-blue-500 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                    </svg>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
                                        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                                            <li>Our team will review your quotation request</li>
                                            <li>You'll receive the approved quotation via WhatsApp{quotation.customer_email ? ' or email' : ''}</li>
                                            <li>The quotation will include a link to view and download the PDF</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* View Request Button */}
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
                                    View Your Request
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

                            {/* Contact Note */}
                            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    <strong>Need changes?</strong> Contact us if you need any modifications to your quotation request.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
