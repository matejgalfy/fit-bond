import type { ReactNode } from 'react';

interface FormFieldProps {
    label: string;
    htmlFor?: string;
    required?: boolean;
    children: ReactNode;
}

export function FormField({
    label,
    htmlFor,
    required = false,
    children,
}: FormFieldProps) {
    const labelContent = (
        <>
            {label}
            {required && <span className="text-primary-red ml-0.5">*</span>}
        </>
    );

    return (
        <div>
            {htmlFor ? (
                <label
                    htmlFor={htmlFor}
                    className="text-small text-primary-text font-medium mb-1.5 block"
                >
                    {labelContent}
                </label>
            ) : (
                <span className="text-small text-primary-text font-medium mb-1.5 block">
                    {labelContent}
                </span>
            )}
            {children}
        </div>
    );
}
