import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const testId = searchParams.get("testId");
    const selectedQuestions = searchParams.get("selectedQuestions");

    if (!testId) {
      return NextResponse.json({ error: "testId обязателен" }, { status: 400 });
    }

    if (!selectedQuestions || selectedQuestions.trim() === "") {
      return NextResponse.json({ error: "selectedQuestions обязателен" }, { status: 400 });
    }

    const questionIds = selectedQuestions.split(",");

    const snapshot = await db.collection("Questions")
      .where("testId", "==", testId)
      .get();

    const questions = snapshot.docs
      .filter((doc) => questionIds.includes(doc.id)) // Фильтруем по doc.id
      .map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Ошибка загрузки вопросов:", error);
    return NextResponse.json({ error: "Ошибка загрузки вопросов: " + error.message }, { status: 500 });
  }
}