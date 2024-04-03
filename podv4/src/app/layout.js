// Assuming this file is RootLayout.js or similar
'use client'
import Navbar from './components/navbar'
import { FileUrlProvider } from './context/fileUrlContext';
import { Inter } from 'next/font/google';
import './globals.css';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
const inter = Inter({ subsets: ['latin'] });
const stripePromise = loadStripe('YOUR_STRIPE_KEY');

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Elements stripe={stripePromise}>
        <FileUrlProvider>

          <body className={inter.className}>
            <Navbar />
            {children}
          </body>
        </FileUrlProvider>
      </Elements>

    </html>
  );
}
