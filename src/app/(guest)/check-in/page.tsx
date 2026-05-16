import { OfflineDemoNotice } from "@/components/demo/OfflineDemoNotice";

export default function GuestCheckInPage() {
  return (
    <OfflineDemoNotice
      title="Guest check-in"
      description="Guest registration against a live backend is disabled. Try /visitor-portal or the guard POC at /guard for the mock flows."
    />
  );
}
