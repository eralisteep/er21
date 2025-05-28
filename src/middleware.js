// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import firebaseAdmin from "@/src/utils/firebaseAdmin";

// const roleAccess = {
//   "/api/admin": ["admin"],
//   "/api/student": ["student"],
//   "/api/teacher": ["teacher"],
// };

// export async function middleware(req) {
//   const { pathname } = req.nextUrl;
//   const allowedRoles = Object.keys(roleAccess).find((route) =>
//     pathname.startsWith(route)
//   );

//   if (!allowedRoles) return NextResponse.next(); // Если открытый маршрут

//   const token = cookies().get("token")?.value;
//   if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   try {
//     const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
//     const userRole = decodedToken.role || "student"; 

//     if (!roleAccess[allowedRoles].includes(userRole)) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     return NextResponse.next();
//   } catch (error) {
//     return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
//   }
// }

// export const config = {
//   matcher: "/api/:path*", // Middleware для всех API
// };


import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const roleAccess = {
  "/api/admin": ["admin"],
  "/api/student": ["student", "admin"],
  "/api/teacher": ["teacher", "admin"],
};

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Определяем, требуется ли проверка роли
  const route = Object.keys(roleAccess).find((route) => pathname.startsWith(route));
  if (!route) return NextResponse.next(); // Если маршрут открыт

  // Достаем токен из cookies
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Запрос в API для верификации токена (так как Firebase Admin нельзя использовать в middleware)
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
    }

    const { role } = await response.json();

    // Проверяем доступ
    if (!roleAccess[route].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Ошибка проверки токена:", error);
    return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
  }
}

export const config = {
  matcher: "/api/:path*",
};
