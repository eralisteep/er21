"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/context/authContext";
import styles from "@/src/app/admin.module.css";
import EditButton from "@/src/components/buttons/EditButton";
import DeleteButton from "@/src/components/buttons/DeleteButton";
import AddButton from "@/src/components/buttons/AddButton";

export default function ManageTests() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [mode, setMode] = useState("append");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user?.localId) {
      console.error("Пользователь не авторизован или localId отсутствует");
      setLoading(false);
      return;
    }
    fetchTests();
  }, [user?.localId]);

  const fetchTests = async () => {
    try {
      const response = await fetch(`/api/teacher/tests?teacherId=${user.localId}`);
      if (!response.ok) throw new Error("Ошибка при загрузке тестов");
      const data = await response.json();
      setTests(data);
    } catch (error) {
      console.error("Ошибка при загрузке тестов:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = formData.id ? "PUT" : "POST";
      const url = formData.id ? `/api/teacher/tests/${formData.id}` : `/api/teacher/tests`;
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          teacherId: user.localId,
        }),
      });

      if (!response.ok) throw new Error("Ошибка при сохранении теста");
      setMessage(formData.id ? "Тест обновлен!" : "Тест добавлен!");
      setFormData({ name: "", description: "" });
      fetchTests();
    } catch (error) {
      setMessage(`Ошибка: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/teacher/tests/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Ошибка при удалении теста");
      setMessage("Тест удален!");
      fetchTests();
    } catch (error) {
      setMessage(`Ошибка удаления: ${error.message}`);
    }
  };

  const handleEdit = (test) => {
    setFormData(test);
    setMode("edit");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminSidebar}>
        <div className={styles.adminSidebarHeader}>
          <div>
            <strong>Список тестов преподавателя</strong>
          </div>
          <AddButton
            onClick={() => {
              setMode("append");
              setFormData({ name: "", description: "" });
            }}
          />
        </div>

        <ul className={styles.list}>
          {tests.map((test) => (
            <li key={test.id} className={styles.listItem}>
              <p>
                <strong>{test.name}</strong>
              </p>
              <div className={styles.buttonGroup}>
                <EditButton onClick={() => handleEdit(test)} />
                <DeleteButton onClick={() => handleDelete(test.id)} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.adminFormContainer}>
        <h4>{mode === "append" ? "Добавить тест" : "Изменить тест"}</h4>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Название теста"
            value={formData.name}
            onChange={handleChange}
            className={styles.adminInput}
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Описание"
            value={formData.description}
            onChange={handleChange}
            className={styles.adminInput}
            required
          />
          <button className={styles.submit} type="submit">
            Сохранить
          </button>
        </form>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
}