import { redirect } from "next/navigation";

// Legacy route kept only for navigation compatibility.
// The target admin route requires server-side authentication before production.
export default function LegacyUsersRoute() {
  redirect("/admin/ulanyjylar");
}
