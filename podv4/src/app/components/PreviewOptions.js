// PreviewOptions.js
'use client'
import React, { useEffect, useState } from 'react';
import { useFileUrl } from '../context/fileUrlContext';

const PreviewOptions = ({ slicerResponse }) => {
    const { quantity, updateQuantity, fileData, setFileData, updateColor } = useFileUrl();
    const price = (slicerResponse?.data?.price || 0).toFixed(2); // Format the price with 2 decimal places

    // Ensure that fileData.totalPrice is a number before using toFixed()
    const initialTotalPrice = typeof fileData.totalPrice === 'number' ? fileData.totalPrice.toFixed(2) : '0.00';
    const [totalPrice, setTotalPrice] = useState(initialTotalPrice);

    useEffect(() => {
        const newTotalPrice = (price * quantity).toFixed(2); // Format the calculated total price
        setTotalPrice(newTotalPrice);
        setFileData({ ...fileData, totalPrice: parseFloat(newTotalPrice) }); // Ensure it's stored as a number
        if (typeof window !== 'undefined') {
            localStorage.setItem('_total', newTotalPrice)
        }
    }, [quantity, price]);

    const handleQuantityChange = (newQuantity) => {
        if (!isNaN(newQuantity) && newQuantity >= 1) {
            updateQuantity(newQuantity);
        }
    };

    const increaseQuantity = () => handleQuantityChange(quantity + 1);
    const decreaseQuantity = () => handleQuantityChange(Math.max(1, quantity - 1));

    const colors = ['black', 'gray', 'white'];

    const handleColorChange = (color) => {
        updateColor(color);
    };

    return (
        <div className="flex flex-col items-center mt-4">
            <div className="flex items-center mb-4">
                <button
                    className="px-3 py-2 bg-blue-500 text-white rounded-l hover:bg-blue-700 transition duration-300"
                    onClick={decreaseQuantity}
                >
                    -
                </button>
                <span className="px-4 py-2 border-t border-b">{quantity}</span>
                <button
                    className="px-3 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-700 transition duration-300"
                    onClick={increaseQuantity}
                >
                    +
                </button>

                <label htmlFor="color" className="font-bold ml-4 mr-2">Color:</label>
                <div className="flex">
                    {colors.map((color) => (
                        <div
                            key={color}
                            style={{ backgroundColor: color, border: fileData.color === color ? '2px solid blue' : '1px solid #ccc' }}
                            className="w-6 h-6 mr-2 cursor-pointer"
                            onClick={() => handleColorChange(color)}
                        />
                    ))}
                </div>
            </div>

            <div>
                <span className="text-lg font-semibold">Price: ${totalPrice}</span>
            </div>
        </div>
    );
};

export default PreviewOptions;
