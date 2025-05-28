import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

export async function GET(req) {
  try {
    const snapshot = await db.collection("tests").get();
    const tests = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(tests);
  } catch (error) {
    console.error("Ошибка загрузки тестов:", error);
    return NextResponse.json({ error: "Ошибка загрузки тестов: " + error.message }, { status: 500 });
  }
}