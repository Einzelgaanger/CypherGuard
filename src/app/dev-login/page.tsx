import { OfflineDemoNotice } from "@/components/demo/OfflineDemoNotice";

export default function DevLoginPage() {
  return (
    <OfflineDemoNotice
      title="Developer login"
      description="Database-backed dev login has been removed from this build. Use the home page or /login for instant mock role entry."
    />
  );
}
