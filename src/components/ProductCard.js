import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const ProductCard = ({ product }) => {
    const router = useRouter();

    const averageRating = useMemo(() => {
        if (!product.reviews || product.reviews.length === 0) return 0;
        const totalStars = product.reviews.reduce((sum, review) => sum + review.stars, 0);
        return (totalStars / product.reviews.length).toFixed(1);
    }, [product.reviews]);

    const handleAddToCart = async (e) => {
        e.stopPropagation(); 
        try {
            const cartResponse = await axios.get('http://localhost:3001/cart');
            const cartItems = cartResponse.data;
            const existingCartItem = cartItems.find(item => item.productId === product.id);
            
            if (existingCartItem) {
                // If product exists in cart, update quantity
                await axios.patch(`http://localhost:3001/cart/${existingCartItem.id}`, {
                    quantity: existingCartItem.quantity + 1
                });
            } else {
                await axios.post('http://localhost:3001/cart', {
                    productId: product.id,
                    quantity: 1
                });
            }
            alert('Product added to cart!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add product to cart');
        }
    };

    const handleProductClick = () => {
        console.log('Product ID:', product.id); 
        router.push(`/products/${product.id}`); // go to product[id] detail page
    };

    
    const renderStars = (rating) => {
        return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    };

    const formatPrice = (price) => {
        if (price === undefined || price === null) return <span>$0.00</span>;
        
        const priceStr = typeof price === 'number' ? price.toFixed(2) : price.toString();
        const [dollars, cents] = priceStr.split('.');
        return (
            <>
                <span>${dollars}</span>
                <span className="superscript">{cents || '00'}</span>
            </>
        );
    };

    return (
        <div className="card product-card">
            <div onClick={handleProductClick} style={{ cursor: 'pointer' }}>
                <img 
                    src={product.imageurl} 
                    alt={product.title} 
                    className="card-img-top product-image"
                />
                <div className="card-body">
                    <h5 className="product-title">{product.title}</h5>
                    
                    <div className="product-rating">
                        <span className="stars">{renderStars(averageRating)}</span>
                        <span className="rating-value">({averageRating})</span>
                    </div>

                    <div className="price-section">
                        <p className="product-price mb-0">
                            {formatPrice(product.isCampaign ? product.newPrice : product.price)}
                        </p>
                        {product.isCampaign && (
                            <p className="original-price text-muted text-decoration-line-through mb-0">
                                {formatPrice(product.price)}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/*Add to Cart Button */}
            <div className="card-footer bg-transparent border-top-0">
                <button 
                    className="btn btn-primary w-100"
                    onClick={handleAddToCart}
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductCard;

