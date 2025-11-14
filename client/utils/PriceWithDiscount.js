export const PriceWithDiscount =(price,dis=1)=>{
    // Use absolute value for price to prevent negative prices from affecting calculations
    const absPrice = Math.abs(Number(price) || 0);
    if (!dis || dis <= 0) return absPrice;
    const discountAmount = Math.ceil((absPrice * Number(dis)) /100)
    const actualPrice = absPrice - Number(discountAmount);
    return actualPrice;
}