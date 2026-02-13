"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToastClient() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={10000}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
    />
  );
}
