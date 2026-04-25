import { useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadImage } from '@/lib/upload-api';

interface ImageUploadProps {
    currentUrl?: string | null;
    onUpload: (_url: string) => void;
    onPreview?: (_localUrl: string) => void;
    onError?: (_message: string) => void;
    className?: string;
    children?: ReactNode;
}

export function ImageUpload({
    currentUrl,
    onUpload,
    onPreview,
    onError,
    className,
    children,
}: ImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const displayUrl = preview ?? currentUrl ?? null;

    async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);
        onPreview?.(localUrl);
        setIsUploading(true);
        try {
            const url = await uploadImage(file);
            onUpload(url);
        } catch {
            setPreview(null);
            onError?.('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    }

    return (
        <div
            className={cn('relative cursor-pointer', className)}
            onClick={() => inputRef.current?.click()}
        >
            {children ?? (
                <div className="w-full h-32 rounded-xl border-2 border-dashed border-outline flex flex-col items-center justify-center gap-2 hover:border-primary-blue hover:bg-soft-blue/30 transition-colors">
                    {displayUrl ? (
                        <img
                            src={displayUrl}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-xl"
                        />
                    ) : (
                        <>
                            <Upload className="w-6 h-6 text-secondary-text" />
                            <span className="text-tiny text-secondary-text">
                                Click to upload image
                            </span>
                        </>
                    )}
                </div>
            )}

            {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
                    <Loader2 className="w-6 h-6 text-primary-blue animate-spin" />
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => void handleFileChange(e)}
            />
        </div>
    );
}
