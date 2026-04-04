"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  APPLICATION_STATUS_OPTIONS,
  getStatusColor,
  normalizeApplicationStatus,
  type ApplicationStatus,
} from "@/lib/application-status";

type StatusDropdownProps = {
  id: string;
  currentStatus: string;
};

export default function StatusDropdown({
  id,
  currentStatus,
}: StatusDropdownProps) {
  const router = useRouter();
  const normalizedCurrentStatus =
    normalizeApplicationStatus(currentStatus) ?? "applied";
  const [status, setStatus] = useState<ApplicationStatus>(normalizedCurrentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as ApplicationStatus;
    setStatus(newStatus);
    setIsUpdating(true);

    try {
      const response = await fetch("/api/applications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status.");
      }

      router.refresh();
    } catch {
      setStatus(normalizedCurrentStatus);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <select
      value={status}
      onChange={(e) => {
        void handleChange(e);
      }}
      disabled={isUpdating}
      className={`rounded-full border border-transparent px-2 py-1 text-sm font-medium ${getStatusColor(status)} disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {APPLICATION_STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
