import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        // Load cart from localStorage
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(savedCart);
        calculateTotal(savedCart);
    }, []);

    const calculateTotal = (items) => {
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setTotal(totalAmount);
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeItem(productId);
            return;
        }

        // Find the item to check stock limits
        const item = cartItems.find(item => item.id === productId);
        if (item && item.maxStock && newQuantity > item.maxStock) {
            alert(`Cannot set quantity to ${newQuantity}. Maximum available stock is ${item.maxStock}.`);
            return;
        }

        const updatedCart = cartItems.map(item => 
            item.id === productId ? { ...item, quantity: newQuantity } : item
        );
        
        setCartItems(updatedCart);
        calculateTotal(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const removeItem = (productId) => {
        const updatedCart = cartItems.filter(item => item.id !== productId);
        setCartItems(updatedCart);
        calculateTotal(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const clearCart = () => {
        if (window.confirm('Are you sure you want to clear all items from your cart? This action cannot be undone.')) {
            setCartItems([]);
            setTotal(0);
            localStorage.removeItem('cart');
        }
    };

    const copyCartText = () => {
        if (cartItems.length === 0) {
            alert('Cart is empty!');
            return;
        }

        let copyText = 'Product Order\n\n';
        
        cartItems.forEach((item, index) => {
            copyText += `Item ${index + 1}: ${item.name}\n`;
            copyText += `Qty: ${item.quantity}\n`;
            copyText += `Price: RM${(item.price * item.quantity).toFixed(2)}\n\n`;
        });
        
        copyText += `Order Total: RM${total.toFixed(2)}\n`;
        copyText += 'Please provide an invoice. Thank you!';

        navigator.clipboard.writeText(copyText).then(() => {
            alert('Product order copied to clipboard!');
        }).catch(() => {
            alert('Failed to copy to clipboard. Please try the export function instead.');
        });
    };

    const sendWhatsAppOrder = () => {
        if (cartItems.length === 0) {
            alert('Cart is empty!');
            return;
        }

        let message = 'Product Order\n\n';
        
        cartItems.forEach((item, index) => {
            message += `Item ${index + 1}: ${item.name}\n`;
            message += `Qty: ${item.quantity}\n`;
            message += `Price: RM${(item.price * item.quantity).toFixed(2)}\n\n`;
        });
        
        message += `Order Total: RM${total.toFixed(2)}\n`;
        message += 'Please provide an invoice. Thank you!';

        // Encode the message for URL
        const encodedMessage = encodeURIComponent(message);
        const phoneNumber = '+60124408720';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                    <div className="flex h-14 sm:h-16 justify-between items-center">
                        <div className="flex items-center min-w-0 flex-1">
                            <Link href="/" className="flex-shrink-0">
                                <ApplicationLogo className="block h-8 sm:h-9 w-auto fill-current text-gray-800" />
                            </Link>
                            <h1 className="ml-2 sm:ml-4 text-base sm:text-lg lg:text-xl font-semibold text-gray-900 hidden xs:block sm:hidden lg:block truncate">Shopping Cart</h1>
                            <h1 className="ml-2 text-base font-semibold text-gray-900 xs:hidden sm:block lg:hidden truncate">Cart</h1>
                        </div>
                        <div className="flex items-center ml-2">
                            <Link
                                href="/public-catalog"
                                className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm lg:text-base px-2 sm:px-3 py-2 rounded-md transition-colors"
                            >
                                <span className="hidden sm:inline">Back to Catalog</span>
                                <span className="sm:hidden">Catalog</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <Head title="Shopping Cart" />

            <div className="py-4 sm:py-6 lg:py-12">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="mb-4 sm:mb-6">
                        <Link
                            href="/public-catalog"
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base py-2 px-1 -mx-1 rounded-md transition-colors touch-manipulation"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Catalog
                        </Link>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-4 sm:p-6">
                            {cartItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                                    <p className="text-gray-600 mb-6">Start shopping to add items to your cart.</p>
                                    <Link 
                                        href="/public-catalog"
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
                                    >
                                        Browse Products
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-4 sm:mb-6">
                                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 pr-2">Shopping Cart ({cartItems.length} items)</h2>
                                        <button
                                            onClick={clearCart}
                                            className="bg-red-500 hover:bg-red-600 text-white font-medium px-3 sm:px-4 py-2 sm:py-2 rounded-lg transition-colors self-start sm:self-auto text-sm sm:text-base touch-manipulation"
                                        >
                                            Clear Cart
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 p-4 border border-gray-200 rounded-lg">
                                                {/* Mobile Layout */}
                                                <div className="flex items-start space-x-3 sm:hidden">
                                                    {item.image_url && (
                                                        <img
                                                            src={item.image_url}
                                                            alt={item.name}
                                                            className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm font-medium text-gray-900 leading-tight mb-1">{item.name}</h3>
                                                        <p className="text-xs text-gray-600 mb-1">ID: {item.id}</p>
                                                        <p className="text-base font-semibold text-green-600 mb-1">RM{item.price}</p>
                                                        {item.maxStock && (
                                                            <p className="text-xs text-gray-500">Stock: {item.maxStock} available</p>
                                                        )}
                                                        {item.maxStock && item.quantity === item.maxStock && (
                                                            <p className="text-xs text-orange-600 font-medium">⚠️ Maximum stock reached</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Desktop Layout - Table-like structure */}
                                                <div className="hidden sm:flex sm:items-center sm:w-full">
                                                    {/* Image Column - Fixed width */}
                                                    <div className="w-24 flex-shrink-0">
                                                        {item.image_url && (
                                                            <img
                                                                src={item.image_url}
                                                                alt={item.name}
                                                                className="w-20 h-20 object-cover rounded-lg"
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Product Info Column - Flexible width */}
                                                    <div className="flex-1 min-w-0 pr-6">
                                                        <h3 className="text-lg font-medium text-gray-900 truncate">{item.name}</h3>
                                                        <p className="text-sm text-gray-600">ID: {item.id}</p>
                                                        <p className="text-lg font-semibold text-green-600">RM{item.price}</p>
                                                        {item.maxStock && (
                                                            <p className="text-sm text-gray-500">Stock: {item.maxStock} available</p>
                                                        )}
                                                        {item.maxStock && item.quantity === item.maxStock && (
                                                            <p className="text-sm text-orange-600 font-medium">⚠️ Maximum stock reached</p>
                                                        )}
                                                    </div>

                                                    {/* Quantity Column - Fixed width */}
                                                    <div className="w-32 flex-shrink-0 flex items-center justify-center">
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full"
                                                            >
                                                                -
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max={item.maxStock || 9999}
                                                                value={item.quantity}
                                                                onChange={(e) => {
                                                                    const newQuantity = parseInt(e.target.value) || 1;
                                                                    updateQuantity(item.id, newQuantity);
                                                                }}
                                                                className="w-16 text-center font-medium border border-gray-300 rounded px-2 py-1"
                                                            />
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                disabled={item.maxStock && item.quantity >= item.maxStock}
                                                                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                                                                    item.maxStock && item.quantity >= item.maxStock
                                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                        : 'bg-gray-200 hover:bg-gray-300'
                                                                }`}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Price & Actions Column - Fixed width */}
                                                    <div className="w-32 flex-shrink-0 text-right">
                                                        <p className="text-lg font-semibold mb-1">
                                                            RM{(item.price * item.quantity).toFixed(2)}
                                                        </p>
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-red-500 hover:text-red-700 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Mobile Controls */}
                                                <div className="flex items-center justify-between sm:hidden pt-2">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-9 h-9 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full touch-manipulation text-lg font-medium"
                                                        >
                                                            −
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={item.maxStock || 9999}
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const newQuantity = parseInt(e.target.value) || 1;
                                                                updateQuantity(item.id, newQuantity);
                                                            }}
                                                            className="w-14 h-9 text-center font-medium border border-gray-300 rounded px-1 py-1 text-base"
                                                        />
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            disabled={item.maxStock && item.quantity >= item.maxStock}
                                                            className={`w-9 h-9 flex items-center justify-center rounded-full touch-manipulation text-lg font-medium ${
                                                                item.maxStock && item.quantity >= item.maxStock
                                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                    : 'bg-gray-200 hover:bg-gray-300'
                                                            }`}
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    <div className="text-right ml-2">
                                                        <p className="text-base font-semibold mb-1">
                                                            RM{(item.price * item.quantity).toFixed(2)}
                                                        </p>
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-red-500 hover:text-red-700 text-xs py-1 px-2 rounded touch-manipulation"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-bold text-gray-900">Total:</span>
                                            <span className="text-2xl font-bold text-green-600">RM{total.toFixed(2)}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2 mb-4">
                                            Note: This is a catalog display system. No checkout functionality is available.
                                        </p>

                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                                            <button
                                                onClick={copyCartText}
                                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium px-3 sm:px-4 py-3 sm:py-3 rounded-lg transition-colors text-sm sm:text-base touch-manipulation"
                                            >
                                                Copy Order
                                            </button>
                                            <button
                                                onClick={sendWhatsAppOrder}
                                                className="flex-1 inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-medium px-3 sm:px-4 py-3 sm:py-3 rounded-lg transition-colors text-sm sm:text-base touch-manipulation"
                                            >
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                                </svg>
                                                <span className="hidden xs:inline">Order via WhatsApp</span>
                                                <span className="xs:hidden">WhatsApp</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
