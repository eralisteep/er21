import { NextResponse } from "next/server";
import admin from "@/src/utils/firebaseAdmin";

const db = admin.firestore(); // Firestore через Admin SDK

// Удаление одного результата по его ID
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Не указан resultId" },
        { status: 400 }
      );
    }

    const resultRef = db.collection("results").doc(id);
    const resultDoc = await resultRef.get();

    if (!resultDoc.exists) {
      return NextResponse.json(
        { error: "Результат не найден" },
        { status: 404 }
      );
    }

    await resultRef.delete();

    return NextResponse.json(
      { message: "Результат успешно удален" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка удаления результата:", error);
    return NextResponse.json(
      { error: "Ошибка удаления результата: " + error.message },
      { status: 500 }
    );
  }
}

// Изменение одного результата по его ID
export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Не указан resultId" },
        { status: 400 }
      );
    }

    const resultRef = db.collection("results").doc(id);
    const resultDoc = await resultRef.get();

    if (!resultDoc.exists) {
      return NextResponse.json(
        { error: "Результат не найден" },
        { status: 404 }
      );
    }

    await resultRef.update(body);

    return NextResponse.json(
      { message: "Результат успешно обновлен" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка обновления результата:", error);
    return NextResponse.json(
      { error: "Ошибка обновления результата: " + error.message },
      { status: 500 }
    );
  }
}
export async function PUT(req, { params }) {
    try {
      const { id } = params;
      const body = await req.json();
  
      if (!id) {
        return NextResponse.json(
          { error: "Не указан resultId" },
          { status: 400 }
        );
      }
  
      const resultRef = db.collection("results").doc(id);
      const resultDoc = await resultRef.get();
  
      if (!resultDoc.exists) {
        return NextResponse.json(
          { error: "Результат не найден" },
          { status: 404 }
        );
      }
  
      await resultRef.update(body);
  
      return NextResponse.json(
        { message: "Результат успешно обновлен" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Ошибка обновления результата:", error);
      return NextResponse.json(
        { error: "Ошибка обновления результата: " + error.message },
        { status: 500 }
      );
    }
  }