"use client";

import { useState } from "react";
import { ImageSlotWrapper } from "@/components/visual-enforcement";

type UserAvatarProps = {
  initials?: string;
  imageUrl?: string;
};

export default function UserAvatar({ initials = "TM", imageUrl }: UserAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = !!imageUrl && !imgFailed;

  return (
    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[radial-gradient(circle_at_30%_20%,rgba(73,233,255,0.95),rgba(120,54,255,0.92)_58%,rgba(17,13,35,1)_100%)] text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(73,233,255,0.22)]">
      {showImage ? (
        <ImageSlotWrapper
          imageId={`user-avatar-${initials.toLowerCase()}`}
          roomId="user-avatar"
          priority="normal"
          fallbackUrl={imageUrl}
          altText="User avatar"
          className="w-full h-full object-cover"
          containerStyle={{ width: "100%", height: "100%" }}
        />
      ) : (
        initials
      )}
    </div>
  );
}
