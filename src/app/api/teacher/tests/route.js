import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

// Получение тестов по teacherId (GET)
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

    // Получаем тесты, связанные с teacherId
    const snapshot = await db.collection("tests").where("teacherId", "==", teacherId).get();
    const tests = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(tests);
  } catch (error) {
    console.error("Ошибка загрузки тестов:", error);
    return NextResponse.json({ error: "Ошибка загрузки тестов: " + error.message }, { status: 500 });
  }
}

// Добавление нового теста (POST)
export async function POST(req) {
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

    // Извлекаем данные из тела запроса
    const { name, description } = await req.json();

    if (!name || !description) {
      return NextResponse.json({ error: "Все поля (name, description) обязательны" }, { status: 400 });
    }

    // Добавляем новый тест в Firestore
    const newTest = await db.collection("tests").add({
      name,
      description,
      teacherId,
    });

    return NextResponse.json({ message: "Тест добавлен", id: newTest.id });
  } catch (error) {
    console.error("Ошибка добавления теста:", error);
    return NextResponse.json({ error: "Ошибка добавления: " + error.message }, { status: 500 });
  }
}