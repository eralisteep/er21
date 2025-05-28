import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        border: "none",
        backgroundColor: theme === "light" ? "#171717" : "#ededed",
        color: theme === "light" ? "#ffffff" : "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "transform 0.2s, background 0.3s",
      }}
      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.9)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
