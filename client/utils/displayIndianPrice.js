const DisplayPriceInRupees=(price)=>{
    // Use absolute value for display only (to handle negative prices in view)
    const displayPrice = Math.abs(Number(price) || 0);
    return new Intl.NumberFormat('en-IN',{
        style:'currency',
        currency:'INR'
    }).format(displayPrice)
}

export default DisplayPriceInRupees