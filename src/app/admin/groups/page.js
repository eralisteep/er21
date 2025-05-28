"use client";

import styles from "./page.module.css"; // Подключаем общий стиль
import { useState, useEffect } from "react";
import EditButton from "@/src/components/buttons/EditButton";
import DeleteButton from "@/src/components/buttons/DeleteButton";
import AddButton from "@/src/components/buttons/AddButton";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({ id: "", name: "", description: "" });
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("append");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/admin/groups");
      if (!response.ok) throw new Error("Ошибка при загрузке групп");
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Ошибка загрузки данных: ", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = formData.id ? "PUT" : "POST";
      const url = formData.id ? `/api/admin/groups/${formData.id}` : "/api/admin/groups";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });

      if (!response.ok) throw new Error("Ошибка при сохранении группы");
      setMessage(formData.id ? "Группа обновлена!" : "Группа добавлена!");
      setFormData({ id: "", name: "", description: "" });
      fetchGroups();
    } catch (error) {
      setMessage(`Ошибка: ${error.message}`);
    }
  };

  const handleEdit = (group) => {
    setFormData(group);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/admin/groups/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Ошибка при удалении группы");
      setMessage("Группа удалена!");
      fetchGroups();
    } catch (error) {
      setMessage(`Ошибка удаления: ${error.message}`);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminSidebar}>
        <div className={styles.adminSidebarHeader}>
          <div>
            <strong>Список групп</strong>
          </div>
          <AddButton
            onClick={() => {
              setMode("append");
              setFormData({ name: "", description: "" });
            }}
          />
        </div>
        <ul className={styles.list}>
          {groups.map((group) => (
            <li key={group.id} className={styles.listItem}>
              <p>
                <strong>{group.name}</strong> {group.description}
              </p>
              <div className={styles.buttonGroup}>
                <EditButton onClick={() => handleEdit(group)} />
                <DeleteButton onClick={() => handleDelete(group.id)} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.adminFormContainer}>
        <h4>{formData.id ? "Редактировать группу" : "Добавить группу"}</h4>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Название группы"
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
          <button className={styles.button} type="submit">
            {formData.id ? "Обновить" : "Добавить"}
          </button>
        </form>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
}