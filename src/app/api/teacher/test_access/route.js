import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

// Получение списка всех записей в test_access (GET)
export async function GET() {
  try {
    const snapshot = await db.collection("test_access").get();
    const accessTests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(accessTests);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка загрузки test_access: " + error.message }, { status: 500 });
  }
}

// Добавление новой записи в test_access (POST)
export async function POST(req) {
  try {
    const { date, startTime, endTime, groupId, testId, testName, name, selectedQuestions } = await req.json();

    // Проверяем, что все обязательные поля заполнены
    if (!date || !startTime || !endTime || !groupId || !testId || !testName || !name || !selectedQuestions) {
      return NextResponse.json({ error: "Все поля обязательны" }, { status: 400 });
    }

    // Добавляем новую запись в Firestore
    const newAccessTest = await db.collection("test_access").add({
      date,
      startTime,
      endTime,
      groupId,
      testId,
      testName,
      name,
      selectedQuestions,
    });

    return NextResponse.json({ message: "Запись добавлена", id: newAccessTest.id });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка добавления: " + error.message }, { status: 500 });
  }
}