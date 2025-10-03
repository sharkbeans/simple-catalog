import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function EditQuotation({ quotation }) {
    const { flash } = usePage().props;
    const [formData, setFormData] = useState({
        customer_name: quotation.customer_name || '',
        customer_company: quotation.customer_company || '',
        customer_address: quotation.customer_address || '',
        delivery_address: quotation.delivery_address || '',
        customer_contact: quotation.customer_contact || '',
        customer_email: quotation.customer_email || '',
        valid_from: quotation.valid_from ? new Date(quotation.valid_from).toISOString().split('T')[0] : '',
        valid_till: quotation.valid_till ? new Date(quotation.valid_till).toISOString().split('T')[0] : '',
        items: quotation.items || [],
        subtotal: quotation.subtotal || 0,
        tax: quotation.tax || 0,
        discount_type: quotation.discount_type || '',
        discount_value: quotation.discount_value || 0,
        discount_amount: quotation.discount_amount || 0,
        shipping_charges: quotation.shipping_charges || 0,
        handling_charges: quotation.handling_charges || 0,
        total: quotation.total || 0,
        notes: quotation.notes || '',
        admin_notes: quotation.admin_notes || '',
        status: quotation.status || 'draft',
        priority: quotation.priority || 'medium',
    });

    const [errors, setErrors] = useState({});
    const [taxRate, setTaxRate] = useState(0);

    useEffect(() => {
        // Calculate tax rate from existing data
        if (formData.subtotal > 0 && formData.tax > 0) {
            const rate = (parseFloat(formData.tax) / parseFloat(formData.subtotal)) * 100;
            setTaxRate(rate.toFixed(2));
        }
    }, []);

    // Handle WhatsApp redirect after update
    useEffect(() => {
        if (flash?.whatsappUrl) {
            // Open WhatsApp in a new window
            window.open(flash.whatsappUrl, '_blank');
        }
    }, [flash]);

    const calculateTotals = (currentTaxRate) => {
        const subtotal = formData.items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);

        // Calculate discount
        let discountAmount = 0;
        if (formData.discount_type === 'percentage') {
            discountAmount = subtotal * (parseFloat(formData.discount_value) / 100);
        } else if (formData.discount_type === 'fixed') {
            discountAmount = parseFloat(formData.discount_value);
        }

        const subtotalAfterDiscount = subtotal - discountAmount;
        const tax = subtotalAfterDiscount * (parseFloat(currentTaxRate) / 100);
        const shipping = parseFloat(formData.shipping_charges) || 0;
        const handling = parseFloat(formData.handling_charges) || 0;
        const total = subtotalAfterDiscount + tax + shipping + handling;

        setFormData(prev => ({
            ...prev,
            subtotal: subtotal.toFixed(2),
            discount_amount: discountAmount.toFixed(2),
            tax: tax.toFixed(2),
            total: total.toFixed(2)
        }));
    };

    const handleTaxChange = (e) => {
        const newTaxRate = parseFloat(e.target.value) || 0;
        setTaxRate(newTaxRate);
        calculateTotals(newTaxRate);
    };

    const handleDiscountChange = (type, value) => {
        const newFormData = { ...formData };
        if (type) newFormData.discount_type = type;
        if (value !== undefined) newFormData.discount_value = value;
        setFormData(newFormData);

        setTimeout(() => calculateTotals(taxRate), 0);
    };

    const handleChargeChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setTimeout(() => calculateTotals(taxRate), 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.items.length === 0) {
            alert('Cannot save quotation without items.');
            return;
        }

        router.put(`/quotations/${quotation.id}`, formData, {
            onError: (errors) => setErrors(errors),
            onSuccess: () => setErrors({})
        });
    };

    const handleUpdateAndSend = (e) => {
        e.preventDefault();

        if (formData.items.length === 0) {
            alert('Cannot save quotation without items.');
            return;
        }

        if (!formData.customer_contact) {
            alert('Customer contact number is required to send via WhatsApp.');
            return;
        }

        if (confirm('Update this quotation and send it to the customer via WhatsApp?')) {
            // Use visit with method PUT to allow external redirects
            router.visit(`/quotations/${quotation.id}/update-and-send`, {
                method: 'put',
                data: formData,
                onError: (errors) => setErrors(errors),
                preserveState: false,
                preserveScroll: false,
            });
        }
    };

    const addItem = () => {
        const newItem = {
            name: '',
            description: '',
            quantity: 1,
            price: 0,
            total: 0
        };
        setFormData({ ...formData, items: [...formData.items, newItem] });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
        setTimeout(() => calculateTotals(taxRate), 0);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        if (field === 'quantity' || field === 'price') {
            const qty = parseInt(newItems[index].quantity) || 0;
            const price = parseFloat(newItems[index].price) || 0;
            newItems[index].total = (qty * price).toFixed(2);
        }

        setFormData({ ...formData, items: newItems });
        setTimeout(() => calculateTotals(taxRate), 0);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Edit Quotation: {quotation.quotation_number}
                    </h2>
                    <Link href="/quotations" className="text-sm text-gray-600 hover:text-gray-900">
                        Back to Quotations
                    </Link>
                </div>
            }
        >
            <Head title={`Edit Quotation ${quotation.quotation_number}`} />

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
                                            Company Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.customer_company}
                                            onChange={(e) => setFormData({ ...formData, customer_company: e.target.value })}
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Number
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.customer_contact}
                                            onChange={(e) => setFormData({ ...formData, customer_contact: e.target.value })}
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.customer_email}
                                            onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Billing Address
                                        </label>
                                        <textarea
                                            value={formData.customer_address}
                                            onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                            rows="2"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Delivery Address
                                        </label>
                                        <textarea
                                            value={formData.delivery_address}
                                            onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                            rows="2"
                                            placeholder="Leave blank if same as billing address"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Validity Dates and Status */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4">Validity Period, Status & Priority</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="pending">Pending Review</option>
                                            <option value="approved">Approved</option>
                                            <option value="sent">Awaiting Customer Approval</option>
                                            <option value="accepted">Accepted</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Priority
                                        </label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Items Editor */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Quotation Items</h3>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
                                    >
                                        + Add Item
                                    </button>
                                </div>

                                {formData.items.length === 0 ? (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                                        <p className="text-yellow-800 mb-4">No items in this quotation.</p>
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Add First Item
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {formData.items.map((item, index) => (
                                            <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                                                    <div className="md:col-span-4">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Item Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                                            placeholder="Product name"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="md:col-span-3">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Description/Code
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={item.description || ''}
                                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                                            placeholder="Product code"
                                                        />
                                                    </div>

                                                    <div className="md:col-span-1">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Qty *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Price (RM) *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.price}
                                                            onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="md:col-span-1">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Total
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={`RM${parseFloat(item.total || 0).toFixed(2)}`}
                                                            disabled
                                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm bg-gray-100 font-semibold"
                                                        />
                                                    </div>

                                                    <div className="md:col-span-1 flex items-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="w-full bg-red-500 hover:bg-red-600 text-white px-2 py-2 rounded-md text-sm"
                                                            title="Remove item"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Totals and Charges */}
                            {formData.items.length > 0 && (
                                <div className="mb-8">
                                    <div className="max-w-md ml-auto bg-gray-50 p-6 rounded-lg space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span>Subtotal:</span>
                                                <span className="font-semibold">RM{formData.subtotal}</span>
                                            </div>

                                            {/* Discount */}
                                            <div className="border-t pt-2">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium">Discount:</span>
                                                    <select
                                                        value={formData.discount_type}
                                                        onChange={(e) => handleDiscountChange(e.target.value, formData.discount_value)}
                                                        className="w-32 border-gray-300 rounded-md shadow-sm text-sm"
                                                    >
                                                        <option value="">No Discount</option>
                                                        <option value="percentage">Percentage</option>
                                                        <option value="fixed">Fixed Amount</option>
                                                    </select>
                                                </div>
                                                {formData.discount_type && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm">
                                                            {formData.discount_type === 'percentage' ? 'Percentage:' : 'Amount:'}
                                                        </span>
                                                        <div className="flex items-center">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={formData.discount_value}
                                                                onChange={(e) => handleDiscountChange(formData.discount_type, parseFloat(e.target.value) || 0)}
                                                                className="w-24 border-gray-300 rounded-md shadow-sm text-sm"
                                                            />
                                                            <span className="ml-2 text-sm">{formData.discount_type === 'percentage' ? '%' : 'RM'}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {formData.discount_amount > 0 && (
                                                    <div className="flex justify-between text-sm text-green-600">
                                                        <span>Discount Amount:</span>
                                                        <span>-RM{formData.discount_amount}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Tax */}
                                            <div className="border-t pt-2">
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
                                            </div>

                                            {/* Additional Charges */}
                                            <div className="border-t pt-2">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span>Shipping Charges:</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={formData.shipping_charges}
                                                        onChange={(e) => handleChargeChange('shipping_charges', parseFloat(e.target.value) || 0)}
                                                        className="w-24 border-gray-300 rounded-md shadow-sm text-sm"
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span>Handling Charges:</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={formData.handling_charges}
                                                        onChange={(e) => handleChargeChange('handling_charges', parseFloat(e.target.value) || 0)}
                                                        className="w-24 border-gray-300 rounded-md shadow-sm text-sm"
                                                    />
                                                </div>
                                            </div>

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

                            {/* Admin Notes */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4">Admin Notes (Internal)</h3>
                                <textarea
                                    value={formData.admin_notes}
                                    onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                                    className="w-full border-gray-300 rounded-md shadow-sm"
                                    rows="3"
                                    placeholder="Internal notes for admin review (not visible to customers)..."
                                />
                            </div>

                            {/* Submit Buttons */}
                            <div className="border-t pt-6">
                                {(['approved', 'sent', 'accepted'].includes(quotation.status)) ? (
                                    <>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                            <p className="text-sm text-blue-800">
                                                <strong>Important:</strong> This quotation has been sent to the customer. Any changes must be sent to the customer for approval.
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <Link
                                                href={`/quotations/${quotation.id}`}
                                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={handleUpdateAndSend}
                                                disabled={formData.items.length === 0 || !formData.customer_contact}
                                                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center text-base font-semibold"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                </svg>
                                                Send Amended Quotation via WhatsApp
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-end space-x-4">
                                        <Link
                                            href={`/quotations/${quotation.id}`}
                                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </Link>
                                        <button
                                            type="submit"
                                            disabled={formData.items.length === 0}
                                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Update Quotation
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
