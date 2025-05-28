import { NextResponse } from "next/server";
import axios from "axios";
import admin from "@/src/utils/firebaseAdmin"; // Путь к файлу с настройками Firebase Admin

const db = admin.firestore(); // Импортируем Firestore

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data } = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      { idToken: token }
    );

    const uid = data.users[0].localId; // Получаем UID пользователя

    // Получаем роль из Firestore
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "Пользователь не найден в Firestore" }, { status: 404 });
    }

    const userData = userDoc.data();
    const role = userData.role; // Получаем роль
    const groupId = userData.groupId; // Получаем роль


    // Добавляем роль в данные пользователя
    const user = { ...data.users[0], role: role, groupId: groupId };

    return NextResponse.json(user); // Возвращаем данные пользователя с ролью
  } catch (error) {
    return NextResponse.json(
      { error: error.response?.data?.error?.message || error.message },
      { status: 401 }
    );
  }
}