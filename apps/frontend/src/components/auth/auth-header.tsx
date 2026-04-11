interface AuthHeaderProps {
    title: string;
    subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
    return (
        <div className="text-center mb-7">
            <h1 className="text-[26px] font-bold text-foreground mb-1.5">
                {title}
            </h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
    );
}
