import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

// Получение списка всех пользователей (GET)
export async function GET() {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка загрузки пользователей: " + error.message }, { status: 500 });
  }
}

// Добавление нового пользователя (POST)
export async function POST(req) {
  try {
    const { email, name, password, role, groupId } = await req.json();

    // Проверяем обязательные поля
    if (!email || !name || !password || !role) {
      return NextResponse.json({ error: "Поля email, name, password и role обязательны" }, { status: 400 });
    }

    // Если роль "student", проверяем наличие groupId
    if (role === "student" && !groupId) {
      return NextResponse.json({ error: "Для роли student поле groupId обязательно" }, { status: 400 });
    }

    // Создаем пользователя в Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Устанавливаем пользовательские атрибуты (role и groupId)
    const customClaims = { role };
    if (role === "student") {
      customClaims.groupId = groupId;
    }
    await admin.auth().setCustomUserClaims(userRecord.uid, customClaims);

    // Добавляем пользователя в Firestore
    const newUser = await db.collection("users").doc(userRecord.uid).set({
      email,
      name,
      role,
      groupId: role === "student" ? groupId : null, // groupId только для студентов
    });

    return NextResponse.json({ message: "Пользователь добавлен", id: userRecord.uid });
  } catch (error) {
    console.error("Ошибка добавления пользователя:", error);
    return NextResponse.json({ error: "Ошибка добавления: " + error.message }, { status: 500 });
  }
}
