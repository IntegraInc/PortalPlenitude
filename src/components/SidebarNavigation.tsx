/* eslint-disable @next/next/no-img-element */
"use client";

import { useNotificationsCtx } from "@/app/context/NotificationsContext";
import { DestroyCookies } from "@/services/destroyCookies";
import {
  FolderIcon,
  HomeIcon,
  ChartBarSquareIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type NavItem = {
  name: string;
  href?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  disabled?: boolean;
  onClick?: () => void;
};

const getNavigation = (toggleNotif: () => void): NavItem[] => [
  {
    name: "Notificações",
    icon: BellIcon,
    onClick: toggleNotif,
    disabled: false,
  },
  {
    name: "Tela inicial",
    href: "/",
    icon: HomeIcon,
    disabled: false,
  },
  {
    name: "Análise de Reposição",
    href: "/analisereposicao?familia=904",
    icon: ChartBarSquareIcon,
    disabled: false,
  },
  {
    name: "Tabela de Preço",
    href: "/tabelapreco",
    icon: FolderIcon,
    disabled: false,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function SidebarNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const { unreadCount, notifications, markAsRead, markAllAsRead } =
    useNotificationsCtx();

  const [openNotif, setOpenNotif] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
    setTimeout(() => setIsOpen(true), 50);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTimeout(() => setIsOpen(false), 100);
  };

  const navigation = useMemo(
    () => getNavigation(() => setOpenNotif((v) => !v)),
    []
  );

  return (
    <div
      className={classNames(
        "fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-gray-200 bg-white shadow-md transition-all duration-300 ease-in-out overflow-hidden",
        isOpen ? "w-64" : "w-16"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center overflow-hidden border-b border-gray-100 relative">
        <img
          src="/plenitudesemfundo.png"
          alt="Plenitude"
          className={classNames(
            "absolute transition-all duration-300 ease-in-out",
            isOpen ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"
          )}
          style={{
            width: "32px",
            height: "32px",
            transform: isOpen ? "scale(0.5) rotate(90deg)" : "scale(1) rotate(0deg)",
          }}
        />

        <img
          src="/plenitude.jpg"
          alt="Plenitude"
          className={classNames(
            "absolute transition-all duration-300 ease-in-out",
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-150"
          )}
          style={{
            width: "180px",
            transform: isOpen ? "scale(1)" : "scale(1.5)",
          }}
        />
      </div>

      {/* Navegação */}
      <nav className="flex flex-1 flex-col px-2 py-4">
        <ul role="list" className="space-y-1">
          {navigation.map((item) => {
            const isLink = !!item.href;

            // pathname não inclui querystring, então normaliza:
            const baseHref = (item.href ?? "").split("?")[0];

            const isActive = isLink
              ? baseHref === "/"
                ? pathname === "/"
                : pathname === baseHref || pathname.startsWith(baseHref)
              : openNotif;

            const showBadge = item.name === "Notificações" && unreadCount > 0;

            const commonClass = classNames(
              isActive
                ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600 border-transparent",
              "group w-full cursor-pointer flex items-center rounded-lg p-2 text-sm font-semibold transition-all duration-200 border",
              isOpen ? "gap-x-3 justify-start" : "justify-center"
            );

            const Icon = item.icon;

            const inner = (
              <>
                <span className="relative inline-flex">
                  <Icon
                    className={classNames(
                      isActive
                        ? "text-indigo-600"
                        : "text-gray-400 group-hover:text-indigo-600",
                      "h-5 w-5 shrink-0 transition-all duration-200"
                    )}
                  />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </span>

                <span
                  className={classNames(
                    "transition-all duration-300 ease-in-out whitespace-nowrap",
                    isOpen
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2 absolute"
                  )}
                >
                  {item.name}
                </span>
              </>
            );

            return (
              <li key={item.name} className="relative">
                {item.disabled ? (
                  <div
                    className={classNames(
                      "group flex items-center rounded-lg p-2 text-sm font-semibold leading-6 text-gray-400 cursor-not-allowed opacity-50 transition-all duration-200",
                      isOpen ? "gap-x-3 justify-start" : "justify-center"
                    )}
                    title="Em breve"
                  >
                    {inner}
                  </div>
                ) : isLink ? (
                  <Link
                    href={item.href!}
                    className={commonClass}
                    title={!isOpen ? item.name : ""}
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className={commonClass}
                    title={!isOpen ? item.name : ""}
                  >
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {/* Encerrar sessão */}
        <button
          onClick={() => {
            DestroyCookies();
            router.push("/login");
          }}
          className={classNames(
            "group flex items-center rounded-lg p-2 mt-auto text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-transparent hover:border-red-100 cursor-pointer",
            isOpen ? "gap-x-3 justify-start" : "justify-center"
          )}
          title={!isOpen ? "Encerrar sessão" : ""}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={classNames(
              "h-5 w-5 text-gray-400 group-hover:text-red-600 transition-all duration-200"
            )}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3h-8.25m0 0l3-3m-3 3l3 3"
            />
          </svg>
          <span
            className={classNames(
              "transition-all duration-300 ease-in-out whitespace-nowrap cursor-pointer",
              isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 absolute"
            )}
          >
            Encerrar sessão
          </span>
        </button>
      </nav>

      {/* MODAL CENTRAL - fora do sidebar */}
      <Dialog
        open={openNotif}
        onClose={setOpenNotif}
        className="relative z-[9999]"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="min-w-0">
                <Dialog.Title className="text-base font-semibold">
                  Notificações
                </Dialog.Title>
                <p className="text-xs text-gray-500 mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} novas` : "Nenhuma nova"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    onClick={async () => {
                      await markAllAsRead();
                      // se quiser fechar após marcar todas, descomenta:
                      // setOpenNotif(false);
                    }}
                  >
                    Marcar todas como lidas
                  </button>
                )}

                <button
                  className="text-xs text-gray-500 hover:text-gray-700"
                  onClick={() => setOpenNotif(false)}
                >
                  Fechar
                </button>
              </div>
            </div>

            <div className="max-h-[65vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">
                  Nenhuma notificação.
                </div>
              ) : (
                <ul className="divide-y">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={classNames(
                        "p-4 flex items-start justify-between gap-4",
                        !n.read ? "bg-green-50" : "bg-white"
                      )}
                    >
                      <div className="min-w-0">
                        <p
                          className={classNames(
                            "text-sm break-words",
                            !n.read ? "font-semibold" : "text-gray-700"
                          )}
                        >
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>

                      {!n.read && (
                        <button
                          onClick={async () => {
                            await markAsRead(n.id);
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
                        >
                          Marcar como lida
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-4 py-3 border-t flex items-center justify-end">
              <button
                onClick={() => setOpenNotif(false)}
                className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
