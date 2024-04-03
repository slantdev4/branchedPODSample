'use client'
import React, { useState, useContext } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useFileUrl } from '../context/fileUrlContext';
import { db } from '../../../firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const { fileData, quantity } = useFileUrl(); // Usi

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Function to send matched product to API
    const sendMatchedProductToApi = async (billingDetails) => {
        const filename = fileData.filename; // Using fileName from fileData
        const orderNumber = `ORDER_LOGIC_HERE`;

        // Generating a random SKU
        const orderSKU = `SKU_lOGIC_HERE`;
        const jsonData = {
            email: billingDetails.email,
            phone: '',
            name: billingDetails.name,
            orderNumber: orderNumber, // You need to provide order number logic
            filename: filename,
            fileURL: fileData.fileUrl,
            bill_to_street_1: billingDetails.address,
            bill_to_street_2: '',
            bill_to_street_3: '',
            bill_to_city: billingDetails.city,
            bill_to_state: billingDetails.state,
            bill_to_zip: billingDetails.zip,
            bill_to_country_as_iso: 'US', // Adjust based on your requirements
            bill_to_is_US_residential: 'true',
            ship_to_name: billingDetails.name,
            ship_to_street_1: billingDetails.address,
            ship_to_street_2: '',
            ship_to_street_3: '',
            ship_to_city: billingDetails.city,
            ship_to_state: billingDetails.state,
            ship_to_zip: billingDetails.zip,
            ship_to_country_as_iso: 'US', // Adjust as needed
            ship_to_is_US_residential: 'true',
            order_item_name: filename, // You need to provide product name logic
            order_quantity: quantity.toString(), // Using quantity from context
            order_image_url: '', // Provide image URL or handle if not available
            order_sku: orderSKU, // Provide SKU or handle if not available
            order_item_color: fileData.color, // Adjust based on your requirements
        };

        console.log(jsonData)
        const apiEndpoint = 'https://www.slant3dapi.com/api/order';
        const apiKeyValue = 'YOUR_KEY';

        try {
            const apiResponse = await axios.post(apiEndpoint, jsonData, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKeyValue
                }
            });

            console.log(`API response: ${JSON.stringify(apiResponse.data, null, 2)}`);
            // Additional logic after successful API response...
        } catch (apiError) {
            console.error(`Error sending product to API: ${apiError}`);
            setError(`Error in API call: ${apiError.message}`);
        }
    };

    const saveOrderInFirebase = async (billingDetails) => {
        // Generate a unique order ID
        const orderDocId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const orderData = {
            billingDetails,
            fileData,
            quantity,
        };

        try {
            const ordersCollectionRef = collection(db, 'orders');
            await setDoc(doc(ordersCollectionRef, orderDocId), orderData);
            console.log('Order saved to Firebase with ID:', orderDocId);
        } catch (firebaseError) {
            console.error('Error saving order to Firebase:', firebaseError);
            setError(`Error saving order to Firebase: ${firebaseError.message}`);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardElement);
        const form = event.target;
        const billingDetails = {
            name: form.name.value,
            address: form.address.value,
            city: form.city.value,
            state: form.state.value,
            zip: form.zip.value,
            email: form.email.value
        };

        try {
            const totalPriceInCents = fileData.totalPrice * 100;
            const { data: { clientSecret } } = await axios.post('/api/createpaymentsession', {
                amount: totalPriceInCents,
                currency: 'usd',
            });

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                }
            });

            if (result.error) {
                setError(result.error.message);
                setLoading(false);
                return;
            }

            if (result.paymentIntent.status === 'succeeded') {
                console.log('Payment successful');
                await sendMatchedProductToApi(billingDetails);
                // Save the order to Firebase
                await saveOrderInFirebase(billingDetails);
                router.push('/success');
            }
        } catch (error) {
            setError('Payment failed: ' + error.message);
            setLoading(false);
        }
    };

    return (
        <div>


            <form onSubmit={handleSubmit} className="bg-blue-500 p-10 rounded-2xl shadow-lg">
                {/* Name input */}
                <div className="mb-4">
                    <label htmlFor="name" className="block font-medium text-white">
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-input mt-1 px-2 block w-full rounded-2xl"
                        required
                    />
                </div>

                {/* Address input */}
                <div className="mb-4">
                    <label htmlFor="address" className="block font-medium text-white">
                        Address
                    </label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        className="form-input mt-1 px-2 block w-full rounded-2xl"
                        required
                    />
                </div>

                {/* City input */}
                <div className="mb-4">
                    <label htmlFor="city" className="block font-medium text-white">
                        City
                    </label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        className="form-input mt-1 px-2 block w-full rounded-2xl"
                        required
                    />
                </div>

                {/* State input */}
                <div className="mb-4">
                    <label htmlFor="state" className="block font-medium text-white">
                        State
                    </label>
                    <input
                        type="text"
                        id="state"
                        name="state"
                        className="form-input mt-1 px-2 block w-full rounded-2xl"
                        required
                    />
                </div>

                {/* Zip Code input */}
                <div className="mb-4">
                    <label htmlFor="zip" className="block font-medium text-white">
                        Zip Code
                    </label>
                    <input
                        type="text"
                        id="zip"
                        name="zip"
                        className="form-input mt-1 px-2 block w-full rounded-2xl"
                        required
                    />
                </div>

                {/* Email input */}
                <div className="mb-4">
                    <label htmlFor="email" className="block font-medium text-white">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-input mt-1 px-2 block w-full rounded-2xl"
                        required
                    />
                </div>

                {/* Card Element for Stripe */}
                <div className="mb-4">
                    <label htmlFor="card" className="block font-medium text-white">
                        Card Details
                    </label>
                    <div className="border-4 border-white rounded-2xl">
                        <CardElement
                            id="card"
                            options={{
                                style: {
                                    base: {
                                        backgroundColor: '#ffffff',
                                        fontSize: '16px',
                                        padding: '10px',
                                        color: '#121212',
                                        '::placeholder': {
                                            color: '#101010',
                                        },
                                    },
                                    invalid: {
                                        color: '#9e2146',
                                    },
                                },
                            }}
                        />
                    </div>

                </div>
                <div className="flex justify-end">

                    {/* Submit button */}
                    <button
                        type="submit"
                        className="px-4 py-4 my-4 bg-green-500 hover:bg-green-300 text-white rounded-2xl transition duration-500 ease-in-out"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Place Order'}
                    </button>

                    {/* Error message display */}
                    {error && <div className="text-red-500 mt-2">{error}</div>}
                </div>
                <p className="flex text-white justify-end">Gross Total: ${typeof window !== 'undefined' ? localStorage.getItem('_total') : null}</p>

            </form>
            <div className="flex justify-start my-4">
                <button
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-900 transition duration-500 text-white rounded-2xl"
                    onClick={() => router.push('/preview')}
                >
                    Back
                </button>
            </div>

        </div>
    );
};

export default PaymentForm;
