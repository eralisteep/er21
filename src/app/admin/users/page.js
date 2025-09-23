"use client";

import styles from "./page.module.css"; // Подключаем общий стиль
import { useState, useEffect } from "react";
import AddButton from "@/src/components/buttons/AddButton";
import EditButton from "@/src/components/buttons/EditButton";
import DeleteButton from "@/src/components/buttons/DeleteButton";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "student", groupId: "" });
  const [filterRole, setFilterRole] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("append");

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Ошибка при загрузке пользователей");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Ошибка загрузки пользователей:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/admin/groups");
      if (!response.ok) throw new Error("Ошибка при загрузке групп");
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Ошибка загрузки групп:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = formData.id ? "PUT" : "POST";
      const url = formData.id ? `/api/admin/users/${formData.id}` : "/api/admin/users";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          groupId: formData.role === "student" ? formData.groupId : "",
        }),
      });

      if (!response.ok) throw new Error("Ошибка при сохранении пользователя");
      setMessage(formData.id ? "Пользователь обновлен!" : "Пользователь добавлен!");
      setFormData({ name: "", email: "", password: "", role: "student", groupId: "" });
      fetchUsers();
    } catch (error) {
      setMessage(`Ошибка: ${error.message}`);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (!filterRole || user.role === filterRole) &&
      (!filterGroup || (user.groupId && user.groupId === filterGroup))
  );

  const handleEdit = (user) => {
    setFormData(user);
    setMode("edit");
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Ошибка при удалении пользователя");
      setMessage("Пользователь удален!");
      fetchUsers();
    } catch (error) {
      setMessage(`Ошибка удаления: ${error.message}`);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminSidebar}>
        <div className={styles.adminSidebarHeader}>
          <div>
            <strong>Список пользователей</strong>
          </div>
          <AddButton
            onClick={() => {
              setMode("append");
              setFormData({ name: "", email: "", password: "", role: "student", groupId: "" });
            }}
          />
        </div>
        <div className={styles.filters}>
          <select onChange={(e) => setFilterRole(e.target.value)} className={styles.adminInput}>
            <option value="">Все роли</option>
            <option value="teacher">Преподаватели</option>
            <option value="student">Студенты</option>
          </select>
          {filterRole === "student" && (
            <select onChange={(e) => setFilterGroup(e.target.value)} className={styles.adminInput}>
              <option value="">Все группы</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <ul className={styles.list}>
          {filteredUsers.map((user) => (
            <li key={user.id} className={styles.listItem}>
              <p>
                <strong>{user.name}</strong> ({user.role})
              </p>
              {user.role === "student" && <p>Группа: {groups.find((g) => g.id === user.groupId)?.name || "—"}</p>}
              <div className={styles.buttonGroup}>
                <EditButton onClick={() => handleEdit(user)} />
                <DeleteButton onClick={() => handleDelete(user.id)} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.adminFormContainer}>
        <h4>{mode === "append" ? "Добавить пользователя" : "Изменить пользователя"}</h4>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="ФИО"
            value={formData.name}
            onChange={handleChange}
            className={styles.adminInput}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={styles.adminInput}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
            className={styles.adminInput}
            required
          />
          <select name="role" value={formData.role} onChange={handleChange} className={styles.adminInput}>
            <option value="student">Студент</option>
            <option value="teacher">Преподаватель</option>
            <option value="admin">Админ</option>
          </select>
          {formData.role === "student" && (
            <select
              name="groupId"
              value={formData.groupId}
              onChange={handleChange}
              className={styles.adminInput}
              required
            >
              <option value="">Выберите группу</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          )}
          <button className={styles.button} type="submit">
            Сохранить
          </button>
        </form>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
}