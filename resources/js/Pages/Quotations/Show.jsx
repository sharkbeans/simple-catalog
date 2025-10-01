import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ShowQuotation({ quotation }) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this quotation?')) {
            router.delete(`/quotations/${quotation.id}`);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800',
            sent: 'bg-blue-100 text-blue-800',
            accepted: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
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
                                <Link
                                    href={`/quotations/${quotation.id}/edit`}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                                >
                                    Edit
                                </Link>
                                <a
                                    href={`/quotations/${quotation.id}/download`}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                                    target="_blank"
                                >
                                    Download PDF
                                </a>
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
                                                {quotation.status}
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
                                            <p className="text-gray-700 mt-1">{quotation.customer_contact}</p>
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

                                {/* Metadata */}
                                <div className="border-t pt-4 text-sm text-gray-500">
                                    <p>Created: {new Date(quotation.created_at).toLocaleString()}</p>
                                    <p>Last Updated: {new Date(quotation.updated_at).toLocaleString()}</p>
                                    {quotation.user && <p>Created by: {quotation.user.name}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
