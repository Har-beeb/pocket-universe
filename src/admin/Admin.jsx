// Admin.jsx — Simple private upload panel for photos

import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export default function Admin() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState("");

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    
    // Create a storage reference
    const storageRef = ref(storage, `memories/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(p);
      },
      (error) => {
        console.error("Upload failed", error);
        setUploading(false);
        alert("Upload failed. Check console and Firebase rules.");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUrl(downloadURL);
          setUploading(false);
          setFile(null);
        });
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <div className="max-w-xl mx-auto bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl">
        <h1 className="text-2xl font-semibold text-white mb-2">Our Universe Admin</h1>
        <p className="text-slate-400 mb-8 text-sm">
          Upload photos here. Once uploaded, copy the URL and paste it into your `chapters.js` file.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Select Photo</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-200 hover:file:bg-blue-800"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          {uploading ? `Uploading... ${Math.round(progress)}%` : "Upload Photo"}
        </button>

        {url && (
          <div className="mt-8 p-4 bg-slate-950 rounded-lg border border-green-900/30">
            <p className="text-green-400 text-sm font-medium mb-2">Upload Successful!</p>
            <p className="text-slate-400 text-xs mb-2">Copy this URL to your chapters.js file:</p>
            <textarea 
              readOnly 
              value={url} 
              className="w-full bg-slate-900 text-slate-300 text-xs p-3 rounded border border-slate-700 focus:outline-none"
              rows="3"
              onClick={(e) => e.target.select()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
