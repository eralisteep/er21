import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

// Обновление группы (PUT)
export async function PUT(req, { params }) {
  try {
    const { name, description } = await req.json();
    await db.collection("groups").doc(params.id).update({ name, description });

    return NextResponse.json({ message: "Группа обновлена" });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка обновления: " + error.message }, { status: 500 });
  }
}

// Удаление группы (DELETE)
export async function DELETE(req, { params }) {
  try {
    await db.collection("groups").doc(params.id).delete();

    return NextResponse.json({ message: "Группа удалена" });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка удаления: " + error.message }, { status: 500 });
  }
}
