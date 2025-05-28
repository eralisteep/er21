import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

// Обновление вопроса (PUT)
export async function PUT(req, { params }) {
  try {
    const { question, answer, answers, testId } = await req.json();

    // Проверяем, что все обязательные поля заполнены
    if (!question || !answer || !answers || !testId) {
      return NextResponse.json({ error: "Все поля (question, answer, answers, testId) обязательны" }, { status: 400 });
    }

    // Обновляем вопрос в Firestore
    await db.collection("Questions").doc(params.id).update({
      question,
      answer,
      answers,
      testId,
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