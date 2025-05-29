export const formatPrice = (price: number): string => {
    // Convert to string with 2 decimal places
    const priceStr = price.toFixed(2);
    
    // Split into whole and decimal parts
    const [whole, decimal] = priceStr.split('.');
    
    // Format the whole number part with commas
    const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Return the formatted price with decimal
    return `$${formattedWhole}.${decimal}`;
}; 