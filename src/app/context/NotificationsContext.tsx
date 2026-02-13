"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

export type Notification = {
  id: string;
  type: string;
  message: string;
  //  eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
  read: boolean;
  createdAt: string;
};

type ApiResponse = {
  success: boolean;
  notifications: Notification[];
};

type Ctx = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationsContext = createContext<Ctx | null>(null);

export function NotificationsProvider({
  children,
  token,
}: {
  children: React.ReactNode;
  token: string | null;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // guarda IDs já vistos pra saber o que é novo
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  async function refresh() {
    if (!token) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}notifications/getNotifications`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );

      if (!res.ok) return;

      const data: ApiResponse = await res.json();
      if (!data?.success) return;

      const next = data.notifications || [];

      // ✅ TOAST somente para novas notificações (após o primeiro load)
      if (!isFirstLoadRef.current) {
        const seen = seenIdsRef.current;

        // novas = ids que não existiam ainda
        const newOnes = next
          .filter((n) => !seen.has(n.id))
          .filter((n) => !n.read); // se vier já lida, ignora

        // dispara toast para as novas (padrão: 10s)
        for (const n of newOnes) {
          toast(n.message, {
            autoClose: 10000,
            pauseOnHover: true,
            closeOnClick: true,
          });
        }
      }

      // atualiza "seen"
      const seen = seenIdsRef.current;
      next.forEach((n) => seen.add(n.id));

      setNotifications(next);
      isFirstLoadRef.current = false;
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    if (!token) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}notifications/read`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) await refresh();
  }

  async function markAllAsRead() {
    // se você tiver endpoint próprio, melhor.
    // se não tiver, marca uma por uma (rápido se forem poucas)
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    for (const id of unreadIds) {
      // eslint-disable-next-line no-await-in-loop
      await markAsRead(id);
    }
  }

  useEffect(() => {
    // reset quando trocar token
    seenIdsRef.current = new Set();
    isFirstLoadRef.current = true;

    refresh();
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, loading, refresh, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsCtx() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotificationsCtx must be used within NotificationsProvider");
  return ctx;
}
