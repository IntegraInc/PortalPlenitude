"use client";

import { toast } from "react-toastify";
import { FormEvent, useState } from "react";
import authenticate from "@/app/auth/action";
import Image from "next/image";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setLoading(true);

    const response = await authenticate(formData);
    console.log("response", response);
    const idToast = toast.loading("Logando...");
    if (response) {
      toast.update(idToast, {
        render: response,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }

    setLoading(false);
  }
  return (
    <>
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Logo />
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px] shadow-2xl">
          <div className="bg-white px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="loginInput"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Login
                </label>
                <div className="mt-2">
                  <input
                    name={"login"}
                    placeholder={"digite seu login"}
                    required
                    autoComplete="email"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="passwordInput"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Senha
                </label>
                <div className="mt-2">
                  <input
                    type="password"
                    name={"password"}
                    placeholder={"digite sua senha"}
                    required
                    autoComplete="current-password"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div>
                <button
                  disabled={loading}
                  // type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
