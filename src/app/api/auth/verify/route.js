import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

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

    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken.role) {
      const snapshot = await db.collection("users").get();
      const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const userRole = users.find((u) => u.id === decodedToken.uid)?.role;
      return NextResponse.json({ role: userRole}); // По умолчанию "student"
    } else {
      return NextResponse.json({ role: decodedToken.role});
    }
  } catch (error) {
    console.error("Ошибка верификации:", error);
    return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
  }
}
