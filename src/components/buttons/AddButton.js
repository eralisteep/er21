import { Plus } from "lucide-react";
import styles from "./Button.module.css";

const AddButton = ({ onClick }) => {
  return (
    <button className={styles.circleButton} onClick={onClick}>
      <Plus size={18} />
    </button>
  );
};

export default AddButton;