"use client";
import { useAuth } from "@/src/context/authContext"; // Импортируем хук из контекста
import { signOut } from "firebase/auth";
// import { auth } from "@/firebaseConfig";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Navbar.module.css";
import ThemeToggle from "./Toogle";



export default function Navbar() {
  const { user, role, loading, logout } = useAuth(); // Получаем данные из контекста
  const router = useRouter();

  const handleLogout = async () => {
    await logout(); // Вызываем logout из контекста
    router.push("/auth/login"); // Перенаправляем на страницу входа
  };

  if (loading) return null; // Пока загружается, не рендерим

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">Главная</Link>
      </div>
      <ul className={styles.navLinks}>
        {role === "student" && (
          <li>
            <Link href="/student/tests" prefetch={true}>Тесты</Link>
          </li>
        )}
        {role === "teacher" && (
          <>
            <li>
              <Link href="/teacher/quiz" prefetch={true}>Тесты</Link>
            </li>
            <li>
              <Link href="/teacher/results" prefetch={true}>Результаты</Link>
            </li>
            <li>
              <Link href="/teacher/questions" prefetch={true}>Редактировать тест</Link>
            </li>
            <li>
              <Link href="/teacher/generate" prefetch={true}>Сгенерировать</Link>
            </li>
            <li>
              <Link href="/teacher/assigned" prefetch={true}>Провести тест</Link>
            </li>
          </>
        )}
        {role === "admin" && (
          <>
            {/* <li>
              <Link href="/admin/tests">Тесты</Link>
            </li>
            <li>
              <Link href="/admin/questions">Вопросы</Link>
            </li> */}
            <li>
              <Link href="/admin/groups">Группы</Link>
            </li>
            <li>
              <Link href="/admin/users">Пользователи</Link>
            </li>
          </>
        )}
        {user ? (
          <li>
            <button className={styles.logout} onClick={handleLogout}>
              Выход
            </button>
          </li>
        ) : (
          <li>
            <Link href="/auth/login">Войти</Link>
          </li>
        )}
        <li>
        <ThemeToggle />
        </li>
      </ul>
    </nav>
  );
}
