import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

// Получение списка доступных тестов для студента (GET)
export async function GET(req) {
  try {
    // Извлекаем токен из заголовков запроса
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Проверяем токен через Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Получаем данные пользователя из Firestore
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const userData = userDoc.data();
    const groupId = userData.groupId;

    if (!groupId) {
      return NextResponse.json({ error: "У пользователя нет groupId" }, { status: 400 });
    }

    // Получаем текущее время без смещения UTC
    const now = new Date();

    const { searchParams } = new URL(req.url);
    const testId = searchParams.get("testId"); // Получаем testId из параметров запроса

    const snapshot = await db.collection("test_access").get();

    const accessTests = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((access) => {
        // Используем локальное время без смещения
        const startTime = new Date(`${access.date}T${access.startTime}`);
        const endTime = new Date(`${access.date}T${access.endTime}`);

        return (
          access.groupId === groupId &&
          now >= startTime &&
          now <= endTime
        );
      });
    // // Получаем текущее время в UTC+5
    // const now = new Date();
    // now.setUTCHours(now.getUTCHours() + 5);

    // const { searchParams } = new URL(req.url);
    // const testId = searchParams.get("testId"); // Получаем testId из параметров запроса

    // const snapshot = await db.collection("test_access").get();

    // const accessTests = snapshot.docs
    //   .map((doc) => ({ id: doc.id, ...doc.data() }))
    //   .filter((access) => {
    //     // Преобразуем время начала и окончания теста в UTC+5
    //     const startTime = new Date(`${access.date}T${access.startTime}`);
    //     startTime.setUTCHours(startTime.getUTCHours() + 5);

    //     const endTime = new Date(`${access.date}T${access.endTime}`);
    //     endTime.setUTCHours(endTime.getUTCHours() + 5);

    //     return (
    //       access.groupId === groupId &&
    //       now >= startTime &&
    //       now <= endTime
    //     );
    //   });

    const testIds = accessTests.map((access) => access.testId);

    // Загружаем тесты по testId
    const testsSnapshot = await db.collection("tests").get();
    let tests = testsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((test) => testIds.includes(test.id))
      .map((test) => {
        // Добавляем test_accessId и selectedQuestions для каждого теста
        const access = accessTests.find((access) => access.testId === test.id);
        return {
          ...test,
          test_accessId: access?.id || null, // Добавляем id из test_access
          selectedQuestions: access?.selectedQuestions || [], // Добавляем selectedQuestions
        };
      });

    // Если testId передан, фильтруем тесты по testId
    if (testId) {
      tests = tests.filter((test) => test.id === testId);
    }

    return NextResponse.json(tests);
  } catch (error) {
    console.error("Ошибка загрузки test_access:", error);
    return NextResponse.json({ error: "Ошибка загрузки test_access" }, { status: 500 });
  }
}