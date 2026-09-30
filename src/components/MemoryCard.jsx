import { useEffect, useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";

export default function MemoryCard({ memory, onClose }) {
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Album Data
  const [editedTitle, setEditedTitle] = useState(memory.title || "");
  const [editedCaption, setEditedCaption] = useState(memory.caption || "");
  const [editedPhotos, setEditedPhotos] = useState(memory.photos || [memory.photoUrl]);
  const [editedAudioUrl, setEditedAudioUrl] = useState(memory.audioUrl || null);
  
  // Upload State
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [newAudioFile, setNewAudioFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Slideshow State
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play by default!
  const [slideDirection, setSlideDirection] = useState("right");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Slideshow Timer
  useEffect(() => {
    let timer;
    if (isPlaying && !isEditing && editedPhotos.length > 1) {
      timer = setInterval(() => {
        setSlideDirection("right");
        setPhotoIndex(prev => (prev + 1) % editedPhotos.length);
      }, 4000); // 4 seconds per slide
    }
    return () => clearInterval(timer);
  }, [isPlaying, isEditing, editedPhotos.length]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 500);
  };

  const nextPhoto = (e) => {
    e?.stopPropagation();
    setSlideDirection("right");
    setPhotoIndex((i) => (i + 1) % editedPhotos.length);
    setIsPlaying(false);
  };

  const prevPhoto = (e) => {
    e?.stopPropagation();
    setSlideDirection("left");
    setPhotoIndex((i) => (i - 1 + editedPhotos.length) % editedPhotos.length);
    setIsPlaying(false);
  };

  const handleRemoveOldPhoto = (index, e) => {
    e.stopPropagation();
    setEditedPhotos(prev => prev.filter((_, i) => i !== index));
    if (photoIndex >= editedPhotos.length - 1) setPhotoIndex(0);
  };

  const removeNewFile = (index, e) => {
    e.stopPropagation();
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const added = Array.from(e.target.files);
      setNewFiles(prev => [...prev, ...added]);
      setNewPreviews(prev => [...prev, ...added.map(f => URL.createObjectURL(f))]);
    }
  };

  const handleAudioChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewAudioFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      let finalPhotos = [...editedPhotos];
      if (newFiles.length > 0) {
        const uploadPromises = newFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
          const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
          const data = await response.json();
          if (data.error) throw new Error(data.error.message);
          return data.secure_url;
        });
        const newPhotoUrls = await Promise.all(uploadPromises);
        finalPhotos = [...finalPhotos, ...newPhotoUrls];
      }

      let finalAudioUrl = editedAudioUrl;
      if (newAudioFile) {
        const audioData = new FormData();
        audioData.append("file", newAudioFile);
        audioData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`, { method: "POST", body: audioData });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        finalAudioUrl = data.secure_url;
      }

      const docRef = doc(db, "memories", memory.id);
      await updateDoc(docRef, { title: editedTitle, caption: editedCaption, photos: finalPhotos, audioUrl: finalAudioUrl });
      
      setEditedPhotos(finalPhotos);
      setEditedAudioUrl(finalAudioUrl);
      setNewFiles([]);
      setNewPreviews([]);
      setNewAudioFile(null);
      setIsEditing(false);
    } catch (error) {
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    const confirmed = window.confirm("Are you sure you want to delete this memory entirely? This cannot be undone.");
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "memories", memory.id));
      handleClose();
    } catch (error) {
      alert("Failed to delete memory.");
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="slideshow-overlay"
      style={{
        position: "fixed", inset: 0, zIndex: 2147483647,
        background: "#000",
        opacity: visible ? 1 : 0, transition: "opacity 0.6s ease-out", pointerEvents: "auto",
        display: "flex", flexDirection: "column"
      }}
    >
      {/* Blurred Background to fill empty spaces */}
      <div className="slideshow-bg">
        {editedPhotos.length > 0 && <img src={editedPhotos[photoIndex]} alt="bg" />}
      </div>

      {/* Top Navigation Bar (Left side only, right side left empty for SoundToggle) */}
      <div className="slideshow-navbar">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={handleClose} className="ss-icon-btn" title="Back to Universe">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "12px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
              {memory.chapterId === "the_past" ? "2019 - 2025" : memory.chapterId === "the_future" ? "2027 & Beyond" : "2026"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Slideshow Area */}
      <div className="slideshow-content">
        {editedPhotos.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.img 
              key={photoIndex} 
              src={editedPhotos[photoIndex]} 
              alt="slide" 
              className="slideshow-image"
              initial={{ opacity: 0, x: slideDirection === "right" ? 50 : -50, filter: "blur(5px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: slideDirection === "right" ? -50 : 50, filter: "blur(5px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </AnimatePresence>
        ) : (
          <div style={{ color: 'white' }}>No photos available</div>
        )}

        {/* Navigation Arrows */}
        {editedPhotos.length > 1 && !isEditing && (
          <>
            <button className="ss-nav-arrow left" onClick={prevPhoto}>‹</button>
            <button className="ss-nav-arrow right" onClick={nextPhoto}>›</button>
          </>
        )}
      </div>

      {/* Text & Editing Area Overlay (Bottom) */}
      <div className={`slideshow-footer ${isEditing ? 'editing' : ''}`}>
        <div className="ss-footer-content">
          {isEditing ? (
            <div className="ss-edit-form">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontFamily: "'Inter'" }}>Editing Album</p>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={handleDelete} disabled={isDeleting} className="ss-btn-danger">Delete Album</button>
                  <button onClick={handleSave} disabled={isSaving} className="ss-btn-primary">
                    {isSaving ? "Saving..." : "Done Editing"}
                  </button>
                </div>
              </div>
              <input 
                className="ss-title-input" 
                value={editedTitle} 
                onChange={e => setEditedTitle(e.target.value)} 
                placeholder="Album Title" 
              />
              <textarea 
                className="ss-story-input" 
                value={editedCaption} 
                onChange={e => setEditedCaption(e.target.value)} 
                placeholder="Write the story behind these memories..." 
              />
              
              <label className="ss-audio-upload">
                <input type="file" accept="audio/*" onChange={handleAudioChange} style={{ display: "none" }} />
                <div className="ss-audio-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                  <span>{newAudioFile ? newAudioFile.name : editedAudioUrl ? "Replace Background Music" : "Add Background Music"}</span>
                </div>
              </label>
              
              <div className="ss-edit-photos-dock">
                <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: "12px", fontFamily: "'Inter'" }}>Manage Photos</p>
                <div className="ss-preview-row">
                  {editedPhotos.map((src, idx) => (
                    <div key={`old-${idx}`} className={`ss-preview-box ${idx === photoIndex ? 'selected' : ''}`} onClick={() => setPhotoIndex(idx)}>
                      <img src={src} alt="old-preview" />
                      <button onClick={(e) => handleRemoveOldPhoto(idx, e)} className="ss-remove-btn">×</button>
                    </div>
                  ))}
                  {newPreviews.map((src, idx) => (
                    <div key={`new-${idx}`} className="ss-preview-box new-upload">
                      <img src={src} alt="new-preview" />
                      <div className="uploading-overlay">New</div>
                      <button onClick={(e) => removeNewFile(idx, e)} className="ss-remove-btn">×</button>
                    </div>
                  ))}
                  <label className="ss-add-more-btn">
                    <span>+</span>
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="ss-footer-view">
              <div className="ss-text-display">
                <h1 className="ss-title">{editedTitle}</h1>
                <p className="ss-story">{editedCaption}</p>
              </div>
              
              <div className="ss-nav-actions">
                {editedPhotos.length > 1 && (
                  <button onClick={() => setIsPlaying(!isPlaying)} className="ss-icon-btn" title={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
                  </button>
                )}
                <button 
                  onClick={() => {
                    import("../components/PinModal").then(({ promptForPin }) => {
                      promptForPin().then(success => {
                        if (success) {
                          setIsEditing(true);
                          setIsPlaying(false);
                        }
                      });
                    });
                  }} 
                  className="ss-icon-btn ss-edit-btn" 
                  title="Edit Album"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  <span>Edit</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Progress Indicators (Bottom Center) */}
        {editedPhotos.length > 1 && !isEditing && (
          <div className="ss-indicators">
            {editedPhotos.map((_, idx) => (
              <div key={idx} className={`ss-dot ${idx === photoIndex ? 'active' : ''}`} onClick={() => { setPhotoIndex(idx); setIsPlaying(false); }} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .slideshow-overlay { font-family: 'Inter', sans-serif; }
        .slideshow-bg { position: absolute; inset: -50px; z-index: 0; pointer-events: none; }
        .slideshow-bg img { width: 100%; height: 100%; object-fit: cover; filter: blur(40px) brightness(0.25); opacity: 0.8; }
        
        .slideshow-navbar { position: absolute; top: 0; left: 0; right: 0; display: flex; justify-content: space-between; align-items: flex-start; padding: 24px 40px; z-index: 100; background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%); pointer-events: none; }
        .slideshow-navbar > * { pointer-events: auto; }
        
        .ss-nav-actions { display: flex; gap: 12px; align-items: center; }
        
        /* Perfectly matched to SoundToggle */
        .ss-icon-btn { width: 44px; height: 44px; background: rgba(10,14,28,0.4); border: 1px solid rgba(255,255,255,0.1); color: white; cursor: pointer; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s; backdrop-filter: blur(16px); }
        .ss-icon-btn:hover { background: rgba(0,0,0,0.8); border-color: rgba(255,255,255,0.5); transform: scale(1.05); }
        
        .ss-edit-btn { border-radius: 24px; padding: 0 20px; width: auto; gap: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; }
        
        .ss-btn-primary { background: white; color: black; border: none; border-radius: 24px; padding: 12px 24px; font-size: 11px; font-weight: 600; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; transition: transform 0.2s; }
        .ss-btn-primary:hover:not(:disabled) { transform: scale(1.05); }
        .ss-btn-danger { background: rgba(255,50,50,0.15); color: #ff6b6b; border: 1px solid rgba(255,50,50,0.3); border-radius: 24px; padding: 12px 24px; font-size: 11px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; transition: background 0.2s; }
        .ss-btn-danger:hover:not(:disabled) { background: rgba(255,50,50,0.3); }

        .slideshow-content { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; z-index: 10; padding: 80px 0; overflow: hidden; pointer-events: none; }
        .slideshow-image { max-width: 100%; max-height: 100vh; object-fit: contain; box-shadow: 0 20px 60px rgba(0,0,0,0.5); pointer-events: auto; }
        
        .ss-nav-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: white; font-size: 40px; font-weight: 200; padding: 20px; cursor: pointer; opacity: 0; transition: opacity 0.3s; z-index: 20; text-shadow: 0 4px 12px rgba(0,0,0,0.5); pointer-events: auto; }
        .slideshow-content:hover .ss-nav-arrow { opacity: 0.5; }
        .ss-nav-arrow:hover { opacity: 1 !important; }
        .ss-nav-arrow.left { left: 40px; }
        .ss-nav-arrow.right { right: 40px; }
        
        .slideshow-footer { position: absolute; bottom: 0; left: 0; right: 0; z-index: 100; background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%); padding: 80px 40px 24px 40px; display: flex; flex-direction: column; align-items: center; pointer-events: none; transition: all 0.3s; }
        .slideshow-footer.editing { background: rgba(10, 14, 28, 0.95); backdrop-filter: blur(20px); border-top: 1px solid rgba(255,255,255,0.1); padding: 40px; pointer-events: auto; }
        
        .ss-footer-content { max-width: 1000px; width: 100%; pointer-events: auto; }
        
        .ss-footer-view { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; gap: 24px; }
        .ss-text-display { text-shadow: 0 2px 12px rgba(0,0,0,0.8); flex: 1; padding-right: 20px; }
        .ss-title { font-family: 'Playfair Display', serif; font-size: 36px; margin: 0 0 12px 0; font-weight: 500; color: white; line-height: 1.1; letter-spacing: 0.02em; }
        .ss-story { font-family: 'Inter', sans-serif; font-weight: 300; font-size: 15px; line-height: 1.6; color: rgba(255,255,255,0.85); margin: 0; max-height: 120px; overflow-y: auto; }
        
        .ss-indicators { display: flex; gap: 8px; z-index: 20; padding: 12px 24px; pointer-events: auto; }
        .ss-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.3); cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.5); }
        .ss-dot.active { background: white; transform: scale(1.8); box-shadow: 0 0 10px rgba(255,255,255,0.5); }
        
        .ss-edit-form { display: flex; flex-direction: column; gap: 20px; width: 100%; }
        .ss-title-input { width: 100%; background: transparent; border: none; border-bottom: 1px dashed rgba(255,255,255,0.3); font-family: 'Playfair Display', serif; font-size: 32px; color: white; padding-bottom: 8px; outline: none; }
        .ss-story-input { width: 100%; background: rgba(0,0,0,0.3); border: 1px dashed rgba(255,255,255,0.2); border-radius: 12px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300; color: white; padding: 20px; min-height: 100px; outline: none; resize: vertical; line-height: 1.6; }
        .ss-title-input:focus, .ss-story-input:focus { border-color: rgba(140, 168, 255, 0.6); }
        
        .ss-audio-upload { cursor: pointer; display: block; }
        .ss-audio-btn { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: rgba(0,0,0,0.3); border: 1px dashed rgba(255,255,255,0.2); border-radius: 12px; color: rgba(255,255,255,0.7); font-family: 'Inter', sans-serif; font-size: 13px; transition: all 0.2s; }
        .ss-audio-btn:hover { background: rgba(255,255,255,0.06); color: white; border-color: rgba(140, 168, 255, 0.4); }
        .ss-audio-btn span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px; }
        
        .ss-edit-photos-dock { background: rgba(0,0,0,0.4); border-radius: 16px; padding: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .ss-preview-row { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px; }
        .ss-preview-row::-webkit-scrollbar { height: 6px; }
        .ss-preview-row::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        .ss-preview-row::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
        .ss-preview-box { position: relative; width: 80px; height: 80px; border-radius: 12px; overflow: hidden; flex-shrink: 0; border: 2px solid transparent; cursor: pointer; transition: all 0.2s; }
        .ss-preview-box.selected { border-color: white; transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.5); }
        .ss-preview-box img { width: 100%; height: 100%; object-fit: cover; }
        .ss-remove-btn { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; width: 24px; height: 24px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: all 0.2s; }
        .ss-preview-box:hover .ss-remove-btn { opacity: 1; }
        .ss-remove-btn:hover { background: rgba(255,50,50,0.8); }
        
        .new-upload .uploading-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(140,168,255,0.9); padding: 4px; font-family: 'Inter'; font-size: 9px; text-transform: uppercase; color: black; font-weight: bold; text-align: center; }
        
        .ss-add-more-btn { width: 80px; height: 80px; border-radius: 12px; border: 1px dashed rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer; background: rgba(255,255,255,0.05); flex-shrink: 0; transition: background 0.2s; }
        .ss-add-more-btn:hover { background: rgba(255,255,255,0.1); border-color: white; }
        .ss-add-more-btn span { color: rgba(255,255,255,0.5); font-size: 32px; font-weight: 200; }
        
        @media (max-width: 800px) {
          .slideshow-navbar { padding: 20px 20px; }
          .ss-icon-btn { width: 40px; height: 40px; }
          .ss-nav-arrow { display: none !important; }
          
          .slideshow-footer { padding: 60px 20px 16px 20px; }
          .slideshow-footer.editing { padding: 20px 16px; }
          
          .ss-footer-view { flex-direction: row; align-items: flex-end; gap: 12px; margin-bottom: 12px; }
          .ss-text-display { padding-right: 0; }
          .ss-title { font-size: 26px; margin-bottom: 8px; }
          .ss-story { font-size: 13px; max-height: 100px; }
          .ss-nav-actions { flex-direction: column; }
          .ss-edit-btn { padding: 0; width: 40px; border-radius: 50%; }
          .ss-edit-btn span { display: none; }
          
          .ss-indicators { padding: 8px; }
        }
      `}</style>
    </div>
  );
}
