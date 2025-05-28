import { NextResponse } from "next/server";
import axios from "axios";

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Запрос в Firebase REST API для создания пользователя
    const { data } = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const res = NextResponse.json({
      uid: data.localId,
      email: data.email,
    });

    // Сохраняем токен в куки
    res.cookies.set("token", data.idToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      path: "/",
    });

    return res;
  } catch (error) {
    return NextResponse.json(
      { error: error.response?.data?.error?.message || error.message },
      { status: 400 }
    );
  }
}
