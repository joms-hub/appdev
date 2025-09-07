"use client";

import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";
import { useState } from "react";

interface NavProfilePictureProps {
  imageUrl?: string | null;
}

export default function NavProfilePicture({ imageUrl }: NavProfilePictureProps) {
  const [imageError, setImageError] = useState(false);
  
  if (imageUrl && !imageError) {
    return (
      <div className="relative w-12 h-12 rounded-full border-2 border-gray-400 overflow-hidden">
        <Image
          src={imageUrl}
          alt="Profile Picture"
          fill
          className="object-cover object-center"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }
  
  return <FaUserCircle size={50} color="#ccc" />;
}
