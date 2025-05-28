import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

// Получение списка всех групп (GET)
export async function GET() {
  try {
    const snapshot = await db.collection("groups").get();
    const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка загрузки групп: " + error.message }, { status: 500 });
  }
}
