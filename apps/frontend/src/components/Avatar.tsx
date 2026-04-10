interface AvatarProps {
    name: string;
    size?: number;
}

export function Avatar({ name, size = 32 }: AvatarProps) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('');
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0080FF, #0060CC)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: size * 0.38,
                fontWeight: 600,
                flexShrink: 0,
            }}
        >
            {initials}
        </div>
    );
}
