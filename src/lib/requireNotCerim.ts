import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export function requireNotCerim() {
  if (cookies().get("cerim_managing")?.value) redirect("/dashboard");
}
