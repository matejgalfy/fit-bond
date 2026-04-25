import { useState } from 'react';

interface UserAvatarProps {
    name: string;
    imageUrl?: string | null;
    size?: number;
}

export function UserAvatar({ name, imageUrl, size = 32 }: UserAvatarProps) {
    const [imgFailed, setImgFailed] = useState(false);

    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('');

    if (imageUrl && !imgFailed) {
        return (
            <img
                src={imageUrl}
                alt={name}
                className="rounded-full object-cover shrink-0"
                style={{ width: size, height: size }}
                onError={() => {
                    setImgFailed(true);
                }}
            />
        );
    }

    return (
        <div
            className="rounded-full bg-linear-to-br from-primary-blue to-strong-blue flex items-center justify-center text-surface font-semibold shrink-0"
            style={{
                width: size,
                height: size,
                fontSize: size * 0.38,
            }}
        >
            {initials}
        </div>
    );
}
