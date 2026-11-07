export function validSecret() {
  return /^(sk_test_|sk_live_)[A-Za-z0-9]+$/.test(process.env.PAYSTACK_SECRET_KEY || '');
}

export function checkoutEnabled() {
  return process.env.PAYSTACK_CHECKOUT_ENABLED === 'true' && validSecret();
}

export async function paystackRequest(endpoint: string, init: RequestInit = {}) {
  const res = await fetch(`https://api.paystack.co${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok || !data.status) throw new Error(data.message || 'Paystack error.');
  return data.data;
}
