"use client";

import { toast } from "sonner";
import { PocPageHeader } from "@/poc/ui/poc-app-shell";
import { usePocAuth } from "@/poc/poc-auth-context";
import { usePocStore } from "@/poc/poc-store";

export default function TenantVisitorsPage() {
  const { user } = usePocAuth();
  const { tenantInvites, revokeInvite } = usePocStore();
  const unit = user?.unit ?? "";
  const mine = tenantInvites.filter((i) => i.tenantUnit === unit && i.status !== "revoked");

  return (
    <>
      <PocPageHeader title="My visitors" />
      <div className="overflow-hidden rounded-xl border border-cs-line bg-cs-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-cs-elevated text-[11px] font-semibold uppercase text-cs-text-secondary">
            <tr>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Purpose</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cs-line">
            {mine.map((i) => (
              <tr key={i.id}>
                <td className="px-4 py-3 font-medium">{i.guestName}</td>
                <td className="px-4 py-3 text-cs-text-secondary">{i.purpose}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-cs-purple/15 px-2 py-0.5 text-[11px] font-semibold text-cs-purple">
                    {i.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="mr-2 text-cs-accent hover:underline"
                    onClick={() => {
                      void navigator.clipboard.writeText(`${window.location.origin}/invite/${i.token}`);
                      toast.success("Link copied");
                    }}
                  >
                    Copy link
                  </button>
                  <button
                    type="button"
                    className="text-cs-red hover:underline"
                    onClick={() => {
                      revokeInvite(i.id);
                      toast.message("Invite revoked");
                    }}
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
