import * as React from 'react';

export function AuthCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-card border border-border rounded-2xl p-7">
            {children}
        </div>
    );
}
