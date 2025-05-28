import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

// Получение списка всех групп (GET)
export async function GET(req) {
  try {
    // Извлекаем токен из заголовков запроса
    const token = req.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Проверяем токен через Firebase Admin SDK
    const user = await admin.auth().verifyIdToken(token);

    const users = await db.collection("users").get();
    const student = users.docs.map(doc => ({ id: doc.id, ...doc.data() })).find(u => u.email === user.email);

    const groups = await db.collection("groups").get();
    const group = groups.docs.map(doc => ({ id: doc.id, ...doc.data() })).find(group => group.id == student.groupId);

    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка загрузки групп: " + error.message }, { status: 500 });
  }
}
