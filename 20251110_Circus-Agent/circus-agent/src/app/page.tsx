import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function RootRedirectPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  redirect("/signin");
}
