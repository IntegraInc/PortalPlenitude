import { cookies } from "next/headers";
import SidebarNavigation from "@/components/SidebarNavigation";
import { NotificationsProvider } from "@/app/context/NotificationsContext";
import ToastClient from "@/components/ToastClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("userToken")?.value || null;

  return (
    <NotificationsProvider token={token}>
      <ToastClient />
      <div className="flex h-screen bg-gray-50">
        <SidebarNavigation />

        {/* aqui você já deve ter um padding/margin por causa do sidebar */}
        <main className="flex-1 overflow-y-auto p-3 ml-16 transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>
    </NotificationsProvider>
  );
}
