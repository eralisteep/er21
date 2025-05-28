"use client";
import { useState } from "react";
import { useAuth } from "@/src/context/authContext"; // Импортируем контекст
import { useRouter } from "next/navigation";

export default function Register() {
  const { register } = useAuth(); // Используем функцию регистрации из контекста
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [groupId, setGroupId] = useState(""); // Для студентов
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role, groupId);
      router.push("/dashboard"); // Перенаправление после успешной регистрации
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Регистрация</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {/* Выбор роли */}
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Студент</option>
          <option value="teacher">Преподаватель</option>
          <option value="admin">Администратор</option>
        </select>

        {/* Если выбран студент – показываем поле группы */}
        {role === "student" && (
          <input type="text" placeholder="Группа" value={groupId} onChange={(e) => setGroupId(e.target.value)} required />
        )}

        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
}
