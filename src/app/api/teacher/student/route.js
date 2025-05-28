import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "studentId обязателен" }, { status: 400 });
    }

    const studentDoc = await db.collection("users").doc(studentId).get();

    if (!studentDoc.exists) {
      return NextResponse.json({ error: "Ученик не найден" }, { status: 404 });
    }

    const studentData = studentDoc.data();
    return NextResponse.json({ name: studentData.name || "Без имени" });
  } catch (error) {
    console.error("Ошибка получения имени ученика:", error);
    return NextResponse.json({ error: "Ошибка получения имени ученика: " + error.message }, { status: 500 });
  }
}