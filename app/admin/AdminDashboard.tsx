"use client";

import { useState } from "react";
import Image from "next/image";
import { type LocalPhoto, savePhotoMetadata } from "@/lib/photos";
import styles from "./Admin.module.css";

export default function AdminDashboard({ initialPhotos }: { initialPhotos: LocalPhoto[] }) {
  const [photos, setPhotos] = useState<LocalPhoto[]>(initialPhotos);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);
  
  const performSave = async (dataToSave: LocalPhoto[]) => {
    setSaving(true);
    setMessage(null);
    try {
      const updatedPhotos = await savePhotoMetadata(dataToSave);
      setPhotos(updatedPhotos);
      setMessage({ text: "All changes saved!", type: "success" });
    } catch {
      setMessage({ text: "An error occurred while saving.", type: "error" });
    }
    setSaving(false);
    
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFieldChange = <K extends keyof LocalPhoto>(index: number, field: K, value: LocalPhoto[K]) => {
    const updated = [...photos];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setPhotos(updated);
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.actions}>
        <button 
          className={styles.saveButton} 
          onClick={() => performSave(photos)} 
          disabled={saving}
        >
          {saving ? "Saving..." : "Save All"}
        </button>
        <div className={styles.saveStatus}>
          {saving ? (
            <span className={styles.savingBadge}>Saving...</span>
          ) : message ? (
            <span className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </span>
          ) : null}
        </div>
      </div>

      <div className={styles.grid}>
        {photos.map((photo, i) => (
          <div key={photo.filename} className={styles.card}>
            <div className={styles.imageContainer}>
              <Image 
                src={photo.imagePath ?? `/photos/${photo.filename}`}
                alt={photo.alt}
                fill
                className={styles.image}
              />
            </div>
            <div className={styles.form}>
              <div className={styles.field}>
                <label>Title</label>
                <input 
                  type="text" 
                  value={photo.title} 
                  onChange={(e) => handleFieldChange(i, "title", e.target.value)} 
                  disabled={saving}
                />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Orientation (Read Only)</label>
                  <input
                    type="text"
                    value={photo.category === "portrait" ? "Portrait" : "Landscape"}
                    readOnly
                    disabled
                    className={styles.readonly}
                  />
                </div>
                <div className={styles.field}>
                  <label>Order</label>
                  <input 
                    type="number" 
                    value={photo.order} 
                    onChange={(e) => handleFieldChange(i, "order", Number(e.target.value))} 
                    disabled={saving}
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label>Capture Date (Read Only)</label>
                <input 
                  type="datetime-local" 
                  value={photo.date ? new Date(photo.date).toISOString().slice(0, 16) : ""} 
                  readOnly
                  disabled
                  className={styles.readonly}
                />
              </div>
              <div className={styles.field}>
                <label>Location</label>
                <input 
                  type="text" 
                  value={photo.location || ""} 
                  onChange={(e) => handleFieldChange(i, "location", e.target.value)}
                  placeholder="e.g. Dolomites, IT"
                  disabled={saving}
                />
              </div>
              <div className={styles.field}>
                <label>Phone Model (Read Only)</label>
                <input 
                  type="text" 
                  value={photo.phone || ""} 
                  readOnly 
                  disabled 
                  className={styles.readonly}
                />
              </div>
              <div className={styles.row}>
                <div className={styles.checkboxField}>
                  <input 
                    type="checkbox" 
                    id={`featured-${i}`}
                    checked={photo.featured || false} 
                    onChange={(e) => handleFieldChange(i, "featured", e.target.checked)} 
                    disabled={saving}
                  />
                  <label htmlFor={`featured-${i}`}>Featured</label>
                </div>
                <div className={styles.checkboxField}>
                  <input 
                    type="checkbox" 
                    id={`hidden-${i}`}
                    checked={photo.hidden || false} 
                    onChange={(e) => handleFieldChange(i, "hidden", e.target.checked)} 
                    disabled={saving}
                  />
                  <label htmlFor={`hidden-${i}`}>Hide</label>
                </div>
              </div>
            </div>
            <div className={styles.indexBadge}>
              #{String(photo.uploadIndex || 0).padStart(3, "0")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
