import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers"; // Используем API Next.js

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Запрос в Firebase REST API для входа
    const { data } = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );
    // console.log(data);
    // Устанавливаем HTTP-only куки
    const cookieStore = await cookies(); // ✅ Дожидаемся cookies()
    cookieStore.set("token", data.idToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 60 * 60, // час
    });

    return NextResponse.json({ uid: data.localId, email: data.email, token: data.idToken });
  } catch (error) {
    return NextResponse.json(
      { error: error.response?.data?.error?.message || error.message },
      { status: 401 }
    );
  }
}
