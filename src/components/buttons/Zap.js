import { Zap } from "lucide-react";
import styles from "./Button.module.css";

const ZapButton = ({ onClick }) => {
  return (
    <button className={styles.buttons} onClick={onClick}>
      <Zap size={18} /> Сгенерировать
    </button>
  );
};

export default ZapButton;