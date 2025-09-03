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
        setCartItems([]);
        setTotal(0);
        localStorage.removeItem('cart');
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
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center">
                            <Link href="/">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                            </Link>
                            <h1 className="ml-4 text-xl font-semibold text-gray-900">Shopping Cart</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link 
                                href="/public-catalog"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <Head title="Shopping Cart" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
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
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">Shopping Cart ({cartItems.length} items)</h2>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={sendWhatsAppOrder}
                                                className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                                </svg>
                                                Order via WhatsApp
                                            </button>
                                            <button
                                                onClick={copyCartText}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                                            >
                                                Copy Order
                                            </button>
                                            <button
                                                onClick={clearCart}
                                                className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                                            >
                                                Clear Cart
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                                {item.image_url && (
                                                    <img 
                                                        src={item.image_url} 
                                                        alt={item.name}
                                                        className="w-20 h-20 object-cover rounded-lg"
                                                    />
                                                )}
                                                
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                                    <p className="text-gray-600">ID: {item.id}</p>
                                                    <p className="text-lg font-semibold text-green-600">RM{item.price}</p>
                                                    {item.maxStock && (
                                                        <p className="text-sm text-gray-500">Stock: {item.maxStock} available</p>
                                                    )}
                                                    {item.maxStock && item.quantity === item.maxStock && (
                                                        <p className="text-sm text-orange-600 font-medium">⚠️ Maximum stock reached</p>
                                                    )}
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-12 text-center font-medium">{item.quantity}</span>
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

                                                <div className="text-right">
                                                    <p className="text-lg font-semibold">
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
                                        ))}
                                    </div>

                                    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-bold text-gray-900">Total:</span>
                                            <span className="text-2xl font-bold text-green-600">RM{total.toFixed(2)}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">
                                            Note: This is a catalog display system. No checkout functionality is available.
                                        </p>
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
