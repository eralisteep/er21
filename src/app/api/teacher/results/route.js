import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const testId = searchParams.get("testId");
    const groupId = searchParams.get("groupId");
    const testAccessId = searchParams.get("testAccessId"); // Новый параметр

    let query = db.collection("results");

    // Проверяем, какие параметры переданы, и добавляем соответствующие фильтры
    if (
      (!studentId || studentId === "undefined" || studentId === "null") &&
      (!testId || testId === "undefined" || testId === "null") &&
      (!groupId || groupId === "undefined" || groupId === "null") &&
      (!testAccessId || testAccessId === "undefined" || testAccessId === "null")
    ) {
    } else if (
      testAccessId &&
      testAccessId !== "undefined" &&
      testAccessId !== "null" &&
      studentId &&
      studentId !== "undefined" &&
      studentId !== "null"
    ) {
      // Фильтрация по testAccessId и studentId
      query = query.where("test_accessId", "==", testAccessId).where("studentId", "==", studentId);
    } else if (
      testAccessId &&
      testAccessId !== "undefined" &&
      testAccessId !== "null" &&
      groupId &&
      groupId !== "undefined" &&
      groupId !== "null"
    ) {
      // Фильтрация по testAccessId и groupId
      query = query.where("test_accessId", "==", testAccessId).where("groupId", "==", groupId);
    } else if (
      testAccessId &&
      testAccessId !== "undefined" &&
      testAccessId !== "null"
    ) {
      // Фильтрация только по testAccessId
      query = query.where("test_accessId", "==", testAccessId);
    } else if (
      studentId &&
      studentId !== "undefined" &&
      studentId !== "null" &&
      testId &&
      testId !== "undefined" &&
      testId !== "null"
    ) {
      // Фильтрация по studentId и testId
      query = query.where("studentId", "==", studentId).where("testId", "==", testId);
    } else if (
      groupId &&
      groupId !== "undefined" &&
      groupId !== "null" &&
      testId &&
      testId !== "undefined" &&
      testId !== "null"
    ) {
      // Фильтрация по groupId и testId
      query = query.where("groupId", "==", groupId).where("testId", "==", testId);
    } else if (
      testAccessId &&
      testAccessId !== "undefined" &&
      testAccessId !== "null"
    ) {
      // Фильтрация по testAccessId
      query = query.where("test_accessId", "==", testAccessId);
    } else if (studentId && studentId !== "undefined" && studentId !== "null") {
      // Фильтрация по studentId
      query = query.where("studentId", "==", studentId);
    } else if (groupId && groupId !== "undefined" && groupId !== "null") {
      // Фильтрация по groupId
      query = query.where("groupId", "==", groupId);
    } else if (testId && testId !== "undefined" && testId !== "null") {
      // Фильтрация по testId
      query = query.where("testId", "==", testId);
    }

    // Выполняем запрос к Firestore
    const snapshot = await query.get();

    // Формируем массив результатов
    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Ошибка получения результатов:", error);
    return NextResponse.json(
      { error: "Ошибка получения результатов: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    // Извлекаем токен из cookie
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    // Проверяем токен через Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    const teacherId = decodedToken.uid; // Используем UID как teacherId

    if (!teacherId) {
      return NextResponse.json(
        { error: "Не удалось определить teacherId" },
        { status: 400 }
      );
    }

    // Получаем все тесты преподавателя
    const testsSnapshot = await db
      .collection("tests")
      .where("teacherId", "==", teacherId)
      .get();

    if (testsSnapshot.empty) {
      return NextResponse.json(
        { message: "У преподавателя нет тестов" },
        { status: 404 }
      );
    }

    const testIds = testsSnapshot.docs.map((doc) => doc.id);

    // Удаляем все результаты, связанные с тестами преподавателя
    const resultsSnapshot = await db
      .collection("results")
      .where("testId", "in", testIds)
      .get();

    const batch = db.batch();
    resultsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    return NextResponse.json(
      { message: "Все результаты тестов преподавателя удалены" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка удаления результатов:", error);
    return NextResponse.json(
      { error: "Ошибка удаления результатов: " + error.message },
      { status: 500 }
    );
  }
}