// // src/hooks/useNotifications.ts
// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";

// export type Notification = {
//  id: string;
//  type: string;
//  message: string;
//  //  eslint-disable-next-line @typescript-eslint/no-explicit-any
//  metadata?: any;
//  read: boolean;
//  createdAt: string;
// };

// type ApiResponse = {
//  success: boolean;
//  notifications: Notification[];
// };

// export function useNotifications(token: string | null) {
//  const [notifications, setNotifications] = useState<Notification[]>([]);
//  const [loading, setLoading] = useState(false);
//  const lastSigRef = useRef<string>("");

//  const unreadCount = useMemo(
//   () => notifications.filter((n) => !n.read).length,
//   [notifications]
//  );

//  async function fetchNotifications() {
//   if (!token) return;

//   try {
//    setLoading(true);

//    const res = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL}notifications/getNotifications`,
//     {
//      method: "GET",
//      headers: { Authorization: `Bearer ${token}` },
//      cache: "no-store",
//     }
//    );

//    console.log(res, "resposta das notificações");

//    if (!res.ok) return;

//    const data: ApiResponse = await res.json();
//    if (!data?.success) return;

//    // evita re-render atoa se nada mudou (simples e efetivo)
//    const sig = JSON.stringify(
//     (data.notifications || []).map((n) => [n.id, n.read, n.createdAt])
//    );

//    if (sig !== lastSigRef.current) {
//     lastSigRef.current = sig;
//     setNotifications(data.notifications || []);
//    }
//   } finally {
//    setLoading(false);
//   }
//  }

//  async function markAsRead(id: string) {
//   if (!token) return;

//   // otimista (pra badge cair na hora)
//   setNotifications((prev) =>
//    prev.map((n) => (n.id === id ? { ...n, read: true } : n))
//   );

//   const res = await fetch(
//    `${process.env.NEXT_PUBLIC_API_URL}notifications/read`,
//    {
//     method: "POST",
//     headers: {
//      Authorization: `Bearer ${token}`,
//      "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ id }),
//    }
//   );

//   // se der ruim, refaz fetch pra garantir consistência
//   if (!res.ok) {
//    await fetchNotifications();
//   }
//  }

//  useEffect(() => {
//   fetchNotifications(); // no login/mount
//   const t = setInterval(fetchNotifications, 30000); // polling 30s
//   return () => clearInterval(t);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//  }, [token]);

//  return {
//   notifications,
//   unreadCount,
//   loading,
//   refresh: fetchNotifications,
//   markAsRead,
//  };
// }
