import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../../components/Navbar'; 

const API_URL = 'http://localhost:3001';

const ProductDetailPage = ({ product: initialProduct, reviews: initialReviews, error }) => {
    const router = useRouter();
    const [product, setProduct] = useState(initialProduct);
    const [reviews, setReviews] = useState(initialReviews || []);
    const [quantity, setQuantity] = useState(1);
    const [newReview, setNewReview] = useState({ username: '', title: '', comment: '', stars: 5 });
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [cartTotal, setCartTotal] = useState(0);

    const fetchCartTotal = async () => {
        try {
            const cartResponse = await axios.get(`${API_URL}/cart`);
            const cartItems = cartResponse.data;
            
            const productIds = cartItems.map(item => item.productId);
            if (productIds.length === 0) {
                setCartTotal(0);
                return;
            }
            const productsResponse = await axios.get(`${API_URL}/products?${productIds.map(id => `id=${id}`).join('&')}`);
            const productsInCart = productsResponse.data;

            const total = cartItems.reduce((sum, item) => {
                const prod = productsInCart.find(p => p.id === item.productId);
                const price = prod ? (prod.isCampaign ? prod.newPrice : prod.price) : 0;
                return sum + (price * item.quantity);
            }, 0);
            setCartTotal(total);
        } catch (err) {
            console.error("Error fetching cart total:", err);
        }
    };

    useEffect(() => {
        fetchCartTotal();
        if (initialProduct) {
            setProduct(initialProduct);
        }
        if(initialReviews){
            setReviews(initialReviews);
        }
    }, [initialProduct, initialReviews]);

    const showTempNotification = (message, type = 'success', duration = 3000) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), duration);
    };

    const handleQuantityChange = (amount) => {
        setQuantity(prev => Math.max(1, prev + amount));
    };

    const handleInputChange = (e) => {
        const value = parseInt(e.target.value);
        setQuantity(value >= 1 ? value : 1);
    };

    const handleAddToCart = async () => {
        if (!product) return;
        if (quantity < 1) {
            showTempNotification('Quantity must be at least 1.', 'error');
            return;
        }

        try {
            const cartResponse = await axios.get(`${API_URL}/cart?productId=${product.id}`);
            const existingCartItem = cartResponse.data[0];

            if (existingCartItem) {
                await axios.put(`${API_URL}/cart/${existingCartItem.id}`, {
                    ...existingCartItem,
                    quantity: existingCartItem.quantity + quantity
                });
                showTempNotification(`${quantity} more ${product.title}(s) added/updated in cart.`, 'success');
            } else {
                await axios.post(`${API_URL}/cart`, {
                    productId: product.id,
                    quantity: quantity
                });
                showTempNotification(`${product.title} added to cart.`, 'success');
            }
            setQuantity(1);
            fetchCartTotal();
        } catch (err) {
            console.error("Error adding to cart:", err);
            showTempNotification('Failed to add to cart. Please try again.', 'error');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!product) return;
        if (!newReview.username || !newReview.title || !newReview.comment || newReview.stars < 1 || newReview.stars > 5) {
            showTempNotification('Please fill all review fields and select a star rating between 1 and 5.', 'error');
            return;
        }
        try {
            // 1. Fetch the current product data to ensure we have the latest version
           
            const productResponse = await axios.get(`${API_URL}/products/${product.id}`);
            const currentProduct = productResponse.data;

            // 2. Construct the new review object
            const reviewToAdd = {
                username: newReview.username,
                title: newReview.title,
                comment: newReview.comment,
                stars: parseInt(newReview.stars), 
                //date: new Date().toISOString() // tarihe gerk var mı?
            };

            // append the product's reviews array
            const updatedReviews = [...(currentProduct.reviews || []), reviewToAdd];
            const updatedProduct = { ...currentProduct, reviews: updatedReviews };

            // 4. PUT the entire modified product object back to the server
            const updateResponse = await axios.put(`${API_URL}/products/${product.id}`, updatedProduct);

            setReviews(updatedProduct.reviews);
            setProduct(updatedProduct); // Update the product state as well, as it now contains the new review
            setNewReview({ username: '', title: '', comment: '', stars: 5 }); // Reset form
            showTempNotification('Review submitted successfully!', 'success');

        } catch (err) {
            console.error("Error submitting review:", err);
            let errorMessage = 'Failed to submit review.';
            if (err.response) {
                errorMessage += ` (Status: ${err.response.status} - ${err.response.statusText})`;
                console.error("Response data:", err.response.data);
            } else if (err.request) {
                errorMessage += ' No response received from server.';
            } else {
                errorMessage += ` ${err.message}`;
            }
            showTempNotification(errorMessage, 'error');
        }
    };

    const handleReviewFormChange = (e) => {
        const { name, value } = e.target;
        setNewReview(prev => ({ ...prev, [name]: name === 'stars' ? parseInt(value) : value }));
    };
    
    const currentPrice = product ? (product.isCampaign && product.newPrice ? product.newPrice : product.price) : 0;

    if (router.isFallback) {
        return <div className="container mt-4"><Navbar cartTotal={cartTotal} /><p>Loading product...</p></div>;
    }
    if (error) {
        return <div className="container mt-4"><Navbar cartTotal={cartTotal} /><p className="alert alert-danger">{error}</p></div>;
    }
    if (!product) {
        return <div className="container mt-4"><Navbar cartTotal={cartTotal} /><p className="alert alert-warning">Product not found.</p></div>;
    }

    return (
        <>
            <Navbar cartTotal={cartTotal} />
            <div className="container mt-4">
                {notification.message && (
                    <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
                        {notification.message}
                    </div>
                )}

                <div className="row">
                    <div className="col-md-6 mb-4">
                        <img src={product.imageurl} alt={product.title} className="img-fluid rounded shadow-sm" style={{ maxHeight: '500px', objectFit: 'contain', width: '100%' }}/>
                    </div>

                    <div className="col-md-6">
                        <h1 className="mb-3">{product.title}</h1>
                        <p className="text-muted">{product.category}</p>
                        
                        <div className="mb-3">
                            {product.isCampaign && product.newPrice ? (
                                <>
                                    <span className="h3 text-danger me-2">${product.newPrice.toFixed(2)}</span>
                                    <span className="text-muted text-decoration-line-through">${product.price.toFixed(2)}</span>
                                </>
                            ) : (
                                <span className="h3">${product.price.toFixed(2)}</span>
                            )}
                        </div>

                        <p className="mb-4" style={{whiteSpace: 'pre-wrap'}}>{product.description}</p>

                        <div className="card p-3 mb-4 shadow-sm">
                            <h5 className="mb-3">Total Price: ${currentPrice * quantity}</h5>
                            <div className="d-flex align-items-center mb-3">
                                <label htmlFor="quantity" className="form-label me-2 mb-0">Quantity:</label>
                                <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => handleQuantityChange(-1)}>-</button>
                                <input 
                                    type="number" 
                                    id="quantity"
                                    className="form-control form-control-sm text-center me-2" 
                                    value={quantity} 
                                    onChange={handleInputChange}
                                    min="1"
                                    style={{width: '60px'}}
                                />
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => handleQuantityChange(1)}>+</button>
                            </div>

                            <button className="btn btn-primary w-100 mb-2" onClick={handleAddToCart}>Add to Cart</button>
                            <button className="btn btn-outline-success w-100" onClick={() => router.push('/cart')}>Go to Cart</button>
                        </div>
                    </div>
                </div>

                <div className="row mt-5">
                    <div className="col-12">
                        <h3 className="mb-4">Product Reviews</h3>
                        {reviews && reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review.id} className="card mb-3 shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title">{review.title}</h5>
                                        <div className="mb-2">
                                            {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
                                            <span className="ms-2 text-muted">- by {review.username}</span>
                                        </div>
                                        <p className="card-text">{review.comment}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No reviews yet. Be the first to review!</p>
                        )}

                        <div className="card mt-4 shadow-sm">
                            <div className="card-header">
                                <h4>Write a Review</h4>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleReviewSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="reviewUsername" className="form-label">Your Name:</label>
                                        <input type="text" className="form-control" id="reviewUsername" name="username" value={newReview.username} onChange={handleReviewFormChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="reviewTitle" className="form-label">Review Title:</label>
                                        <input type="text" className="form-control" id="reviewTitle" name="title" value={newReview.title} onChange={handleReviewFormChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="reviewStars" className="form-label">Rating:</label>
                                        <select className="form-select" id="reviewStars" name="stars" value={newReview.stars} onChange={handleReviewFormChange} required>
                                            <option value="5">5 Stars</option>
                                            <option value="4">4 Stars</option>
                                            <option value="3">3 Stars</option>
                                            <option value="2">2 Stars</option>
                                            <option value="1">1 Star</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="reviewComment" className="form-label">Your Review:</label>
                                        <textarea className="form-control" id="reviewComment" name="comment" rows="4" value={newReview.comment} onChange={handleReviewFormChange} required></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-success">Submit Review</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export async function getServerSideProps(context) {
    const { id } = context.params;
    let productData = null;
    let reviewsData = [];
    let error_Message = null;

    try {
        const productResponse = await axios.get(`${API_URL}/products/${id}`);
        productData = productResponse.data;

        // If product is found, get its embedded reviews
        if (productData && productData.reviews) {
            reviewsData = productData.reviews;
        } else if (productData && !productData.reviews) {
            reviewsData = [];  // Product exists but has no 'reviews' array, default to empty
        
        }

    } catch (productError) {
        console.error(`Error fetching product ${id}. Full error object:`, productError);
        error_Message = 'Failed to load product details. Please try again later.';
        if (productError.response) {
            console.error('Product Error response status:', productError.response.status);
            console.error('Product Error response data:', productError.response.data);
            if (productError.response.status === 404) {
                error_Message = 'Product not found.';
            }
        } else {
            console.error('Product Error does not have a response object. Message:', productError.message);
        }
    }

    return {
        props: {
            product: productData,
            reviews: reviewsData,
            error: error_Message,
        },
    };
}

export default ProductDetailPage; 