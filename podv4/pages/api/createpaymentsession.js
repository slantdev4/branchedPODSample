// pages/api/route.js
'use server'
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe('YOUR_STRIPE_KEY'); // Use environment variable for the key

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { amount, currency = 'usd' } = req.body;

            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency,
                payment_method_types: ['card']
            });

            res.status(200).json({ clientSecret: paymentIntent.client_secret });
        } catch (error) {
            res.status(500).json({ statusCode: 500, message: error.message });
        }
    } else {
        res.status(405).end('Method Not Allowed');
    }
};
async function createPaymentSession(amount, description, currency, origin) {
    return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency,
                product_data: {
                    name: description || 'Generic Product',
                },
                unit_amount: amount, // amount in cents
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?canceled=true`,
    });
}
