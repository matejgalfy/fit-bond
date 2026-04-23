export function AuthDivider() {
    return (
        <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-outline" />
            <span className="text-tiny text-secondary-text">or</span>
            <div className="flex-1 h-px bg-outline" />
        </div>
    );
}
