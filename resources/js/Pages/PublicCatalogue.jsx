import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Sidebar from '@/Components/Sidebar';

export default function PublicCatalogue({ products = [], filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters.direction || 'desc');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [itemsPerRow, setItemsPerRow] = useState(4); // Default 4 items per row

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
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
                            <h1 className="ml-2 sm:ml-4 text-lg sm:text-xl font-semibold text-gray-900 truncate">Product Catalog</h1>
                        </div>
                        <div className="flex items-center ml-2">
                            <Link
                                href="/cart"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center text-sm sm:text-base"
                            >
                                <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="hidden sm:inline ml-2">View Cart</span>
                                <span className="sm:hidden sr-only">Cart</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <Head title="Product Catalog" />

            <div className="py-6 sm:py-12">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Our Product Catalog</h2>
                        <p className="text-lg text-gray-600 mb-6">
                            Browse our collection of products and discover what we have to offer.
                        </p>
                    </div>

                    {/* Search and Sort Controls */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                                {/* Search Bar */}
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search by name, price, or quantity..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                
                                {/* Sort Controls */}
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => handleSort(e.target.value, sortDirection)}
                                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
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
                                            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
                                        >
                                            <option value="desc">High to Low</option>
                                            <option value="asc">Low to High</option>
                                        </select>
                                    )}

                                    {sortBy !== 'price' && (
                                        <select
                                            value={sortDirection}
                                            onChange={(e) => handleSort(sortBy, e.target.value)}
                                            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
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
                        <div className={`grid gap-1.5 sm:gap-6 ${
                            itemsPerRow === 2 ? 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2' :
                            itemsPerRow === 3 ? 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3' :
                            itemsPerRow === 4 ? 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' :
                            itemsPerRow === 5 ? 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' :
                            'grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
                        }`}>
                            {products.map((product) => (
                                <div key={product.id} className="bg-white rounded-md sm:rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full">
                                    <Link 
                                        href={`/products/${product.id}`}
                                        className="flex flex-col h-full"
                                    >
                                        {product.image_url && (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-36 sm:h-48 object-cover"
                                            />
                                        )}
                                        <div className="p-1.5 sm:p-4 flex flex-col flex-grow">
                                            <h3 className="font-semibold text-sm sm:text-lg text-gray-900 mb-1 sm:mb-2 overflow-hidden">{product.name}</h3>
                                            <div className="flex-grow mb-1 sm:mb-2 min-h-[2rem] sm:min-h-[2.5rem]">
                                                {product.description && (
                                                    <p className="text-xs sm:text-sm text-gray-600 overflow-hidden">{product.description}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 sm:mb-4 space-y-1 sm:space-y-0">
                                                <span className="text-lg sm:text-2xl font-bold text-green-600">RM{product.price}</span>
                                                <span className="text-xs sm:text-sm text-gray-500">
                                                    {product.quantity > 0 ? `Qty: ${product.quantity}` : 'Out of Stock'}
                                                </span>
                                            </div>
                                            <div className="mt-auto hidden sm:block">
                                                <div className="bg-blue-100 text-blue-600 text-center py-1 sm:py-2 px-2 sm:px-4 rounded hover:bg-blue-200 transition-colors text-xs sm:text-sm">
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
