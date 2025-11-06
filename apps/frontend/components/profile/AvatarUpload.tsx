'use client';

import React, { useState, useRef } from 'react';
import { Camera, X, User } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange?: (file: File) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
}

export default function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  size = 'lg',
  disabled = false,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Call parent handler
      onAvatarChange?.(file);
    }
  };

  const handleRemoveAvatar = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        className={`${sizeClasses[size]} relative rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer transition-all duration-200 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
        } ${isHovered ? 'scale-105' : ''}`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <User className={`${iconSizes[size]} text-white`} />
          </div>
        )}

        {/* Overlay */}
        {!disabled && (
          <div
            className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Camera className={`${iconSizes[size]} text-white`} />
          </div>
        )}

        {/* Remove button */}
        {preview && !disabled && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveAvatar();
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {!disabled && (
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Click to upload a new photo
          </p>
          <p className="text-xs text-gray-300 mt-1">
            JPG, PNG or GIF (max 5MB)
          </p>
        </div>
      )}
    </div>
  );
}
