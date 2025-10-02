import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function ViewQuotation({ quotation, auth }) {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const { flash } = usePage().props;

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

    const handleWhatsAppShare = () => {
        const link = window.location.href;
        const message = `Hello ${quotation.customer_name},\n\nYour quotation ${quotation.quotation_number} is ready for review.\n\nTotal Amount: RM${parseFloat(quotation.total).toFixed(2)}\n\nView your quotation here:\n${link}\n\nThank you!`;

        const whatsappUrl = `https://wa.me/${quotation.customer_contact?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleCustomerApprove = () => {
        router.post(`/quotations/${quotation.access_token}/customer-approve`, {}, {
            onSuccess: () => {
                setShowApproveModal(false);
            }
        });
    };

    const handleCustomerReject = () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        router.post(`/quotations/${quotation.access_token}/customer-reject`, {
            rejection_reason: rejectionReason
        }, {
            onSuccess: () => {
                setShowRejectModal(false);
                setRejectionReason('');
            }
        });
    };

    const isAdmin = auth?.user;
    const canCustomerApprove = !isAdmin && quotation.status === 'sent' && !quotation.customer_approved_at;
    const getStatusColor = (status) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800',
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            sent: 'bg-blue-100 text-blue-800',
            accepted: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status) => {
        const labels = {
            draft: 'Draft',
            pending: 'Pending Review',
            approved: 'Approved',
            sent: 'Awaiting Customer Approval',
            accepted: 'Accepted',
            rejected: 'Rejected',
        };
        return labels[status] || status;
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
                            {isAdmin && quotation.customer_contact && (
                                <button
                                    onClick={handleWhatsAppShare}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors"
                                >
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    Send via WhatsApp
                                </button>
                            )}
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
                                        <div className="mt-2">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(quotation.status)}`}>
                                                {quotation.status === 'approved' || quotation.status === 'sent' ? (
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                                    </svg>
                                                ) : null}
                                                {getStatusLabel(quotation.status)}
                                            </span>
                                        </div>
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

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mt-8 mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg print:hidden">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-green-900 mb-2">Success!</h3>
                                <p className="text-green-700">{flash.success}</p>
                            </div>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mt-8 mb-6 p-6 bg-red-50 border-2 border-red-200 rounded-lg print:hidden">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-red-900 mb-2">Error</h3>
                                <p className="text-red-700">{flash.error}</p>
                            </div>
                        </div>
                    )}

                    {/* Status Message for Customers - Hidden when printing */}
                    {!isAdmin && quotation.status === 'pending' && (
                        <div className="mt-8 mb-6 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg print:hidden">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quotation Under Review</h3>
                                <p className="text-gray-600">
                                    Thank you for your quotation request. We are currently reviewing your request and will send you the approved quotation soon.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Customer Approval Section */}
                    {canCustomerApprove && (
                        <div className="mt-8 mb-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg print:hidden">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Review and Respond to Quotation</h3>
                                <p className="text-gray-600 mb-4">
                                    Please review the quotation details above. You can approve if everything looks correct, or request changes if needed.
                                </p>
                                {quotation.amended_at && quotation.original_values && (
                                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                        <p className="font-semibold text-yellow-800">This quotation has been updated</p>
                                        <p className="text-yellow-700">Previous total: RM{parseFloat(quotation.original_values.total).toFixed(2)}</p>
                                        <p className="text-yellow-700">New total: RM{parseFloat(quotation.total).toFixed(2)}</p>
                                    </div>
                                )}
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => setShowApproveModal(true)}
                                        className="inline-flex items-center px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                        </svg>
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => setShowRejectModal(true)}
                                        className="inline-flex items-center px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                        </svg>
                                        Request Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isAdmin && quotation.status === 'accepted' && (
                        <div className="mt-8 mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg print:hidden">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-green-900 mb-2">Quotation Approved</h3>
                                <p className="text-green-700">
                                    You have approved this quotation on {new Date(quotation.customer_approved_at).toLocaleString()}. Thank you for your business!
                                </p>
                            </div>
                        </div>
                    )}

                    {!isAdmin && quotation.status === 'rejected' && (
                        <div className="mt-8 mb-6 p-6 bg-red-50 border-2 border-red-200 rounded-lg print:hidden">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quotation Request Not Approved</h3>
                                <p className="text-gray-600">
                                    We're sorry, but we were unable to approve this quotation request at this time. Please contact us for more information.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons - Hidden when printing */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center print:hidden">
                        {isAdmin && quotation.customer_contact && (
                            <button
                                onClick={handleWhatsAppShare}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors inline-flex items-center justify-center"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                Send via WhatsApp
                            </button>
                        )}
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

            {/* Customer Approval Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Approve Quotation</h3>
                        <p className="text-gray-600 mb-4">
                            By clicking "I Approve", you confirm that you have reviewed the quotation and agree to the terms and pricing specified.
                        </p>
                        <div className="bg-gray-50 p-4 rounded mb-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="font-medium">Quotation Number:</span>
                                    <span>{quotation.quotation_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Total Amount:</span>
                                    <span className="text-green-600 font-bold">RM{parseFloat(quotation.total).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Valid Until:</span>
                                    <span>{new Date(quotation.valid_till).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowApproveModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCustomerApprove}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                            >
                                I Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Request Changes</h3>
                        <p className="text-gray-600 mb-4">
                            Please let us know what changes you would like to see in this quotation. We will review your request and get back to you.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                What would you like us to change? *
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm"
                                rows="4"
                                placeholder="Please describe the changes you need..."
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCustomerReject}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
