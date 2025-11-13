// src/app/layout.tsx
import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import NextTopLoader from "nextjs-toploader";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Portal Plenitude",
  description: "Esse é o portal do projeto Portal Plenitude",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={poppins.variable}>
      <body>
        <NextTopLoader
          color="#9F3F7C"
          initialPosition={0.08}
          height={5}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #D64566,0 0 5px #D64566"
        />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
