"use client";

import { useNotificationsCtx } from "@/app/context/NotificationsContext";

export default function Dashboard() {
  const { notifications, unreadCount, markAsRead, loading } = useNotificationsCtx();

  return (
    <div className="p-6">
      <img src="/plenitude.jpg" alt="Plenitude" width={700} height={380} />


    </div>
  );
}
