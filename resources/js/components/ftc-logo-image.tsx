import { cn } from '@/lib/utils';

type FtcLogoImageProps = {
    className?: string;
    imageClassName?: string;
    alt?: string;
};

export function FtcLogoImage({
    className,
    imageClassName,
    alt = 'Fire Teknik Corporation logo',
}: FtcLogoImageProps) {
    return (
        <span
            className={cn(
                'flex items-center justify-center overflow-hidden rounded-[inherit]',
                className,
            )}
        >
            <img
                src="/branding/ftc-logo.png"
                alt={alt}
                className={cn('h-full w-full object-contain', imageClassName)}
            />
        </span>
    );
}
