import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

// Обновление теста (PUT)
export async function PUT(req, { params }) {
  try {
    const { name, description } = await req.json();
    await db.collection("tests").doc(params.id).update({ name, description });

    return NextResponse.json({ message: "Тест обновлен" });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка обновления: " + error.message }, { status: 500 });
  }
}

// Удаление теста (DELETE)
export async function DELETE(req, { params }) {
  try {
    await db.collection("tests").doc(params.id).delete();

    return NextResponse.json({ message: "Тест удален" });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка удаления: " + error.message }, { status: 500 });
  }
}