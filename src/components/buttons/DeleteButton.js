import { Trash2 } from "lucide-react";
import styles from "./Button.module.css";

const DeleteButton = ({ onClick }) => {
  return (
    <button className={styles.circleButton} onClick={onClick}>
      <Trash2 size={18} />
    </button>
  );
};

export default DeleteButton;
