import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

// Обновление записи в test_access (PUT)
export async function PUT(req, { params }) {
  try {
    const { date, startTime, endTime, groupId, testId } = await req.json();

    // Проверяем, что все обязательные поля заполнены
    if (!date || !startTime || !endTime || !groupId || !testId) {
      return NextResponse.json({ error: "Все поля (date, startTime, endTime, groupId, testId) обязательны" }, { status: 400 });
    }

    // Обновляем запись в Firestore
    await db.collection("test_access").doc(params.id).update({
      date,
      startTime,
      endTime,
      groupId,
      testId,
    });

    return NextResponse.json({ message: "Запись обновлена" });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка обновления: " + error.message }, { status: 500 });
  }
}

// Удаление записи из test_access (DELETE)
export async function DELETE(req, { params }) {
  try {
    // Удаляем запись из Firestore
    await db.collection("test_access").doc(params.id).delete();

    return NextResponse.json({ message: "Запись удалена" });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка удаления: " + error.message }, { status: 500 });
  }
}