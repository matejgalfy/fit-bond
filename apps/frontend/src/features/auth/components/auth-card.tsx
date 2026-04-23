import * as React from 'react';

export function AuthCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-surface border border-outline rounded-2xl p-7">
            {children}
        </div>
    );
}
