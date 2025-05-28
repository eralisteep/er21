import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

    // Проверяем, передан ли корректный groupId
    if (!groupId || groupId === "undefined" || groupId === "null" || groupId === "") {
      const studentsSnapshot = await db.collection("users").where("role","==","student").get();
      const students = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return NextResponse.json({ students });
    }

    // Если groupId передан, фильтруем студентов по groupId
    const studentsSnapshot = await db.collection("users").where("groupId", "==", groupId).get();

    const students = studentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Ошибка получения студентов:", error);
    return NextResponse.json({ error: "Ошибка получения студентов: " + error.message }, { status: 500 });
  }
}