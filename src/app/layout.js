import { AuthProvider } from "@/src/context/authContext";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProvider from "@/src/components/ClientProvider"; // Новый клиентский компонент
import ReactQueryProvider from "../components/Provider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "The test syte",
  description: "syte for tests",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link type="text/css" rel="stylesheet" href="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.css" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ReactQueryProvider>
          <AuthProvider>
            <ClientProvider>
              {children}
            </ClientProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
