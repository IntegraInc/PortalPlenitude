import SidebarNavigation from "@/components/SidebarNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar fixa à esquerda */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white">
        <SidebarNavigation />
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
