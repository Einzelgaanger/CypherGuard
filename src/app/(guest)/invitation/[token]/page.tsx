import { OfflineDemoNotice } from "@/components/demo/OfflineDemoNotice";

export default function InvitationTokenPage() {
  return (
    <OfflineDemoNotice
      title="Guest invitation"
      description="Invitation links that load live guest data are disabled in the static demo. Use /invite/[token] for the POC invite preview or /visitor-portal for the kiosk mock."
    />
  );
}
