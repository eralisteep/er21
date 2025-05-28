import { Edit } from "lucide-react";
import styles from "./Button.module.css";

const EditButton = ({ onClick }) => {
  return (
    <button className={styles.circleButton} onClick={onClick}>
      <Edit size={18} />
    </button>
  );
};

export default EditButton;