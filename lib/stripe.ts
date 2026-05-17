import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
