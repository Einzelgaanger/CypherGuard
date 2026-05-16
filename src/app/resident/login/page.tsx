import { OfflineDemoNotice } from "@/components/demo/OfflineDemoNotice";

export default function ResidentLoginPage() {
  return (
    <OfflineDemoNotice
      title="Resident sign-in"
      description="Email and password login is disabled in the static demo. Use /login or the home page to open the resident mock at /tenant."
    />
  );
}
