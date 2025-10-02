import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ShowQuotation({ quotation }) {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this quotation?')) {
            router.delete(`/quotations/${quotation.id}`);
        }
    };

    const handleApprove = () => {
        router.post(`/quotations/${quotation.id}/approve`, {
            admin_notes: adminNotes
        }, {
            onSuccess: () => {
                setShowApproveModal(false);
                setAdminNotes('');
            }
        });
    };

    const handleReject = () => {
        if (!adminNotes.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        router.post(`/quotations/${quotation.id}/reject`, {
            admin_notes: adminNotes
        }, {
            onSuccess: () => {
                setShowRejectModal(false);
                setAdminNotes('');
            }
        });
    };

    const handleSendWhatsApp = () => {
        window.location.href = `/quotations/${quotation.id}/send-whatsapp`;
    };

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
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Quotation: {quotation.quotation_number}
                    </h2>
                    <Link href="/quotations" className="text-sm text-gray-600 hover:text-gray-900">
                        Back to Quotations
                    </Link>
                </div>
            }
        >
            <Head title={`Quotation ${quotation.quotation_number}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Action Buttons */}
                            <div className="mb-6 flex flex-wrap gap-2">
                                {quotation.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => setShowApproveModal(true)}
                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => setShowRejectModal(true)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {quotation.status === 'approved' && (
                                    <button
                                        onClick={handleSendWhatsApp}
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                        </svg>
                                        Send via WhatsApp
                                    </button>
                                )}
                                <Link
                                    href={`/quotations/${quotation.id}/edit`}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                                >
                                    Edit
                                </Link>
                                <Link
                                    href={`/quotations/${quotation.access_token}/view`}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                                    target="_blank"
                                >
                                    View & Print
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md ml-auto"
                                >
                                    Delete
                                </button>
                            </div>

                            {/* Quotation Details */}
                            <div className="space-y-6">
                                {/* Header Information */}
                                <div className="border-b pb-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Quotation Number</p>
                                            <p className="font-semibold">{quotation.quotation_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(quotation.status)}`}>
                                                {getStatusLabel(quotation.status)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Valid From</p>
                                            <p className="font-semibold">{new Date(quotation.valid_from).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Valid Till</p>
                                            <p className="font-semibold">{new Date(quotation.valid_till).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Information */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="font-semibold text-lg">{quotation.customer_name}</p>
                                        {quotation.customer_address && (
                                            <p className="text-gray-700 mt-1">{quotation.customer_address}</p>
                                        )}
                                        {quotation.customer_contact && (
                                            <p className="text-gray-700 mt-1">Phone: {quotation.customer_contact}</p>
                                        )}
                                        {quotation.customer_email && (
                                            <p className="text-gray-700 mt-1">Email: {quotation.customer_email}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Items</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {quotation.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">{item.description || '-'}</td>
                                                        <td className="px-4 py-3 text-sm text-center text-gray-900">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-sm text-right text-gray-900">RM{parseFloat(item.price).toFixed(2)}</td>
                                                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">RM{parseFloat(item.total).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="flex justify-end">
                                    <div className="w-full md:w-96 bg-gray-50 p-6 rounded-lg space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span className="font-semibold">RM{parseFloat(quotation.subtotal).toFixed(2)}</span>
                                        </div>
                                        {quotation.tax > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Tax:</span>
                                                <span className="font-semibold">RM{parseFloat(quotation.tax).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-lg font-bold border-t pt-3">
                                            <span>Total:</span>
                                            <span className="text-green-600">RM{parseFloat(quotation.total).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {quotation.notes && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Notes</h3>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-700 whitespace-pre-wrap">{quotation.notes}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Admin Notes */}
                                {quotation.admin_notes && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Admin Notes</h3>
                                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                            <p className="text-gray-700 whitespace-pre-wrap">{quotation.admin_notes}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Customer Rejection Feedback */}
                                {quotation.customer_rejection_reason && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Customer Feedback</h3>
                                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                            <p className="text-sm text-gray-500 mb-2">Customer requested changes on {new Date(quotation.customer_responded_at).toLocaleString()}</p>
                                            <p className="text-gray-700 whitespace-pre-wrap">{quotation.customer_rejection_reason}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Metadata */}
                                <div className="border-t pt-4 text-sm text-gray-500">
                                    <p>Created: {new Date(quotation.created_at).toLocaleString()}</p>
                                    <p>Last Updated: {new Date(quotation.updated_at).toLocaleString()}</p>
                                    {quotation.user && <p>Created by: {quotation.user.name}</p>}
                                    {quotation.reviewed_at && quotation.reviewer && (
                                        <p>Reviewed by {quotation.reviewer.name} on {new Date(quotation.reviewed_at).toLocaleString()}</p>
                                    )}
                                    {quotation.customer_approved_at && (
                                        <p className="text-green-600 font-semibold">Customer approved on {new Date(quotation.customer_approved_at).toLocaleString()}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Approve Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Approve Quotation</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to approve this quotation? After approval, you can send it to the customer via WhatsApp.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Notes (Optional)
                            </label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm"
                                rows="3"
                                placeholder="Add any internal notes about this approval..."
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setAdminNotes('');
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Reject Quotation</h3>
                        <p className="text-gray-600 mb-4">
                            Please provide a reason for rejecting this quotation request.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Rejection *
                            </label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm"
                                rows="3"
                                placeholder="Explain why this quotation is being rejected..."
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setAdminNotes('');
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
