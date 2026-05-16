import { redirect } from "next/navigation";

/** Legacy Convex dashboard — POC shell lives at `/admin`. */
export default function LegacyAdminDashboardRedirect() {
  redirect("/admin");
}
