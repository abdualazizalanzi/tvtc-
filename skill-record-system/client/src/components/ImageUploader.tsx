import React, { useState } from 'react';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  maxSize?: number;
  aspectRatio?: 'square' | 'video' | 'any';
  placeholder?: React.ReactNode;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  maxSize = 5 * 1024 * 1024, // 5MB
  aspectRatio = 'any',
  placeholder,
  className,
}) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > maxSize) {
        setError('File size exceeds the maximum limit.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onChange(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`image-uploader ${className}`}>
      {preview ? (
        <img src={preview} alt="Preview" className="preview-image" />
      ) : (
        placeholder
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="file-input"
      />
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ImageUploader;