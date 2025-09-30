import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

// Получение вопросов по testId или teacherId (GET)
export async function GET(req) {
  try {
    // Извлекаем токен из cookies
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Токен отсутствует" }, { status: 401 });
    }

    // Проверяем токен через Firebase Admin SDK
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (error) {
      console.error("Ошибка проверки токена:", error);
      return NextResponse.json({ error: "Неверный токен" }, { status: 401 });
    }

    const teacherId = decodedToken.user_id || decodedToken.localId;

    if (!teacherId) {
      return NextResponse.json({ error: "teacherId отсутствует в токене" }, { status: 400 });
    }

    // Извлекаем testId из query параметров
    const { searchParams } = new URL(req.url);
    const testId = searchParams.get("testId");

    let snapshot;

    if (testId) {
      // Если testId передан, фильтруем вопросы по testId
      snapshot = await db.collection("Questions").where("testId", "==", testId).get();
    } else {
      // Если testId не передан, фильтруем вопросы по teacherId
      const testsSnapshot = await db.collection("tests").where("teacherId", "==", teacherId).get();
      const testIds = testsSnapshot.docs.map((doc) => doc.id);

      snapshot = await db.collection("Questions").where("testId", "in", testIds).get();
    }

    const questions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Ошибка загрузки вопросов:", error);
    return NextResponse.json({ error: "Ошибка загрузки вопросов: " + error.message }, { status: 500 });
  }
}

// Добавление нового вопроса (POST)
export async function POST(req) {
  try {
    const { question, answer, answers, testId, type } = await req.json();

    if (type == null || type == undefined || type == "choice") {
      // Проверяем, что все обязательные поля заполнены
      if (!question || !answer || !answers || !testId) {
        return NextResponse.json({ error: "Все поля (question, answer, answers, testId) обязательны" }, { status: 400 });
      }

      // Добавляем новый вопрос в Firestore
      const newQuestion = await db.collection("Questions").add({
        question,
        answer,
        answers, // Используем поле answers вместо options
        testId,  // Связываем вопрос с тестом
        type: "choice", // Устанавливаем тип вопроса как "choice"
      });

      return NextResponse.json({ message: "Вопрос добавлен", id: newQuestion.id });
    } 
    // Ввод текста / короткий ответ
    if (type == "text"){
      // Проверяем, что все обязательные поля заполнены
      if (!question || !answer || !testId) {
        return NextResponse.json({ error: "Все поля (question, answer, testId) обязательны" }, { status: 400 });
      }

      // Добавляем новый вопрос в Firestore
      const newQuestion = await db.collection("Questions").add({
        question,
        answer,
        testId,  // Связываем вопрос с тестом
        type,
      });

      return NextResponse.json({ message: "Вопрос добавлен", id: newQuestion.id });
    }

  } catch (error) {
    return NextResponse.json({ error: "Ошибка добавления: " + error.message }, { status: 500 });
  }
}