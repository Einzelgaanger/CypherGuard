import { OfflineDemoNotice } from "@/components/demo/OfflineDemoNotice";

export default function MigrationPage() {
  return (
    <OfflineDemoNotice
      title="Data migration"
      description="Migration tools require a live backend. This repository is running as a static UI demo only."
    />
  );
}
