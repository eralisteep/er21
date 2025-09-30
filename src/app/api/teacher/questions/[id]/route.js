import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

// Обновление вопроса (PUT)
export async function PUT(req, { params }) {
  try {
    const { question, answer, answers, testId, type } = await req.json();

    // Обновляем вопрос в Firestore
    await db.collection("Questions").doc(params.id).update({
      question,
      answer,
      answers,
      testId,
      type,
    });

    return NextResponse.json({ message: "Вопрос обновлен" });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка обновления: " + error.message }, { status: 500 });
  }
}

// Удаление вопроса (DELETE)
export async function DELETE(req, { params }) {
  try {
    // Удаляем вопрос из Firestore
    await db.collection("Questions").doc(params.id).delete();

    return NextResponse.json({ message: "Вопрос удален" });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка удаления: " + error.message }, { status: 500 });
  }
}