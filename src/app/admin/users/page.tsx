import { redirect } from "next/navigation";

/** Legacy route — tenant management is under `/admin/tenants` in the POC shell. */
export default function LegacyAdminUsersRedirect() {
  redirect("/admin/tenants");
}
