import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar'; 

const API_URL = 'http://localhost:3001'; // json-server URL

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCheckoutSummary, setShowCheckoutSummary] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState('');

    const router = useRouter();

    
    
    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const response = await axios.get(`${API_URL}/products`);
                setProducts(response.data);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load product data.');
            }
        };
        fetchAllProducts();
    }, []);


    const fetchCartItems = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/cart`);
            setCartItems(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching cart items:', err);
            setError('Failed to load cart items.');
            setCartItems([]); 
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (products.length > 0) { // Fetch cart only after products are loaded for merging
            fetchCartItems();
        }
    }, [products]);


    const getProductDetails = (productId) => {
        return products.find(p => p.id === productId);
    };

    const handleUpdateQuantity = async (cartItemId, productId, newQuantity) => {
        if (newQuantity < 1) newQuantity = 1;
        const currentItem = cartItems.find(item => item.id === cartItemId);
        if (!currentItem) return;

        try {
            await axios.put(`${API_URL}/cart/${cartItemId}`, {
                ...currentItem,
                quantity: newQuantity
            });
            fetchCartItems(); // Re-fetch to update UI and totals
        } catch (err) {
            console.error('Error updating quantity:', err);
            alert('Failed to update quantity.');
        }
    };

    const handleUpdateNote = async (cartItemId, productId, newNote) => {
        const currentItem = cartItems.find(item => item.id === cartItemId);
        if (!currentItem) return;
        try {
            await axios.put(`${API_URL}/cart/${cartItemId}`, {
                ...currentItem,
                note: newNote
            });
            fetchCartItems();
        } catch (err) {
            console.error('Error updating note:', err);
            alert('Failed to update note.');
        }
    };

    const handleDeleteItem = async (cartItemId) => {
        try {
            await axios.delete(`${API_URL}/cart/${cartItemId}`);
            fetchCartItems();
        } catch (err) {
            console.error('Error deleting item:', err);
            alert('Failed to delete item.');
        }
    };

    const handleEmptyCart = async () => {
        try {
            const deletePromises = cartItems.map(item => axios.delete(`${API_URL}/cart/${item.id}`));
            await Promise.all(deletePromises); 
            fetchCartItems(); // Re-fetch to show empty cart
            setPaymentMessage(''); // Clear any payment messages
        } catch (err) {
            console.error('Error emptying cart:', err);
            alert('Failed to empty cart.');
        }
    };

    const itemsTotal = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            const product = getProductDetails(item.productId);
            if (!product) return sum;
            const priceToUse = (product.isCampaign && product.newPrice !== undefined) ? product.newPrice : product.price;
            return sum + (priceToUse * item.quantity);
        }, 0);
    }, [cartItems, products]);

    const deliveryFee = useMemo(() => {
        return itemsTotal > 0 && itemsTotal < 1000 ? 50 : 0;
    }, [itemsTotal]);

    const finalTotal = useMemo(() => {
        return itemsTotal + deliveryFee;
    }, [itemsTotal, deliveryFee]);


    const handleProceedCheckout = () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty.");
            return;
        }
        setShowCheckoutSummary(true);
        setPaymentMessage('');
    };

    const handlePayment = async () => {
        try {
            await handleEmptyCart(); 
            setShowCheckoutSummary(false);
            setPaymentMessage('Payment successful! Your order has been placed and cart cleared.');
    
        } catch (err) {
             setPaymentMessage('An error occurred during payment. Please try again.');
        }
    };
    
    if (isLoading && products.length === 0) return <div className="container mt-4"><Navbar /><p>Loading products...</p></div>;
    if (error) return <div className="container mt-4"><Navbar /><p className="text-danger">{error}</p></div>;

    return (
        <>
            <Navbar />
            <div className="container mt-4">
                <h1 className="mb-4">Your Shopping Cart</h1>
                {paymentMessage && <div className={`alert ${paymentMessage.includes('successful') ? 'alert-success' : 'alert-danger'} my-3`}>{paymentMessage}</div>}

                {isLoading && cartItems.length === 0 && products.length > 0 ? <p>Loading cart...</p> : (
                    <div className="row">
                        <div className="col-md-8" id="cartItemsContainer">
                            {cartItems.length === 0 && !paymentMessage.includes('successful') ? (
                                <div className="empty-cart text-center py-5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-cart mb-3 text-muted" viewBox="0 0 16 16">
                                        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                                    </svg>
                                    <h3>Your cart is empty</h3>
                                    <p>Browse our products and find something you like!</p>
                                    <Link href="/" legacyBehavior><a className="btn btn-primary mt-3">Go Shopping</a></Link>
                                </div>
                            ) : (
                                cartItems.map(item => {
                                    const product = getProductDetails(item.productId);
                                    if (!product) return null;
                                    return (
                                        <div key={item.id} className="cart-item row border-bottom py-3 mb-3">
                                            <div className="col-xl-2 col-lg-2 col-md-3 col-sm-3">
                                                <Link href={`/products/${ product.id}`} legacyBehavior>
                                                    <a><img src={product.imageurl} alt={product.title} className="img-fluid" style={{ height: '80px', objectFit: 'contain' }} /></a>
                                                </Link>
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4">
                                                <h5 className="item-title mb-1">{product.title}</h5>
                                                <p className="item-price mb-1 fw-bold">
                                                    {product.isCampaign && product.newPrice !== undefined ? (
                                                        <>
                                                            <span className="text-decoration-line-through text-muted me-2">
                                                                ${product.price.toFixed(2)}
                                                            </span>
                                                            ${product.newPrice.toFixed(2)}
                                                        </>
                                                    ) : (
                                                        `$${product.price.toFixed(2)}`
                                                    )}
                                                </p>
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-5 col-sm-5 d-flex align-items-center">
                                                <button className="quantity-btn btn btn-sm btn-outline-secondary" onClick={() => handleUpdateQuantity(item.id, item.productId, item.quantity - 1)}>-</button>
                                                <input type="number" className="quantity-input form-control form-control-sm mx-2 text-center" style={{width: '60px'}} value={item.quantity} onChange={(e) => handleUpdateQuantity(item.id, item.productId, parseInt(e.target.value))} min="1" />
                                                <button className="quantity-btn btn btn-sm btn-outline-secondary" onClick={() => handleUpdateQuantity(item.id, item.productId, item.quantity + 1)}>+</button>
                                            </div>
                                            <div className="col-xl-2 col-lg-2 col-md-6 col-sm-6 mt-2 mt-md-0">
                                                <p className="item-price fw-bold">
                                                    ${((product.isCampaign && product.newPrice !== undefined ? product.newPrice : product.price) * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="col-xl-2 col-lg-2 col-md-6 col-sm-6 mt-2 mt-md-0 text-end">
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteItem(item.id)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="col-12 mt-2">
                                                <input 
                                                    type="text" 
                                                    className="form-control form-control-sm"
                                                    placeholder="Special note (e.g., gift wrapping)"
                                                    defaultValue={item.note || ''}
                                                    onBlur={(e) => handleUpdateNote(item.id, item.productId, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="col-md-4">
                            <div className="cart-summary bg-light p-3 rounded">
                                <h4 className="mb-3">Order Summary</h4>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Items Total:</span>
                                    <strong>${itemsTotal.toFixed(2)}</strong>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                    <span>Delivery Fee:</span>
                                    <strong>${deliveryFee.toFixed(2)}</strong>
                                </div>
                                <hr/>
                                <div className="d-flex justify-content-between mb-4 fw-bold fs-5">
                                    <span>Total to Pay:</span>
                                    <span>${finalTotal.toFixed(2)}</span>
                                </div>
                                
                                {!showCheckoutSummary ? (
                                    <>
                                        <button 
                                            className="checkout-btn btn btn-primary w-100 mb-2" 
                                            onClick={handleProceedCheckout} 
                                            disabled={cartItems.length === 0}
                                        >
                                            Proceed to Checkout
                                        </button>
                                        {cartItems.length > 0 && (
                                            <button 
                                                className="btn btn-outline-danger w-100 mb-2" 
                                                onClick={handleEmptyCart}
                                            >
                                                Empty Cart
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="checkout-payment-section border p-3 rounded">
                                        <h5>Confirm Payment</h5>
                                       
                                        <p>You are about to pay <strong>${finalTotal.toFixed(2)}</strong>.</p>
                                        <button 
                                            className="btn btn-success w-100 mb-2"
                                            onClick={handlePayment}
                                        >
                                            Pay Now
                                        </button>
                                        <button 
                                            className="btn btn-secondary w-100"
                                            onClick={() => setShowCheckoutSummary(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                                <div className="mt-3 text-center">
                                    <Link href="/" legacyBehavior><a>Continue Shopping</a></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartPage;
