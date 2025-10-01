import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Spreadsheet({ auth, lastEditTime: initialLastEditTime }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [editingRows, setEditingRows] = useState(new Set());
    const [newProduct, setNewProduct] = useState({
        product_code: '',
        name: '',
        description: '',
        price: '',
        quantity: '',
        image_url: '',
    });
    const [newProductImage, setNewProductImage] = useState(null);
    const [editProductImages, setEditProductImages] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [errors, setErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const [lastEditTime, setLastEditTime] = useState(initialLastEditTime ? new Date(initialLastEditTime) : null);
    const [showLowStock, setShowLowStock] = useState(false);
    const [showNoStock, setShowNoStock] = useState(false);
    const [showHiddenStock, setShowHiddenStock] = useState(false);
    const [hideHiddenProducts, setHideHiddenProducts] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [showCsvImport, setShowCsvImport] = useState(false);
    const [csvImporting, setCsvImporting] = useState(false);
    const [csvImportResult, setCsvImportResult] = useState(null);

    const formatGMT8Time = (date) => {
        const options = {
            timeZone: 'Asia/Singapore', // GMT+8
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        return new Intl.DateTimeFormat('en-GB', options).format(date);
    };

    useEffect(() => {
        fetchProducts();
    }, [sortBy, sortDirection]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            params.append('sort', sortBy);
            params.append('direction', sortDirection);
            
            const response = await fetch(`/api/products?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            } else {
                setError('Failed to fetch products');
            }
        } catch (err) {
            setError('An error occurred while fetching products');
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (productId) => {
        setEditingRows(prev => new Set([...prev, productId]));
    };

    const cancelEdit = (productId) => {
        setEditingRows(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
        });
        // Reset product data to original values
        fetchProducts();
    };

    const saveEdit = async (productId) => {
        const product = products.find(p => p.id === productId);
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            // Use FormData for file upload
            const formData = new FormData();
            formData.append('product_code', product.product_code);
            formData.append('name', product.name);
            formData.append('description', product.description || '');
            formData.append('price', parseFloat(product.price));
            formData.append('quantity', parseInt(product.quantity));
            formData.append('_method', 'PUT'); // Laravel method spoofing
            
            if (editProductImages[productId]) {
                formData.append('image', editProductImages[productId]);
            }

            const response = await fetch(`/api/products/${productId}`, {
                method: 'POST', // Using POST with method spoofing for file upload
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'X-CSRF-TOKEN': token
                },
                body: formData
            });

            if (response.ok) {
                const updatedProduct = await response.json();
                setProducts(products.map(p =>
                    p.id === productId ? updatedProduct : p
                ));
                setEditingRows(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(productId);
                    return newSet;
                });
                // Clear the edit image for this product
                setEditProductImages(prev => {
                    const newImages = { ...prev };
                    delete newImages[productId];
                    return newImages;
                });
                setLastEditTime(new Date(updatedProduct.updated_at));
                setSuccess('Product updated successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Failed to update product');
            }
        } catch (err) {
            setError('An error occurred while updating the product');
        }
    };

    const toggleVisibility = async (productId) => {
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch(`/api/products/${productId}/toggle-visibility`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token
                }
            });

            if (response.ok) {
                const updatedProduct = await response.json();
                setProducts(products.map(p =>
                    p.id === productId ? updatedProduct : p
                ));
                setLastEditTime(new Date(updatedProduct.updated_at));
                setSuccess(`Product ${updatedProduct.is_hidden ? 'hidden from' : 'shown in'} catalog!`);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Failed to toggle product visibility');
            }
        } catch (err) {
            setError('An error occurred while toggling product visibility');
        }
    };

    const deleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token
                }
            });

            if (response.ok) {
                const remainingProducts = products.filter(product => product.id !== productId);
                setProducts(remainingProducts);
                // Find the most recently updated product from remaining products
                const mostRecent = remainingProducts.reduce((latest, product) => {
                    const productDate = new Date(product.updated_at);
                    return !latest || productDate > latest ? productDate : latest;
                }, null);
                setLastEditTime(mostRecent);
                setSuccess('Product deleted successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Failed to delete product');
            }
        } catch (err) {
            setError('An error occurred while deleting the product');
        }
    };

    const handleProductChange = (productId, field, value) => {
        setProducts(products.map(product => 
            product.id === productId 
                ? { ...product, [field]: value }
                : product
        ));
    };

    const handleNewProductChange = (field, value) => {
        setNewProduct(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear errors for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleNewProductImageChange = (e) => {
        const file = e.target.files[0];
        setNewProductImage(file);
    };

    const handleEditProductImageChange = (productId, e) => {
        const file = e.target.files[0];
        setEditProductImages(prev => ({
            ...prev,
            [productId]: file
        }));
    };

    const handleSearch = () => {
        fetchProducts();
    };

    const handleCsvFileChange = (e) => {
        const file = e.target.files[0];
        setCsvFile(file);
        setCsvImportResult(null);
    };

    const handleCsvImport = async (e) => {
        e.preventDefault();
        if (!csvFile) {
            alert('Please select a CSV file');
            return;
        }

        setCsvImporting(true);
        setCsvImportResult(null);
        setErrors({});

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const formData = new FormData();
            formData.append('csv_file', csvFile);

            const response = await fetch('/api/products/import/csv', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'X-CSRF-TOKEN': token
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                setCsvImportResult({
                    success: true,
                    message: result.message,
                    imported: result.imported,
                    skipped: result.skipped,
                    errors: result.errors
                });
                setSuccess(`CSV import completed! Imported: ${result.imported}, Skipped: ${result.skipped}`);
                setCsvFile(null);
                // Reset file input
                const fileInput = document.querySelector('input[type="file"][accept=".csv"]');
                if (fileInput) fileInput.value = '';
                // Refresh products list
                fetchProducts();
            } else {
                setCsvImportResult({
                    success: false,
                    message: result.message || 'Import failed',
                    errors: result.errors
                });
                setErrors(result.errors || {});
            }
        } catch (err) {
            setCsvImportResult({
                success: false,
                message: 'An error occurred during import',
                errors: {}
            });
            setError('An error occurred during CSV import');
        } finally {
            setCsvImporting(false);
        }
    };

    const addNewProduct = async (e) => {
        e.preventDefault();
        setErrors({});

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            // Use FormData for file upload
            const formData = new FormData();
            formData.append('product_code', newProduct.product_code);
            formData.append('name', newProduct.name);
            formData.append('description', newProduct.description || '');
            formData.append('price', parseFloat(newProduct.price));
            formData.append('quantity', parseInt(newProduct.quantity));
            
            if (newProductImage) {
                formData.append('image', newProductImage);
            }

            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'X-CSRF-TOKEN': token
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                setProducts([result, ...products]); // Add to beginning for newest first
                setNewProduct({ product_code: '', name: '', description: '', price: '', quantity: '', image_url: '' });
                setNewProductImage(null);
                setShowAddForm(false);
                setLastEditTime(new Date(result.updated_at));
                setSuccess('Product added successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                if (result.errors) {
                    setErrors(result.errors);
                } else {
                    setError('Failed to create product');
                }
            }
        } catch (err) {
            setError('An error occurred while creating the product');
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Product Spreadsheet</h2>}
            >
                <Head title="Spreadsheet" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Admin - Product Management</h2>
                    <div className="flex space-x-4">
                        <Link
                            href="/catalogue"
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Back to Catalogue
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Spreadsheet" />

            {/* Top Right Notifications */}
            {success && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg max-w-md">
                        <div className="flex items-center">
                            <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{success}</span>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg max-w-md">
                        <div className="flex items-center">
                            <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{error}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Add New Product Form */}
                    {showAddForm && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Product</h3>
                                <form onSubmit={addNewProduct} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <input
                                                type="text"
                                                value={newProduct.product_code}
                                                onChange={(e) => handleNewProductChange('product_code', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded"
                                                placeholder="Product Code (e.g., STP-001)"
                                                required
                                            />
                                            {errors.product_code && <p className="text-red-500 text-sm mt-1">{errors.product_code[0]}</p>}
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                value={newProduct.name}
                                                onChange={(e) => handleNewProductChange('name', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded"
                                                placeholder="Product Name"
                                                required
                                            />
                                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <input
                                                type="number"
                                                value={newProduct.price}
                                                onChange={(e) => handleNewProductChange('price', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded"
                                                placeholder="Price"
                                                step="0.01"
                                                min="0"
                                                required
                                            />
                                            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price[0]}</p>}
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                value={newProduct.quantity}
                                                onChange={(e) => handleNewProductChange('quantity', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded"
                                                placeholder="Quantity"
                                                min="0"
                                                required
                                            />
                                            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity[0]}</p>}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <textarea
                                            value={newProduct.description}
                                            onChange={(e) => handleNewProductChange('description', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded"
                                            placeholder="Product Description (optional)"
                                            rows="3"
                                        />
                                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description[0]}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Product Image
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleNewProductImageChange}
                                            className="w-full p-2 border border-gray-300 rounded"
                                        />
                                        {newProductImage && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                Selected: {newProductImage.name}
                                            </p>
                                        )}
                                        {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image[0]}</p>}
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddForm(false)}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                        >
                                            Cancel
                                        </button>
                                        <PrimaryButton type="submit">
                                            Add Product
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Search and Sort Controls */}
                    {!showAddForm && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                                    {/* Search Bar */}
                                    <div className="flex-1 flex">
                                        <input
                                            type="text"
                                            placeholder="Search products by name, price, or quantity..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button
                                            onClick={handleSearch}
                                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white border border-blue-500 rounded-r-lg focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            Search
                                        </button>
                                    </div>
                                    
                                    {/* Sort Controls */}
                                    <div className="flex space-x-3">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="created_at">Date Added</option>
                                            <option value="name">Name</option>
                                            <option value="price">Price</option>
                                            <option value="quantity">Quantity</option>
                                        </select>
                                        
                                        <select
                                            value={sortDirection}
                                            onChange={(e) => setSortDirection(e.target.value)}
                                            className="w-36 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="desc">High to Low</option>
                                            <option value="asc">Low to High</option>
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Results Summary */}
                                <div className="mt-4 text-sm text-gray-600">
                                    {(() => {
                                        const filteredCount = products.filter(product => {
                                            if (hideHiddenProducts && product.is_hidden) return false;
                                            if (showHiddenStock && !product.is_hidden) return false;
                                            if (showLowStock && product.quantity > 10) return false;
                                            if (showNoStock && product.quantity !== 0) return false;
                                            return true;
                                        }).length;

                                        if (searchTerm) {
                                            return <span>Found {filteredCount} of {products.length} product(s) matching "{searchTerm}"</span>;
                                        } else if (showLowStock || showNoStock || showHiddenStock || hideHiddenProducts) {
                                            return <span>Showing {filteredCount} of {products.length} product(s)</span>;
                                        } else {
                                            return <span>Showing {products.length} product(s)</span>;
                                        }
                                    })()}
                                </div>

                                {/* Filter Checkboxes */}
                                <div className="mt-4 flex flex-wrap gap-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showLowStock}
                                            onChange={(e) => setShowLowStock(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Show Low Stock (≤10)</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showNoStock}
                                            onChange={(e) => setShowNoStock(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Show No Stock (0)</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showHiddenStock}
                                            onChange={(e) => {
                                                setShowHiddenStock(e.target.checked);
                                                if (e.target.checked) setHideHiddenProducts(false);
                                            }}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Show Only Hidden Products</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={hideHiddenProducts}
                                            onChange={(e) => {
                                                setHideHiddenProducts(e.target.checked);
                                                if (e.target.checked) setShowHiddenStock(false);
                                            }}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Hide Hidden Products</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CSV Import Section */}
                    {showCsvImport && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Import Products from CSV</h3>
                                    <button
                                        onClick={() => {
                                            setShowCsvImport(false);
                                            setCsvImportResult(null);
                                            setCsvFile(null);
                                        }}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements:</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Required columns: <code className="bg-white px-1 rounded">product_code</code>, <code className="bg-white px-1 rounded">name</code>, <code className="bg-white px-1 rounded">price</code>, <code className="bg-white px-1 rounded">quantity</code></li>
                                        <li>• Optional columns: <code className="bg-white px-1 rounded">description</code>, <code className="bg-white px-1 rounded">image_url</code></li>
                                        <li>• The <code className="bg-white px-1 rounded">id</code> column will be ignored - IDs are assigned by the server</li>
                                        <li>• Existing products (matching product_code) will be updated</li>
                                        <li>• New products will be created automatically</li>
                                    </ul>
                                </div>

                                <form onSubmit={handleCsvImport}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select CSV File
                                        </label>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleCsvFileChange}
                                            className="w-full p-2 border border-gray-300 rounded"
                                            required
                                        />
                                        {errors.csv_file && (
                                            <p className="text-red-500 text-sm mt-1">{errors.csv_file[0]}</p>
                                        )}
                                    </div>

                                    {csvImportResult && (
                                        <div className={`mb-4 p-4 rounded-lg ${csvImportResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                            <p className={`font-medium ${csvImportResult.success ? 'text-green-900' : 'text-red-900'}`}>
                                                {csvImportResult.message}
                                            </p>
                                            {csvImportResult.errors && csvImportResult.errors.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-sm font-medium text-red-800">Errors:</p>
                                                    <ul className="text-sm text-red-700 mt-1 space-y-1">
                                                        {csvImportResult.errors.map((error, index) => (
                                                            <li key={index}>• {error}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCsvImport(false);
                                                setCsvImportResult(null);
                                                setCsvFile(null);
                                            }}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                        >
                                            Cancel
                                        </button>
                                        <PrimaryButton type="submit" disabled={csvImporting}>
                                            {csvImporting ? 'Importing...' : 'Import CSV'}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Products Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Header with Add Product Button */}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Products</h3>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setShowCsvImport(!showCsvImport);
                                            setShowAddForm(false);
                                        }}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        {showCsvImport ? 'Cancel' : 'Import CSV'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddForm(!showAddForm);
                                            setShowCsvImport(false);
                                        }}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        {showAddForm ? 'Cancel' : 'Add Product'}
                                    </button>
                                </div>
                            </div>

                            {/* Last Edit Timestamp */}
                            {lastEditTime && (
                                <Link href="/audit-logs">
                                    <div className="mb-4 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                        <span className="font-medium">Last edit:</span> {formatGMT8Time(lastEditTime)}
                                    </div>
                                </Link>
                            )}
                            
                            {(() => {
                                // Apply filters
                                const filteredProducts = products.filter(product => {
                                    // Hide hidden products takes priority
                                    if (hideHiddenProducts && product.is_hidden) return false;

                                    // Show only hidden products
                                    if (showHiddenStock && !product.is_hidden) return false;

                                    // Stock filters
                                    if (showLowStock && product.quantity > 10) return false;
                                    if (showNoStock && product.quantity !== 0) return false;

                                    return true;
                                });

                                return filteredProducts.length === 0 ? (
                                    <div className="text-center py-8">
                                        <h3 className="text-lg font-medium mb-4">No products found</h3>
                                        <p className="text-gray-600 mb-6">
                                            {products.length === 0
                                                ? 'Start building your product catalog by adding your first product.'
                                                : 'No products match the selected filters.'}
                                        </p>
                                        {products.length === 0 && (
                                            <button
                                                onClick={() => setShowAddForm(true)}
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
                                            >
                                                Add Your First Product
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full table-fixed">
                                        <colgroup>
                                            <col className="w-16" />
                                            <col className="w-32" />
                                            <col className="w-40" />
                                            <col className="w-64" />
                                            <col className="w-24" />
                                            <col className="w-24" />
                                            <col className="w-32" />
                                            <col className="w-40" />
                                        </colgroup>
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Code</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredProducts.map((product) => (
                                                <tr key={product.id} className={`hover:bg-gray-50 ${product.is_hidden ? 'bg-gray-100' : ''}`}>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {product.id}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        {editingRows.has(product.id) ? (
                                                            <input
                                                                type="text"
                                                                value={product.product_code}
                                                                onChange={(e) => handleProductChange(product.id, 'product_code', e.target.value)}
                                                                className="w-full p-1 border border-gray-300 rounded text-sm"
                                                            />
                                                        ) : (
                                                            <div className="text-sm text-gray-900">{product.product_code}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        {editingRows.has(product.id) ? (
                                                            <input
                                                                type="text"
                                                                value={product.name}
                                                                onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                                                                className="w-full p-1 border border-gray-300 rounded text-sm"
                                                            />
                                                        ) : (
                                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {editingRows.has(product.id) ? (
                                                            <textarea
                                                                value={product.description || ''}
                                                                onChange={(e) => handleProductChange(product.id, 'description', e.target.value)}
                                                                className="w-full p-1 border border-gray-300 rounded text-sm"
                                                                rows="2"
                                                                placeholder="Description..."
                                                            />
                                                        ) : (
                                                            <div className="text-sm text-gray-900 max-w-xs">
                                                                {product.description ? (
                                                                    <span title={product.description}>
                                                                        {product.description.length > 50 
                                                                            ? `${product.description.substring(0, 50)}...` 
                                                                            : product.description
                                                                        }
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400 italic">No description</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        {editingRows.has(product.id) ? (
                                                            <input
                                                                type="number"
                                                                value={product.price}
                                                                onChange={(e) => handleProductChange(product.id, 'price', e.target.value)}
                                                                className="w-full p-1 border border-gray-300 rounded text-sm"
                                                                step="0.01"
                                                                min="0"
                                                            />
                                                        ) : (
                                                            <div className="text-sm text-gray-900">RM{product.price}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        {editingRows.has(product.id) ? (
                                                            <input
                                                                type="number"
                                                                value={product.quantity}
                                                                onChange={(e) => handleProductChange(product.id, 'quantity', e.target.value)}
                                                                className="w-full p-1 border border-gray-300 rounded text-sm"
                                                                min="0"
                                                            />
                                                        ) : (
                                                            <div className="text-sm text-gray-900">{product.quantity}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        {editingRows.has(product.id) ? (
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleEditProductImageChange(product.id, e)}
                                                                    className="w-full p-1 border border-gray-300 rounded text-sm"
                                                                />
                                                                {editProductImages[product.id] && (
                                                                    <p className="text-xs text-gray-600">
                                                                        New: {editProductImages[product.id].name}
                                                                    </p>
                                                                )}
                                                                {!editProductImages[product.id] && product.image_url && (
                                                                    <p className="text-xs text-gray-600">
                                                                        Current image will be kept
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-gray-500 max-w-xs">
                                                                {product.image_url ? (
                                                                    <div className="flex flex-col space-y-1">
                                                                        <img 
                                                                            src={product.image_url} 
                                                                            alt={product.name}
                                                                            className="w-16 h-16 object-cover rounded"
                                                                        />
                                                                        <a href={product.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900 text-xs truncate">
                                                                            View Image
                                                                        </a>
                                                                    </div>
                                                                ) : (
                                                                    'No image'
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                        {editingRows.has(product.id) ? (
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => saveEdit(product.id)}
                                                                    className="text-green-600 hover:text-green-900"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => cancelEdit(product.id)}
                                                                    className="text-gray-600 hover:text-gray-900"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => toggleVisibility(product.id)}
                                                                    className={`p-2 text-white rounded ${product.is_hidden ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                                                                    title={product.is_hidden ? 'Show in catalog' : 'Hide from catalog'}
                                                                >
                                                                    {product.is_hidden ? (
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                                                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                                                        </svg>
                                                                    ) : (
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => startEdit(product.id)}
                                                                    className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded"
                                                                    title="Edit"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteProduct(product.id)}
                                                                    className="p-2 text-white bg-red-600 hover:bg-red-700 rounded"
                                                                    title="Delete"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
