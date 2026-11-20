import { redirect } from "next/navigation";

// Legacy route kept only for navigation compatibility.
// Server-side administrator checks are required before production use.
export default function LegacySettingsRoute() {
  redirect("/admin/sazlamalar");
}
