import Link from 'next/link';
import { useEffect } from 'react';

function Carousel({campaignItems}) {
    useEffect(() => {
        require('bootstrap/dist/js/bootstrap.bundle.min.js');
    }, []);

    return (
        <div className="container my-4">
            <div id="carousel" className="carousel slide" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="carousel-indicators">
                    {campaignItems.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            data-bs-target="#carousel"
                            data-bs-slide-to={index}
                            className={index === 0 ? 'active' : ''}
                            aria-current={index === 0 ? 'true' : 'false'}
                            aria-label={`Slide ${index + 1}`}
                        />
                    ))}
                </div>
                
                <div className="carousel-inner">
                    {campaignItems.map((product, index) => (
                        <div key={product.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                            <Link href={`/products/${ product.id}`} className="text-decoration-none">
                                <div className="row align-items-center">
                                    <div className="col-12">
                                        <img 
                                            src={product.imageurl} 
                                            className="d-block w-100"
                                            alt={product.title}
                                            style={{ 
                                                height: '400px',
                                                objectFit: 'cover',
                                                cursor: 'pointer'
                                            }} 
                                        />
                                        <div className="carousel-caption d-none d-md-block">
                                            <h5>{product.title}</h5>
                                            <p>
                                                <span className="text-decoration-line-through me-2">{product.price} $</span>
                                                <span className="text-danger">{product.newPrice} $</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Carousel next buttons */}
                <button className="carousel-control-prev" type="button" data-bs-target="#carousel" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carousel" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>
        </div>
    );
}

export default Carousel;
