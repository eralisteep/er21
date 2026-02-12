import { NextResponse } from "next/server";
import axios from "axios";
// import firebaseAdmin from "@/src/utils/firebaseAdmin"; // Импортируйте Admin SDK
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // 1. Создаём пользователя через REST API
    const { data } = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    // // 2. Устанавливаем кастомный claim "role" через Admin SDK
    // await firebaseAdmin.auth().setCustomUserClaims(data.localId, { role });

    // 3. Возвращаем ответ
    const res = NextResponse.json({
      uid: data.localId,
      email: data.email,
      // role,
    });

    // 4. Сохраняем токен в куки
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
