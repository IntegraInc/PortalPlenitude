"use client";

import { DestroyCookies } from "@/services/destroyCookies";
import {
  FolderIcon,
  HomeIcon,
  ChartBarSquareIcon,
} from "@heroicons/react/24/outline";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navigation = [
  {
    name: "Tela inicial",
    href: "/",
    icon: HomeIcon,
  },
  {
    name: "Análise de Reposição",
    href: "/analisereposicao",
    icon: ChartBarSquareIcon,
  },
  {
    name: "Tabela de Preço",
    href: "/tabelapreco",
    icon: FolderIcon,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

// 🔥 Função para apagar cookie no client

export default function SidebarNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="relative flex w-64 flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center">
        <img src="/plenitude.jpg" alt="Plenitude" width={700} height={380} />
      </div>

      {/* Navegação */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (pathname.startsWith(item.href) && item.href !== "/");

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={classNames(
                        isActive
                          ? "bg-gray-50 text-indigo-600"
                          : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                        "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors"
                      )}
                    >
                      <item.icon
                        aria-hidden="true"
                        className={classNames(
                          isActive
                            ? "text-indigo-600"
                            : "text-gray-400 group-hover:text-indigo-600",
                          "h-6 w-6 shrink-0"
                        )}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}

              {/* Botão Encerrar Sessão */}
              <li className="mt-auto border-t border-gray-200 pt-4">
                <button
                  onClick={() => {
                    DestroyCookies();
                  }}
                  className="group flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
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
                  Encerrar sessão
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}
