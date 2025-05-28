"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/src/context/authContext";

const protectedRoutes = {
  "/admin": ["admin"],
  "/teacher": ["admin", "teacher"],
  "/student": ["student"],
};

export default function ProtectedLayout({ children }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (loading) return; // Пока грузится — ничего не делаем.

    // Если пользователь не авторизован и не на странице логина — отправляем на логин.
    if (!user && pathname !== "/auth/login") {
      router.replace("/auth/login");
      return;
    }

    // Если пользователь авторизован, но не имеет прав на маршрут — отправляем на 403.
    const allowedRoles = Object.entries(protectedRoutes).find(([route]) =>
      pathname.startsWith(route)
    )?.[1];

    if (user && allowedRoles && !allowedRoles.includes(role)) {
      router.replace("/403");
      return;
    }

    setIsReady(true); // Разрешаем рендер, если всё ок.
  }, [user, role, loading, pathname, router]);

  if (loading || !isReady) {
    return <div className="h-screen flex justify-center items-center">Загрузка...</div>;
  }

  return <>{children}</>;
}
