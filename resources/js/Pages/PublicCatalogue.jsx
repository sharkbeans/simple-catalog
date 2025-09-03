import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function PublicCatalogue({ products = [], filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters.direction || 'desc');

    const handleSearch = (value) => {
        setSearchTerm(value);
        const params = {
            search: value || undefined,
            sort: sortBy,
            direction: sortDirection
        };
        // Remove undefined values
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
        
        router.get('/public-catalog', params, {
            preserveState: true,
            replace: true
        });
    };

    const handleSort = (newSortBy, newDirection) => {
        setSortBy(newSortBy);
        setSortDirection(newDirection);
        const params = {
            search: searchTerm || undefined,
            sort: newSortBy,
            direction: newDirection
        };
        // Remove undefined values
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
        
        router.get('/public-catalog', params, {
            preserveState: true,
            replace: true
        });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center">
                            <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                            <h1 className="ml-4 text-xl font-semibold text-gray-900">Product Catalog</h1>
                        </div>
                        <div className="flex items-center">
                            <Link 
                                href="/cart"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                            >
                                🛒 View Cart
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <Head title="Product Catalog" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Our Product Catalog</h2>
                        <p className="text-lg text-gray-600 mb-6">
                            Browse our collection of products and discover what we have to offer.
                        </p>
                    </div>

                    {/* Search and Sort Controls */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                                {/* Search Bar */}
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search products by name, price, or quantity..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                
                                {/* Sort Controls */}
                                <div className="flex space-x-3">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => handleSort(e.target.value, sortDirection)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
                                    >
                                        <option value="created_at">Date Added</option>
                                        <option value="name">Name</option>
                                        <option value="price">Price</option>
                                        <option value="quantity">Quantity</option>
                                    </select>
                                    
                                    {sortBy === 'price' && (
                                        <select
                                            value={sortDirection}
                                            onChange={(e) => handleSort(sortBy, e.target.value)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
                                        >
                                            <option value="desc">High to Low</option>
                                            <option value="asc">Low to High</option>
                                        </select>
                                    )}
                                    
                                    {sortBy !== 'price' && (
                                        <select
                                            value={sortDirection}
                                            onChange={(e) => handleSort(sortBy, e.target.value)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
                                        >
                                            <option value="desc">Newest</option>
                                            <option value="asc">Oldest</option>
                                        </select>
                                    )}
                                </div>
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
                                            onClick={() => handleSearch('')}
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Clear Search
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-lg font-medium mb-4">No products available</h3>
                                        <p className="text-gray-600">Check back later for new products!</p>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full">
                                    <Link 
                                        href={`/products/${product.id}`}
                                        className="flex flex-col h-full"
                                    >
                                        {product.image_url && (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-48 object-cover"
                                            />
                                        )}
                                        <div className="p-4 flex flex-col flex-grow">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                                            {product.description && (
                                                <p className="text-sm text-gray-600 mb-2 flex-grow">{product.description}</p>
                                            )}
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-2xl font-bold text-green-600">RM{product.price}</span>
                                                <span className="text-sm text-gray-500">
                                                    {product.quantity > 0 ? `Qty: ${product.quantity}` : 'Out of Stock'}
                                                </span>
                                            </div>
                                            <div className="mt-auto">
                                                <div className="bg-blue-100 text-blue-600 text-center py-2 px-4 rounded hover:bg-blue-200 transition-colors">
                                                    View Details
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
