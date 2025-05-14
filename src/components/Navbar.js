import React from 'react';
import Link from 'next/link';

function Navbar({ cartTotal }) {
    const navStyle = {
        color: 'blue',
        textDecoration: 'underline',
        ontWeight: '500',
        marginRight: '20px',
        fontSize: '18px'
    };

    return (
        <div style={{ padding: '10px', borderBottom: '1px solid #eee', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            <Link href="/" style={navStyle}>
                Home
            </Link>
            <Link href="/add-campaign" style={navStyle}>
                Add Campaign
            </Link>
            <Link href="/cart" style={navStyle}>
                Cart
            </Link>
            {typeof cartTotal === 'number' && (
                <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>
                    Cart Total: ${cartTotal.toFixed(2)}
                </span>
            )}
        </div>
    );
}   

export default Navbar; // Navbar bileşenini dışarıdan kullanabilmek için export ediyoruz
