import styles from "./styles.module.css";
import { useState } from "react";
import QuillEditor from "react-quill";


const Editor = () => {
  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>Editor Content</label>
    </div>
  );
};

export default Editor;