"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/(app)/actions";
import { useState } from "react";

export function LogoutButton() {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    await signOut();
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
      title="Sair"
      disabled={pending}
      onClick={handleClick}
    >
      <LogOut className="size-3.5" />
    </Button>
  );
}
