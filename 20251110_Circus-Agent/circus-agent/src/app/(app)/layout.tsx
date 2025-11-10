import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/signin");
  }

  return <AppShell user={session.user}>{children}</AppShell>;
}
