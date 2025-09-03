import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Spreadsheet({ auth }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [editingRows, setEditingRows] = useState(new Set());
    const [newProduct, setNewProduct] = useState({
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
                setSuccess('Product updated successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Failed to update product');
            }
        } catch (err) {
            setError('An error occurred while updating the product');
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
                setProducts(products.filter(product => product.id !== productId));
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

    const addNewProduct = async (e) => {
        e.preventDefault();
        setErrors({});

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            // Use FormData for file upload
            const formData = new FormData();
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
                setNewProduct({ name: '', description: '', price: '', quantity: '', image_url: '' });
                setNewProductImage(null);
                setShowAddForm(false);
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

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

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
                                                value={newProduct.name}
                                                onChange={(e) => handleNewProductChange('name', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded"
                                                placeholder="Product Name"
                                                required
                                            />
                                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
                                        </div>
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
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
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
                                    {searchTerm ? (
                                        <span>Found {products.length} product(s) matching "{searchTerm}"</span>
                                    ) : (
                                        <span>Showing {products.length} product(s)</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Products Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Header with Add Product Button */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900">Products</h3>
                                <button
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    {showAddForm ? 'Cancel' : 'Add Product'}
                                </button>
                            </div>
                            
                            {products.length === 0 ? (
                                <div className="text-center py-8">
                                    <h3 className="text-lg font-medium mb-4">No products found</h3>
                                    <p className="text-gray-600 mb-6">Start building your product catalog by adding your first product.</p>
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
                                    >
                                        Add Your First Product
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full table-auto">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {products.map((product) => (
                                                <tr key={product.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {product.id}
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
                                                                    onClick={() => startEdit(product.id)}
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteProduct(product.id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
