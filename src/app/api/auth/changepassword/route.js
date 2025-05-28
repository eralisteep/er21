import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export async function POST(req) {
  try {
    const { email, oldPassword, newPassword } = await req.json();

    if (!email || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Все поля (email, oldPassword, newPassword) обязательны" },
        { status: 400 }
      );
    }

    // Проверяем старый пароль через Firebase Authentication REST API
    const verifyPasswordResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: oldPassword,
          returnSecureToken: true,
        }),
      }
    );

    if (!verifyPasswordResponse.ok) {
      const errorData = await verifyPasswordResponse.json();
      return NextResponse.json(
        { error: "Старый пароль неверный: " + errorData.error.message },
        { status: 400 }
      );
    }

    // Получаем данные пользователя
    const userRecord = await admin.auth().getUserByEmail(email);

    if (!userRecord) {
      return NextResponse.json(
        { error: "Пользователь с таким email не найден" },
        { status: 404 }
      );
    }

    // Обновляем пароль пользователя
    await admin.auth().updateUser(userRecord.uid, { password: newPassword });

    return NextResponse.json({ message: "Пароль успешно изменен" });
  } catch (error) {
    console.error("Ошибка изменения пароля:", error);
    return NextResponse.json(
      { error: "Ошибка изменения пароля: " + error.message },
      { status: 500 }
    );
  }
}