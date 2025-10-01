import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Sidebar from '@/Components/Sidebar';

export default function CreateQuotation({ cartItems = [] }) {
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_address: '',
        customer_contact: '',
        valid_from: new Date().toISOString().split('T')[0],
        valid_till: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        notes: 'This quotation is not an invoice and it is non-contractual.\nTerms and conditions apply.',
    });

    const [errors, setErrors] = useState({});
    const [taxRate, setTaxRate] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        // Try to get cart items from session storage first
        const storedItems = sessionStorage.getItem('quotation_items');
        let parsedCartItems = cartItems;

        if (storedItems) {
            try {
                parsedCartItems = JSON.parse(storedItems);
                // Clear from session storage after retrieval
                sessionStorage.removeItem('quotation_items');
            } catch (e) {
                console.error('Failed to parse stored cart items:', e);
            }
        } else if (typeof cartItems === 'string') {
            try {
                parsedCartItems = JSON.parse(cartItems);
            } catch (e) {
                console.error('Failed to parse cart items:', e);
                parsedCartItems = [];
            }
        }

        if (parsedCartItems && parsedCartItems.length > 0) {
            const items = parsedCartItems.map(item => ({
                name: item.name,
                description: item.product_code || '',
                quantity: item.quantity,
                price: parseFloat(item.price),
                total: parseFloat(item.price) * item.quantity
            }));

            const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);

            setFormData(prev => ({
                ...prev,
                items,
                subtotal: subtotal.toFixed(2),
                tax: 0,
                total: subtotal.toFixed(2)
            }));
        }
    }, []);

    const calculateTotals = (newTaxRate) => {
        const subtotal = formData.items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
        const tax = subtotal * (parseFloat(newTaxRate) / 100);
        const total = subtotal + tax;

        setFormData(prev => ({
            ...prev,
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
            total: total.toFixed(2)
        }));
    };

    const handleTaxChange = (e) => {
        const newTaxRate = parseFloat(e.target.value) || 0;
        setTaxRate(newTaxRate);
        calculateTotals(newTaxRate);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.items.length === 0) {
            alert('Cannot create quotation without items. Please add items to your cart first.');
            return;
        }

        router.post('/quotations', formData, {
            onError: (errors) => setErrors(errors),
            onSuccess: () => setErrors({})
        });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Head title="Create Quotation" />

            {/* Navigation */}
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center min-w-0 flex-1">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="mr-2 sm:mr-4 text-gray-600 hover:text-gray-800 focus:outline-none flex-shrink-0"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <Link href="/" className="flex-shrink-0">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                            </Link>
                            <h1 className="ml-2 sm:ml-4 text-lg sm:text-xl font-semibold text-gray-900 truncate">Create Quotation</h1>
                        </div>
                        <div className="flex items-center ml-2">
                            <Link
                                href="/cart"
                                className="text-gray-600 hover:text-gray-900 text-sm sm:text-base px-3 py-2 rounded-md transition-colors"
                            >
                                <span className="hidden sm:inline">Back to Cart</span>
                                <span className="sm:hidden">Cart</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6">
                            {/* Customer Information */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Customer Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.customer_name}
                                            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                            required
                                        />
                                        {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.customer_contact}
                                            onChange={(e) => setFormData({ ...formData, customer_contact: e.target.value })}
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Address
                                        </label>
                                        <textarea
                                            value={formData.customer_address}
                                            onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                            rows="3"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Validity Dates */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4">Validity Period</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Valid From *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.valid_from}
                                            onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                            required
                                        />
                                        {errors.valid_from && <p className="text-red-500 text-xs mt-1">{errors.valid_from}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Valid Till *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.valid_till}
                                            onChange={(e) => setFormData({ ...formData, valid_till: e.target.value })}
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                            required
                                        />
                                        {errors.valid_till && <p className="text-red-500 text-xs mt-1">{errors.valid_till}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Items Display (Read-only) */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4">Items from Cart</h3>

                                {formData.items.length === 0 ? (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                                        <p className="text-yellow-800 mb-4">No items in this quotation.</p>
                                        <p className="text-sm text-yellow-600 mb-4">
                                            To create a quotation, please add items to your cart first.
                                        </p>
                                        <Link
                                            href="/cart"
                                            className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Go to Cart
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {formData.items.map((item, index) => (
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
                                )}
                            </div>

                            {/* Totals */}
                            {formData.items.length > 0 && (
                                <div className="mb-8">
                                    <div className="max-w-md ml-auto bg-gray-50 p-6 rounded-lg">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span>Subtotal:</span>
                                                <span className="font-semibold">RM{formData.subtotal}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>Tax (%):</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={taxRate}
                                                    onChange={handleTaxChange}
                                                    className="w-20 border-gray-300 rounded-md shadow-sm text-sm"
                                                />
                                            </div>
                                            {formData.tax > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span>Tax Amount:</span>
                                                    <span>RM{formData.tax}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between border-t pt-2">
                                                <span className="font-bold">Total:</span>
                                                <span className="font-bold text-lg text-green-600">RM{formData.total}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4">Notes</h3>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full border-gray-300 rounded-md shadow-sm"
                                    rows="4"
                                    placeholder="Additional notes, terms & conditions..."
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-4">
                                <Link
                                    href="/cart"
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={formData.items.length === 0}
                                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create Quotation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
