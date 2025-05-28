"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/context/authContext";
import { useRouter } from "next/navigation"; // Для навигации
import styles from "./tests.module.css";

export default function StudentTests() {
  const { user, isLoading } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter(); // Инициализация роутера

  useEffect(() => {
    if (isLoading) return; // Ждем, пока данные пользователя загрузятся

    fetchTests();
  }, [isLoading]);

  const fetchTests = async () => {
    try {
      const response = await fetch(`/api/student/test_access`);
      if (!response.ok) throw new Error("Ошибка при загрузке тестов");
      const data = await response.json();
      setTests(data);
    } catch (error) {
      console.error("Ошибка загрузки тестов:", error);
      setError("Не удалось загрузить доступные тесты.");
    } finally {
      setLoading(false);
    }
  };

  const handleTestClick = (testId) => {
    router.push(`/student/questions?testId=${testId}`); // Переход на страницу вопросов теста
  };

  if (isLoading || loading) return <p>Загрузка...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Доступные тесты</h2>
      {tests.length === 0 ? (
        <p>Нет доступных тестов.</p>
      ) : (
        <ul className={styles.testList}>
          {tests.map((test) => (
            <li
              key={test.id}
              className={styles.testItem}
              onClick={() => handleTestClick(test.id)} // Обработчик клика
            >
              <h3>{test.name}</h3>
              <p>{test.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}