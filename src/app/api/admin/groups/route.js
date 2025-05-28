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

// Добавление новой группы (POST)
export async function POST(req) {
  try {
    const { name, description } = await req.json();
    const newGroup = await db.collection("groups").add({ name, description });

    return NextResponse.json({ message: "Группа добавлена", id: newGroup.id });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка добавления: " + error.message }, { status: 500 });
  }
}
