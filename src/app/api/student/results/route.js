import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

export async function POST(req) {
  try {
    const { results } = await req.json();

    if (!Array.isArray(results)) {
      return NextResponse.json({ error: "Ожидается массив результатов" }, { status: 400 });
    }

    const batch = db.batch();

    results.forEach((result) => {
      const resultRef = db.collection("results").doc();
      batch.set(resultRef, result);
    });

    await batch.commit();

    return NextResponse.json({ message: "Результаты успешно сохранены" });
  } catch (error) {
    console.error("Ошибка сохранения результатов:", error);
    return NextResponse.json({ error: "Ошибка сохранения результатов: " + error.message }, { status: 500 });
  }
}