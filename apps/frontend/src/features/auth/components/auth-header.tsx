interface AuthHeaderProps {
    title: string;
    subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
    return (
        <div className="text-center mb-7">
            <h1 className="text-heading font-bold text-primary-text mb-1.5">
                {title}
            </h1>
            <p className="text-regular text-secondary-text">{subtitle}</p>
        </div>
    );
}
