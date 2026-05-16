import { OfflineDemoNotice } from "@/components/demo/OfflineDemoNotice";

export default function ResidentDashboardPage() {
  return (
    <OfflineDemoNotice
      title="Legacy resident dashboard"
      description="The original resident dashboard used a live database. For the mock experience, use the landing page to enter the resident POC at /tenant."
    />
  );
}
