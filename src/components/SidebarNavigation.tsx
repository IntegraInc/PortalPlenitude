"use client";

import { DestroyCookies } from "@/services/destroyCookies";
import {
  FolderIcon,
  HomeIcon,
  ChartBarSquareIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navigation = [
  {
    name: "Tela inicial",
    href: "/",
    icon: HomeIcon,
    disabled: false,
  },
  {
    name: "Análise de Reposição",
    href: "/analisereposicao",
    icon: ChartBarSquareIcon,
    disabled: false,
  },
  {
    name: "Tabela de Preço",
    href: "/tabelapreco",
    icon: FolderIcon,
    disabled: true,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function SidebarNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={classNames(
        "fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-gray-200 bg-white shadow-md transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-16"
      )}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center overflow-hidden">
        {isOpen ? (
          <img
            src="/plenitude.jpg"
            alt="Plenitude"
            className="w-32 transition-opacity"
          />
        ) : (
          <img
            src="/plenitude.jpg"
            alt="Plenitude"
            className="w-8 h-8 rounded-full transition-all"
          />
        )}
      </div>

      {/* Navegação */}
      <nav className="flex flex-1 flex-col px-2 mt-4">
        <ul role="list" className="space-y-2">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href) && item.href !== "/");

            return (
              <li key={item.name}>
                {item.disabled ? (
                  <div
                    className="group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 cursor-not-allowed opacity-50"
                    title="Em breve"
                  >
                    <item.icon className="h-6 w-6 shrink-0 text-gray-300" />
                    {isOpen && <span>{item.name}</span>}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={classNames(
                      isActive
                        ? "bg-gray-100 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                      "group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold transition-all"
                    )}
                    title={!isOpen ? item.name : ""}
                  >
                    <item.icon
                      className={classNames(
                        isActive
                          ? "text-indigo-600"
                          : "text-gray-400 group-hover:text-indigo-600",
                        "h-6 w-6 shrink-0"
                      )}
                    />
                    {isOpen && <span>{item.name}</span>}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* Botão Encerrar Sessão */}
        <button
          onClick={() => {
            DestroyCookies();
            router.push("/login");
          }}
          className="group flex items-center gap-x-3 rounded-md p-2 mt-auto text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-all"
          title={!isOpen ? "Encerrar sessão" : ""}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 text-gray-400 group-hover:text-red-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3h-8.25m0 0l3-3m-3 3l3 3"
            />
          </svg>
          {isOpen && <span>Encerrar sessão</span>}
        </button>
      </nav>
    </div>
  );
}
