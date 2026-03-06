"use client";

import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

// Make sure to replace with your actual public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// --- Mock Product Data ---
// In a real app, you would fetch this from your database/API
const products = [
  {
    name: 'TMI Pro Membership',
    description: 'Unlock exclusive content, badges, and early access.',
    price: '$9.99 / month',
    priceId: 'price_1P6dMANYjA3ywpD8f1234567', // IMPORTANT: Replace with a real Price ID from your Stripe account
  },
];

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { session } = await response.json();
      if (!session) {
        throw new Error('Could not create checkout session.');
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe.js not loaded.');
      }

      const stripeClient = stripe as unknown as { redirectToCheckout?: (opts: { sessionId: string }) => Promise<{ error?: { message: string } }> };
      const redirectResult = stripeClient.redirectToCheckout
        ? await stripeClient.redirectToCheckout({ sessionId: session.id })
        : { error: { message: 'Stripe client unavailable' } };
      if (redirectResult.error) {
        throw new Error(redirectResult.error.message);
      }

    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white p-8">
      <h1 className="text-3xl font-bold text-purple-400 mb-8">Billing & Subscriptions</h1>
      
      <div className="bg-white/5 p-6 rounded-lg max-w-md mx-auto">
        {products.map((product) => (
          <div key={product.priceId}>
            <h2 className="text-2xl font-semibold text-purple-300">{product.name}</h2>
            <p className="text-gray-400 mt-2">{product.description}</p>
            <p className="text-3xl font-bold my-6">{product.price}</p>
            
            <button
              onClick={() => handleCheckout(product.priceId)}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 px-6 py-3 rounded-full text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>
        ))}
        {error && (
            <p className="text-red-400 mt-4 text-center">{error}</p>
        )}
      </div>
       <div className="text-center mt-4 text-xs text-gray-500">
           <p>Note: This is a demo. Replace the hardcoded Price ID in `billing/page.tsx` with one from your Stripe dashboard.</p>
       </div>
    </div>
  );
}
