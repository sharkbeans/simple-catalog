import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Sidebar from '@/Components/Sidebar';

export default function ProductDetails({ product }) {
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [cartQuantity, setCartQuantity] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Check current cart quantity on component mount
    React.useEffect(() => {
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = existingCart.find(item => item.id === product.id);
        if (existingItem) {
            setCartQuantity(existingItem.quantity);
        }
    }, [product.id]);

    const addToCart = () => {
        // Get existing cart from localStorage
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Check if product already exists in cart
        const existingItemIndex = existingCart.findIndex(item => item.id === product.id);
        const existingQuantity = existingItemIndex !== -1 ? existingCart[existingItemIndex].quantity : 0;
        
        // Check if adding this quantity would exceed stock
        const totalQuantity = existingQuantity + quantity;
        if (totalQuantity > product.quantity) {
            alert(`Cannot add ${quantity} items. Only ${product.quantity - existingQuantity} more available (${existingQuantity} already in cart).`);
            return;
        }
        
        if (existingItemIndex !== -1) {
            // Update quantity if product exists
            existingCart[existingItemIndex].quantity = totalQuantity;
            existingCart[existingItemIndex].maxStock = product.quantity; // Store max stock for cart validation
        } else {
            // Add new item to cart
            existingCart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image_url: product.image_url,
                maxStock: product.quantity // Store max stock for cart validation
            });
        }
        
        // Save updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(existingCart));
        
        // Update cart quantity state
        setCartQuantity(totalQuantity);
        
        // Show confirmation
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const orderViaWhatsApp = () => {
        const message = `Product Order\n\nItem 1: ${product.name}\nQty: ${quantity}\nPrice: RM${(product.price * quantity).toFixed(2)}\n\nOrder Total: RM${(product.price * quantity).toFixed(2)}\nPlease provide an invoice. Thank you!`;
        
        const encodedMessage = encodeURIComponent(message);
        const phoneNumber = '+60124408720';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        const maxAvailable = product.quantity - cartQuantity;
        if (value >= 1 && value <= maxAvailable) {
            setQuantity(value);
        }
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
                            <h1 className="ml-2 sm:ml-4 text-lg sm:text-xl font-semibold text-gray-900 truncate">Product Details</h1>
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

            <Head title={`${product.name} - Product Details`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Back to Catalog Button */}
                            <div className="mb-6">
                                <Link 
                                    href="/public-catalog"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Back to Catalog
                                </Link>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Product Image */}
                                <div className="space-y-4">
                                    {product.image_url ? (
                                        <div className="aspect-square">
                                            <img 
                                                src={product.image_url} 
                                                alt={product.name}
                                                className="w-full h-full object-cover rounded-lg shadow-lg"
                                            />
                                        </div>
                                    ) : (
                                        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                                            <span className="text-gray-500 text-lg">No Image Available</span>
                                        </div>
                                    )}
                                </div>

                                {/* Product Details */}
                                <div className="space-y-6">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                        <p className="text-2xl font-semibold text-green-600">RM{product.price}</p>
                                    </div>

                                    {product.description && (
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                                            <p className="text-gray-700 leading-relaxed">{product.description}</p>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Availability</h3>
                                        <p className="text-gray-700">
                                            {product.quantity > 0 ? (
                                                <span className="text-green-600">
                                                    In Stock ({product.quantity} available)
                                                </span>
                                            ) : (
                                                <span className="text-red-600">Out of Stock</span>
                                            )}
                                        </p>
                                        {cartQuantity > 0 && (
                                            <p className="text-sm text-blue-600 mt-1">
                                                {cartQuantity} already in cart ({product.quantity - cartQuantity} remaining)
                                            </p>
                                        )}
                                    </div>

                                    {product.quantity > 0 && cartQuantity < product.quantity ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Quantity
                                                </label>
                                                <input
                                                    type="number"
                                                    id="quantity"
                                                    min="1"
                                                    max={product.quantity - cartQuantity}
                                                    value={quantity}
                                                    onChange={handleQuantityChange}
                                                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <button
                                                onClick={addToCart}
                                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors mb-3"
                                            >
                                                Add to Cart
                                            </button>

                                            <button
                                                onClick={orderViaWhatsApp}
                                                className="w-full inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                                </svg>
                                                Order via WhatsApp
                                            </button>

                                            {addedToCart && (
                                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                                                    Product added to cart successfully!
                                                </div>
                                            )}
                                        </div>
                                    ) : product.quantity > 0 ? (
                                        <div className="space-y-4">
                                            <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded">
                                                All available stock is already in your cart. 
                                                            <Link
                                                                href="/cart"
                                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center text-sm sm:text-base"
                                                            >
                                                                <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                </svg>
                                                                <span className="hidden sm:inline ml-2">View Cart</span>
                                                                <span className="sm:inline">Cart</span>
                                                            </Link>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
