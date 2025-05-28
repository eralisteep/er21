import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

// Обновление пользователя (PUT)
export async function PUT(req, { params }) {
  try {
    const { email, name, role, groupId } = await req.json();

    // Проверяем обязательные поля
    if (!email || !name || !role) {
      return NextResponse.json({ error: "Поля email, name и role обязательны" }, { status: 400 });
    }

    // Если роль "student", проверяем наличие groupId
    if (role === "student" && !groupId) {
      return NextResponse.json({ error: "Для роли student поле groupId обязательно" }, { status: 400 });
    }

    // Обновляем пользователя в Firestore
    await db.collection("users").doc(params.id).update({
      email,
      name,
      role,
      groupId: role === "student" ? groupId : null, // groupId только для студентов
    });

    return NextResponse.json({ message: "Пользователь обновлен" });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка обновления: " + error.message }, { status: 500 });
  }
}

// Удаление пользователя (DELETE)
export async function DELETE(req, { params }) {
  try {
    // Удаляем пользователя из Firestore
    await db.collection("users").doc(params.id).delete();

    return NextResponse.json({ message: "Пользователь удален" });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка удаления: " + error.message }, { status: 500 });
  }
}