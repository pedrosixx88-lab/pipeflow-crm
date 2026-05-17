import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { asTyped } from "@/lib/supabase/typed-client";
import { getPlanUsage } from "@/lib/limits";
import { BillingClient } from "@/components/settings/billing-client";

export const dynamic = "force-dynamic";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const supabase = asTyped(await createClient());
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();

  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const workspaceId = cookieStore.get("pf_workspace_id")?.value;

  let activeWorkspaceId: string | undefined = workspaceId;
  if (!activeWorkspaceId) {
    const { data } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();
    activeWorkspaceId = data?.workspace_id ?? undefined;
  }

  if (!activeWorkspaceId) redirect("/dashboard");

  const [workspaceRes, subscriptionRes, isAdminRes, usage] = await Promise.all([
    supabase
      .from("workspaces")
      .select("id, name, plan, stripe_customer_id, stripe_subscription_id")
      .eq("id", activeWorkspaceId)
      .single(),

    supabase
      .from("subscriptions")
      .select("status, current_period_end, cancel_at_period_end, canceled_at")
      .eq("workspace_id", activeWorkspaceId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", activeWorkspaceId)
      .eq("user_id", user.id)
      .eq("role", "admin")
      .eq("status", "active")
      .single(),

    getPlanUsage(supabase as unknown as Parameters<typeof getPlanUsage>[0], activeWorkspaceId),
  ]);

  if (!workspaceRes.data) redirect("/dashboard");

  const params = await searchParams;

  return (
    <BillingClient
      workspace={workspaceRes.data}
      subscription={subscriptionRes.data ?? null}
      isAdmin={!!isAdminRes.data}
      successMessage={params.success === "1"}
      canceledMessage={params.canceled === "1"}
      leadCount={usage.leadCount}
      memberCount={usage.memberCount}
    />
  );
}
