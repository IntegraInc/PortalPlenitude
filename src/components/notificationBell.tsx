// // src/components/NotificationBell.tsx
// "use client";

// import { useMemo, useState } from "react";
// import { useNotifications } from "../app/hooks/useNotifications";

// export default function NotificationBell({ token }: { token: string | null }) {
//   const { notifications, unreadCount, markAsRead } = useNotifications(token);
//   const [open, setOpen] = useState(false);

//   const items = useMemo(() => notifications, [notifications]);

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setOpen((v) => !v)}
//         className="relative px-2 py-1"
//         aria-label="Notificações"
//       >
//         🔔
//         {unreadCount > 0 && (
//           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5">
//             {unreadCount}
//           </span>
//         )}
//       </button>

//       {open && (
//         <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-lg border z-50 overflow-hidden">
//           <div className="px-3 py-2 border-b flex items-center justify-between">
//             <p className="text-sm font-semibold">Notificações</p>
//             <button
//               className="text-xs text-gray-500 hover:text-gray-700"
//               onClick={() => setOpen(false)}
//             >
//               fechar
//             </button>
//           </div>

//           <div className="max-h-96 overflow-y-auto">
//             {items.length === 0 ? (
//               <p className="text-sm text-gray-500 px-3 py-3">
//                 Nenhuma notificação
//               </p>
//             ) : (
//               items.map((n) => (
//                 <button
//                   key={n.id}
//                   onClick={() => markAsRead(n.id)}
//                   className={`w-full text-left px-3 py-3 border-b hover:bg-gray-50 ${!n.read ? "font-semibold" : "text-gray-600"
//                     }`}
//                 >
//                   <div className="text-sm">{n.message}</div>
//                   <div className="text-[11px] text-gray-400 mt-1">
//                     {new Date(n.createdAt).toLocaleString("pt-BR")}
//                   </div>
//                 </button>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
