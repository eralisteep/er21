import { NextResponse } from "next/server";
import firebaseAdmin from "@/src/utils/firebaseAdmin";

export async function POST(req) {
  try {
    // 1. Пробуем взять токен из cookie
    let token = req.cookies.get("token")?.value;

    // 2. Если нет — пробуем из тела запроса
    if (!token) {
      const { token: bodyToken } = await req.json();
      token = bodyToken;
    }

    if (!token) return NextResponse.json({ error: "No Token" }, { status: 401 });

    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    return NextResponse.json({ role: decodedToken.role || "student" });
  } catch (error) {
    console.error("Ошибка верификации:", error);
    return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
  }
}
