import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

import imageCompression from 'browser-image-compression';

export default function UploadModal({ onClose, selectedChapter }) {
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [caption, setCaption] = useState("");
  const [chapterId, setChapterId] = useState(selectedChapter?.id || "the_present");
  const [isUploading, setIsUploading] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
    }
  };

  const processFiles = (newFiles) => {
    setFiles((prev) => [...prev, ...newFiles]);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleAudioChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0 || !title.trim()) return;
    setIsUploading(true);
    
    try {
      // 1. Compress and Upload Photos
      const uploadPromises = files.map(async (file) => {
        // Compress the image before uploading to avoid 10MB limit
        const options = {
          maxSizeMB: 8,          // Keep it under Cloudinary's 10MB limit
          maxWidthOrHeight: 2560, // Standard high-quality res
          useWebWorker: true
        };
        
        let fileToUpload = file;
        try {
          fileToUpload = await imageCompression(file, options);
        } catch (err) {
          console.warn("Compression failed, trying original file", err);
        }

        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.secure_url;
      });
      const photoUrls = await Promise.all(uploadPromises);

      // 2. Upload Audio if exists
      let audioUrl = null;
      if (audioFile) {
        const audioData = new FormData();
        audioData.append("file", audioFile);
        audioData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        // Cloudinary processes audio through the /video endpoint
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`,
          { method: "POST", body: audioData }
        );
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        audioUrl = data.secure_url;
      }

      // 3. Save to Firestore
      await addDoc(collection(db, "memories"), {
        title,
        caption,
        photos: photoUrls,
        audioUrl: audioUrl,
        chapterId,
        date: new Date().getFullYear().toString(),
        createdAt: serverTimestamp(),
      });

      onClose();
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload memory. Please check your Cloudinary config.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="um-overlay" onClick={onClose}>
      <div className="um-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="um-header">
          <div style={{ flex: 1 }} />
          <h2 className="um-header-title">New Memory</h2>
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            <button className="um-close-btn" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <div className="um-scroll-area">
          
          {/* Photo Section */}
          <div className="um-section">
            {previews.length === 0 ? (
              <label 
                className={`um-dropzone-large ${isDragging ? 'dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                <div className="um-dropzone-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
                <p className="um-dropzone-text">Add photographs</p>
                <p className="um-dropzone-subtext">Click to browse or drag and drop</p>
              </label>
            ) : (
              <div 
                className={`um-photo-gallery ${isDragging ? 'dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <div className="um-gallery-scroll">
                  {previews.map((src, index) => (
                    <div key={index} className="um-gallery-item">
                      <img src={src} alt="preview" />
                      <button className="um-gallery-remove" onClick={() => removeFile(index)}>×</button>
                    </div>
                  ))}
                  <label className="um-gallery-add">
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                    <span>+</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="um-section um-details">
            <input 
              type="text"
              className="um-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this memory a title..."
            />
            
            <textarea 
              className="um-story-input"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write the story behind these photos..."
            />

            {/* Audio Upload */}
            <label className="um-audio-upload">
              <input type="file" accept="audio/*" onChange={handleAudioChange} style={{ display: "none" }} />
              <div className="um-audio-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                <span>{audioFile ? audioFile.name : "Add Background Music (Optional)"}</span>
              </div>
            </label>
          </div>

          {/* Timeline Section */}
          <div className="um-section">
            <p className="um-label">Select Timeline</p>
            <div className="um-timeline-selector">
              {[
                { id: "the_past", label: "The Journey", sub: "2019-2025" },
                { id: "the_present", label: "The Present", sub: "2026" },
                { id: "the_future", label: "The Future", sub: "2027+" }
              ].map(planet => (
                <button
                  key={planet.id}
                  className={`um-timeline-btn ${chapterId === planet.id ? 'active' : ''}`}
                  onClick={() => setChapterId(planet.id)}
                >
                  <span className="um-tb-main">{planet.label}</span>
                  <span className="um-tb-sub">{planet.sub}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="um-footer">
          <button 
            className="um-save-btn" 
            onClick={handleUpload}
            disabled={files.length === 0 || !title.trim() || isUploading}
          >
            {isUploading ? "Saving to Stars..." : "Save Memory"}
          </button>
        </div>
      </div>

      <style>{`
        .um-overlay { position: fixed; inset: 0; z-index: 2147483647; background: rgba(5, 8, 16, 0.85); backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center; padding: 20px; animation: modalFadeIn 0.4s ease; pointer-events: auto; }
        .um-card { width: 100%; max-width: 560px; max-height: 85vh; background: #0c1020; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 40px 100px rgba(0,0,0,0.8); display: flex; flex-direction: column; overflow: hidden; animation: modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        
        .um-header { display: flex; align-items: center; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .um-header-title { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: white; margin: 0; text-align: center; }
        .um-close-btn { background: transparent; border: none; color: rgba(255,255,255,0.5); cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; transition: color 0.2s; }
        .um-close-btn:hover { color: white; }
        
        .um-scroll-area { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 24px; }
        .um-scroll-area::-webkit-scrollbar { width: 6px; }
        .um-scroll-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 6px; }
        .um-scroll-area::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
        
        .um-section { display: flex; flex-direction: column; }
        
        /* Dropzone */
        .um-dropzone-large { width: 100%; height: 160px; border: 1px dashed rgba(255,255,255,0.2); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; background: rgba(255,255,255,0.02); transition: all 0.3s; }
        .um-dropzone-large:hover, .um-dropzone-large.dragging { background: rgba(255,255,255,0.05); border-color: rgba(140, 168, 255, 0.8); }
        .um-dropzone-icon { width: 48px; height: 48px; border-radius: 50%; background: rgba(140, 168, 255, 0.1); color: #8ca8ff; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        .um-dropzone-text { font-family: 'Inter', sans-serif; font-size: 14px; color: white; margin: 0 0 6px 0; font-weight: 500; }
        .um-dropzone-subtext { font-family: 'Inter', sans-serif; font-size: 12px; color: rgba(255,255,255,0.4); margin: 0; }
        
        /* Gallery */
        .um-photo-gallery { background: rgba(0,0,0,0.2); border-radius: 12px; padding: 16px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s; }
        .um-photo-gallery.dragging { border-color: rgba(140, 168, 255, 0.8); background: rgba(140, 168, 255, 0.05); }
        .um-gallery-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; }
        .um-gallery-scroll::-webkit-scrollbar { height: 6px; }
        .um-gallery-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 6px; }
        .um-gallery-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
        
        .um-gallery-item { position: relative; width: 100px; height: 100px; border-radius: 10px; overflow: hidden; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
        .um-gallery-item img { width: 100%; height: 100%; object-fit: cover; }
        .um-gallery-remove { position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; width: 24px; height: 24px; font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: all 0.2s; }
        .um-gallery-item:hover .um-gallery-remove { opacity: 1; }
        .um-gallery-remove:hover { background: rgba(255,50,50,0.9); }
        
        .um-gallery-add { width: 100px; height: 100px; border-radius: 10px; border: 1px dashed rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer; background: rgba(255,255,255,0.02); flex-shrink: 0; transition: all 0.2s; }
        .um-gallery-add:hover { background: rgba(255,255,255,0.08); }
        .um-gallery-add span { font-size: 28px; font-weight: 200; color: rgba(255,255,255,0.5); }
        
        /* Details */
        .um-details { gap: 16px; }
        .um-title-input { width: 100%; background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,0.1); font-family: 'Playfair Display', serif; font-size: 24px; color: white; padding-bottom: 8px; outline: none; transition: border-color 0.3s; }
        .um-title-input:focus { border-color: #8ca8ff; }
        .um-title-input::placeholder { color: rgba(255,255,255,0.3); }
        
        .um-story-input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; font-family: 'Lora', serif; font-size: 14px; color: rgba(255,255,255,0.9); padding: 16px; min-height: 100px; outline: none; resize: vertical; line-height: 1.6; font-style: italic; transition: all 0.3s; }
        .um-story-input:focus { background: rgba(255,255,255,0.06); border-color: rgba(140, 168, 255, 0.4); }
        .um-story-input::placeholder { color: rgba(255,255,255,0.3); }
        
        /* Audio Upload */
        .um-audio-upload { cursor: pointer; display: block; margin-top: 4px; }
        .um-audio-btn { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.2); border-radius: 10px; color: rgba(255,255,255,0.7); font-family: 'Inter', sans-serif; font-size: 13px; transition: all 0.2s; }
        .um-audio-btn:hover { background: rgba(255,255,255,0.06); color: white; border-color: rgba(140, 168, 255, 0.4); }
        .um-audio-btn span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px; }
        
        /* Timeline Selection */
        .um-label { font-family: 'Inter', sans-serif; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin: 0 0 12px 0; }
        .um-timeline-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .um-timeline-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; cursor: pointer; transition: all 0.2s; }
        .um-timeline-btn:hover { background: rgba(255,255,255,0.08); }
        .um-timeline-btn.active { background: rgba(140, 168, 255, 0.15); border-color: #8ca8ff; box-shadow: 0 0 20px rgba(140, 168, 255, 0.2); }
        .um-tb-main { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; color: white; text-align: center; }
        .um-tb-sub { font-family: 'Inter', sans-serif; font-size: 9px; color: rgba(255,255,255,0.5); }
        .um-timeline-btn.active .um-tb-sub { color: #8ca8ff; }
        
        /* Footer */
        .um-footer { padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2); display: flex; justify-content: stretch; }
        .um-save-btn { flex: 1; background: white; color: black; border: none; border-radius: 10px; padding: 12px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .um-save-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,255,255,0.2); }
        .um-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        
        @media (max-width: 600px) {
          .um-scroll-area { padding: 20px 16px; gap: 20px; }
          .um-timeline-selector { grid-template-columns: 1fr; }
          .um-title-input { font-size: 20px; }
          .um-footer { padding: 16px; }
        }
      `}</style>
    </div>
  );
}
