import { NextResponse } from "next/server";
import firebaseAdmin from "@/src/utils/firebaseAdmin";

export async function POST(req) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "No Token" }, { status: 401 });

    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    return NextResponse.json({ role: decodedToken.role || "student" });
  } catch (error) {
    console.error("Ошибка верификации:", error);
    return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
  }
}
