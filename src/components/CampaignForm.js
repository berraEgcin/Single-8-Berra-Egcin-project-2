import React, { useState } from 'react';
import axios from 'axios';

const CampaignForm = () => {
    const [productId, setProductId] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [message, setMessage] = useState(''); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!productId || !newPrice) {
            setMessage('Please enter both Product ID and New Price.');
            return;
        }

        const numProductId = parseInt(productId);
        const numNewPrice = parseFloat(newPrice);

        if (isNaN(numProductId) || isNaN(numNewPrice)) {
            setMessage('Product ID and New Price must be numbers.');
            return;
        }

        try {
            // fetch the product
            const productResponse = await axios.get(`http://localhost:3001/products/${numProductId}`);
            const product = productResponse.data;

            if (!product) {
                setMessage(`Product with ID ${numProductId} not found.`);
                return;
            }

           
            if (product.isCampaign) {
                setMessage(`Product ID ${numProductId} is already part of a campaign.`);
                return;
            }
            if (product.price <= numNewPrice) {
                setMessage(`New price ($${numNewPrice}) must be lower than the original price ($${product.price}).`);
                return;
            }

            await axios.patch(`http://localhost:3001/products/${numProductId}`, {
                isCampaign: true,
                newPrice: numNewPrice
            });

            //add to campaignItems
            await axios.post('http://localhost:3001/campaignItems', {
                productId: numProductId,
                newPrice: numNewPrice
            });
            
            setMessage(`Product ID ${numProductId} successfully added to campaign with new price $${numNewPrice}.`);
            setProductId('');
            setNewPrice('');

        } catch (error) {
            console.error('Error processing campaign:', error);
            if (error.response && error.response.status === 404) {
                setMessage(`Product with ID ${numProductId} not found.`);
            } else {
                setMessage('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header">
                    <h3>Add Product to Campaign</h3>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="productId" className="form-label">Product ID:</label>
                            <input
                                type="number"
                                className="form-control"
                                id="productId"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                                placeholder="Enter product ID"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="newPrice" className="form-label">New Campaign Price:</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                id="newPrice"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                placeholder="Enter new price"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Add to Campaign</button>
                    </form>
                    {message && (
                        <div className={`alert mt-3 ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`} role="alert">
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignForm;
