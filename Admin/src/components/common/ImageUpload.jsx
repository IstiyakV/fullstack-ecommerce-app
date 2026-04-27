import { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import api from '../../api/adminApi';
import toast from 'react-hot-toast';

export default function ImageUpload({ value, onChange, folder = '' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const fileRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const url = folder ? `/upload?folder=${folder}` : '/upload';
      const res = await api.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) {
        setPreview(res.data.url);
        onChange(res.data.url);
        toast.success('Image uploaded');
      } else toast.error('Upload failed');
    } catch { toast.error('Upload error'); }
    setUploading(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setPreview('');
    onChange('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const displaySrc = preview || value || '';

  return (
    <div>
      <div
        className={`image-upload-zone ${displaySrc ? 'has-image' : ''}`}
        onClick={() => fileRef.current?.click()}
      >
        {displaySrc ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={displaySrc}
                alt="Preview"
                className="image-preview"
                onError={(e) => { e.target.src = ''; e.target.style.display = 'none'; }}
              />
              <button
                type="button"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-sm"
                onClick={handleClear}
              >
                <FiX size={10} />
              </button>
            </div>
            <div className="text-left flex-1">
              <p className="text-xs font-medium text-slate-600">Image uploaded</p>
              <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{displaySrc}</p>
              <button type="button" className="text-xs text-indigo-500 font-medium mt-1 hover:underline">
                {uploading ? 'Uploading…' : 'Change image'}
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <FiImage size={24} />
            <span className="text-xs font-medium">
              {uploading ? 'Uploading…' : 'Click to upload image'}
            </span>
            <span className="text-[10px]">PNG, JPG, WEBP up to 5MB</span>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
