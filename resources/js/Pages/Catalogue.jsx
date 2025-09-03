import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Catalogue({ auth }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editData, setEditData] = useState({});
    const [editImageFile, setEditImageFile] = useState(null);
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
            } else {
                setError('Failed to delete product');
            }
        } catch (err) {
            setError('An error occurred while deleting the product');
        }
    };

    const startEdit = (product) => {
        setEditingProduct(product.id);
        setEditData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            quantity: product.quantity,
            image_url: product.image_url || ''
        });
        setEditImageFile(null);
    };

    const cancelEdit = () => {
        setEditingProduct(null);
        setEditData({});
        setEditImageFile(null);
    };

    const saveEdit = async (productId) => {
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            // Use FormData for file upload
            const formData = new FormData();
            formData.append('name', editData.name);
            formData.append('description', editData.description || '');
            formData.append('price', parseFloat(editData.price));
            formData.append('quantity', parseInt(editData.quantity));
            formData.append('_method', 'PUT'); // Laravel method spoofing
            
            console.log('Edit image file:', editImageFile);
            if (editImageFile) {
                console.log('Appending image file:', editImageFile.name, editImageFile.size);
                formData.append('image', editImageFile);
            }

            // Debug FormData contents
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            // Use different endpoint if there's an image to avoid method spoofing issues
            const endpoint = editImageFile 
                ? `/api/products/${productId}/update-with-image`
                : `/api/products/${productId}`;
            
            const requestBody = editImageFile ? formData : {
                name: editData.name,
                description: editData.description || '',
                price: parseFloat(editData.price),
                quantity: parseInt(editData.quantity)
            };

            const response = await fetch(endpoint, {
                method: editImageFile ? 'POST' : 'PUT',
                headers: editImageFile ? {
                    'Authorization': `Bearer ${auth.token}`,
                    'X-CSRF-TOKEN': token
                } : {
                    'Authorization': `Bearer ${auth.token}`,
                    'X-CSRF-TOKEN': token,
                    'Content-Type': 'application/json'
                },
                body: editImageFile ? formData : JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            if (response.ok) {
                const updatedProduct = await response.json();
                setProducts(products.map(product => 
                    product.id === productId ? updatedProduct : product
                ));
                setEditingProduct(null);
                setEditData({});
                setEditImageFile(null);
            } else {
                setError('Failed to update product');
            }
        } catch (err) {
            setError('An error occurred while updating the product');
        }
    };

    const handleEditChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setEditImageFile(file);
    };

    const handleSearch = () => {
        fetchProducts();
    };

    if (loading) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Product Catalogue</h2>}
            >
                <Head title="Catalogue" />
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
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Admin - Product Catalogue</h2>
                    <Link
                        href="/spreadsheet"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Manage Products
                    </Link>
                </div>
            }
        >
            <Head title="Catalogue" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {/* Search and Sort Controls */}
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

                    {products.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900 text-center">
                                {searchTerm ? (
                                    <>
                                        <h3 className="text-lg font-medium mb-4">No products found</h3>
                                        <p className="text-gray-600 mb-6">No products match your search "{searchTerm}". Try a different search term.</p>
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
                                        >
                                            Clear Search
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-lg font-medium mb-4">No products found</h3>
                                        <p className="text-gray-600 mb-6">Start building your product catalog by adding your first product.</p>
                                    </>
                                )}
                                <Link
                                    href="/spreadsheet"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
                                >
                                    Add Your First Product
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                                    {product.image_url && (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-4 flex flex-col flex-grow">
                                        {editingProduct === product.id ? (
                                            // Edit mode
                                            <div className="space-y-3 flex flex-col flex-grow">
                                                <input
                                                    type="text"
                                                    value={editData.name}
                                                    onChange={(e) => handleEditChange('name', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded text-sm"
                                                    placeholder="Product name"
                                                />
                                                <textarea
                                                    value={editData.description || ''}
                                                    onChange={(e) => handleEditChange('description', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded text-sm"
                                                    placeholder="Product description"
                                                    rows="3"
                                                />
                                                <div className="flex space-x-2">
                                                    <input
                                                        type="number"
                                                        value={editData.price}
                                                        onChange={(e) => handleEditChange('price', e.target.value)}
                                                        className="flex-1 p-2 border border-gray-300 rounded text-sm"
                                                        placeholder="Price"
                                                        step="0.01"
                                                        min="0"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={editData.quantity}
                                                        onChange={(e) => handleEditChange('quantity', e.target.value)}
                                                        className="flex-1 p-2 border border-gray-300 rounded text-sm"
                                                        placeholder="Qty"
                                                        min="0"
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Product Image
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="w-full p-2 border border-gray-300 rounded text-sm"
                                                    />
                                                    {editImageFile && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Selected: {editImageFile.name}
                                                        </p>
                                                    )}
                                                    {!editImageFile && editData.image_url && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Current image will be kept if no new file is selected
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex space-x-2 mt-auto">
                                                    <button
                                                        onClick={() => saveEdit(product.id)}
                                                        className="flex-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            // View mode
                                            <div className="flex flex-col flex-grow">
                                                <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                                                {product.description && (
                                                    <p className="text-sm text-gray-600 mb-2 flex-grow">{product.description}</p>
                                                )}
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-2xl font-bold text-green-600">RM{product.price}</span>
                                                    <span className="text-sm text-gray-500">Qty: {product.quantity}</span>
                                                </div>
                                                <div className="flex space-x-2 mt-auto">
                                                    <button
                                                        onClick={() => startEdit(product)}
                                                        className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteProduct(product.id)}
                                                        className="flex-1 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
