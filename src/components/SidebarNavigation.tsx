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
    href: "/analisereposicao?familia=904",
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
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
    setTimeout(() => setIsOpen(true), 50);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTimeout(() => setIsOpen(false), 100);
  };

  return (
    <div
      className={classNames(
        "fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-gray-200 bg-white shadow-md transition-all duration-300 ease-in-out overflow-hidden",
        isOpen ? "w-64" : "w-16"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo com transição suave */}
      <div className="flex h-16 items-center justify-center overflow-hidden border-b border-gray-100 relative">
        {/* Imagem pequena (sempre visível) */}
        <img
          src="/plenitudesemfundo.png"
          alt="Plenitude"
          className={classNames(
            "absolute transition-all duration-300 ease-in-out",
            isOpen
              ? "opacity-0 scale-50 rotate-90"
              : "opacity-100 scale-100 rotate-0"
          )}
          style={{
            width: "32px",
            height: "32px",
            transform: isOpen
              ? "scale(0.5) rotate(90deg)"
              : "scale(1) rotate(0deg)",
          }}
        />

        {/* Imagem grande (aparece quando aberto) */}
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
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href.split("?")[0]) &&
                item.href !== "/");

            return (
              <li key={item.name}>
                {item.disabled ? (
                  <div
                    className={classNames(
                      "group flex items-center rounded-lg p-2 text-sm font-semibold leading-6 text-gray-400 cursor-not-allowed opacity-50 transition-all duration-200",
                      isOpen ? "gap-x-3 justify-start" : "justify-center"
                    )}
                    title="Em breve"
                  >
                    <item.icon
                      className={classNames(
                        "h-5 w-5 shrink-0 text-gray-300 transition-all duration-200"
                      )}
                    />
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
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={classNames(
                      isActive
                        ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                        : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600 border-transparent",
                      "group flex items-center rounded-lg p-2 text-sm font-semibold transition-all duration-200 border",
                      isOpen ? "gap-x-3 justify-start" : "justify-center"
                    )}
                    title={!isOpen ? item.name : ""}
                  >
                    <item.icon
                      className={classNames(
                        isActive
                          ? "text-indigo-600"
                          : "text-gray-400 group-hover:text-indigo-600",
                        "h-5 w-5 shrink-0 transition-all duration-200"
                      )}
                    />
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
              isOpen
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-2 absolute"
            )}
          >
            Encerrar sessão
          </span>
        </button>
      </nav>
    </div>
  );
}
