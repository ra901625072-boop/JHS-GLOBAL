import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';

/**
 * FileUploader — Phase 2
 *
 * Operational file upload zone:
 * - Drag and drop or file selector trigger
 * - Format & size guidance
 * - Uploading / success / error states
 */
export const FileUploader = ({
  onFileSelect,
  accept = 'image/*,.pdf',
  maxSizeMb = 10,
  label = 'Upload document or image',
  hint = 'PDF, WebP, PNG or JPG up to 10MB',
  currentFileUrl,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndProcess = (file) => {
    setError(null);
    if (!file) return;

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File exceeds maximum size of ${maxSizeMb}MB.`);
      return;
    }

    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcess(e.target.files[0]);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-admin-md p-5 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-[var(--admin-brand)] bg-[var(--admin-surface-subtle)]'
            : 'border-[var(--admin-border)] hover:border-[var(--admin-border-strong)] bg-white'
        }`}
        style={{ transitionDuration: 'var(--admin-duration-micro)' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          aria-label={label}
        />

        {selectedFile ? (
          <div className="flex items-center justify-between gap-3 text-left p-2 bg-[var(--admin-surface-subtle)] rounded-admin-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-5 h-5 text-[var(--admin-brand)] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--admin-text-primary)] truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[10px] text-[var(--admin-text-muted)] font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="p-1 text-[var(--admin-text-muted)] hover:text-rose-700 rounded-admin-sm transition-colors"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="w-8 h-8 rounded-admin-md bg-[var(--admin-surface-subtle)] flex items-center justify-center text-[var(--admin-text-muted)]">
              <UploadCloud className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-[var(--admin-text-primary)]">
              <span className="text-[var(--admin-brand)] underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-[11px] text-[var(--admin-text-muted)]">{hint}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {currentFileUrl && !selectedFile && (
        <div className="text-[11px] text-[var(--admin-text-muted)] flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>Current file: </span>
          <a
            href={currentFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--admin-brand)] underline font-medium truncate max-w-xs"
          >
            {currentFileUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
