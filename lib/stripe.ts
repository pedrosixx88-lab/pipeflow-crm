import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) throw new Error("STRIPE_SECRET_KEY não configurada");

export const stripe = new Stripe(stripeKey, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});

export async function getOrCreateStripeCustomer(
  workspaceId: string,
  existingCustomerId: string | null,
  email: string,
  workspaceName: string,
): Promise<string> {
  if (existingCustomerId) return existingCustomerId;

  const customer = await stripe.customers.create({
    email,
    name: workspaceName,
    metadata: { workspace_id: workspaceId },
  });

  return customer.id;
}
