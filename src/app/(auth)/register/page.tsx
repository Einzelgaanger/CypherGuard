import { OfflineDemoNotice } from "@/components/demo/OfflineDemoNotice";

export default function RegisterPage() {
  return (
    <OfflineDemoNotice
      title="Request registration"
      description="Self-registration is not wired in the static demo. Explore the POC with mock role entry from the home page or /login."
    />
  );
}
