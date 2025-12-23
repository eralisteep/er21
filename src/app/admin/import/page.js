"use client";

import { useState, useRef, useEffect } from "react";
import Papa from "papaparse";

export default function Import() {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const fileInputRef = useRef(null);

  // Загружаем группы при инициализации
  useEffect(() => {
    async function fetchGroups() {
      try {
        const res = await fetch("/api/admin/groups");
        const data = await res.json();
        if (Array.isArray(data)) {
          setGroups(data);
          if (data.length > 0) setSelectedGroupId(data[0].id);
        }
      } catch (error) {
        console.error("Ошибка при загрузке групп:", error);
      }
    }
    fetchGroups();
  }, []);

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert("Пожалуйста, выберите файл");
      return;
    }

    if (!selectedGroupId) {
      alert("Пожалуйста, выберите группу");
      return;
    }

    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const users = results.data;
        let successCount = 0;
        let errorCount = 0;

        for (const user of users) {
          try {
            const response = await fetch("/api/admin/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user["Gmail Login"],
                name: user["Full Name"],
                password: user["Password"],
                role: "student",
                groupId: selectedGroupId,
              }),
            });

            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
          }
        }

        setLoading(false);
        alert(`Готово! Успешно: ${successCount}, Ошибок: ${errorCount}`);
      },
    });
  };

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "15px", maxWidth: "400px" }}>
      <h3>Импорт студентов в группу</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        <label>Выберите группу:</label>
        <select 
          value={selectedGroupId} 
          onChange={(e) => setSelectedGroupId(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px" }}
          disabled={loading}
        >
          {groups.length === 0 && <option>Загрузка групп...</option>}
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name || group.id} 
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        <label>CSV файл:</label>
        <input 
          type="file" 
          accept=".csv" 
          ref={fileInputRef} 
          disabled={loading}
          style={{ padding: "5px" }}
        />
      </div>
      
      <button 
        onClick={handleUpload} 
        disabled={loading || groups.length === 0}
        style={{
          padding: "10px",
          backgroundColor: loading ? "#ccc" : "#0070f3",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: "5px",
          fontWeight: "bold"
        }}
      >
        {loading ? "Импорт идет..." : "Начать импорт"}
      </button>
    </div>
  );
}