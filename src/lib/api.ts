const getApiUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return 'https://ecommerce-website-smma.onrender.com';
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
};

export const API_URL = getApiUrl();

export const endpoints = {
    products: `${API_URL}/api/products`,
    productIds: `${API_URL}/api/product-ids`,
    recommendations: `${API_URL}/api/recommendations`,
    trending: `${API_URL}/api/trending`,
    search: `${API_URL}/search`,
    purchase: `${API_URL}/api/purchase`,
    boughtTogether: `${API_URL}/api/bought-together`,
}; 