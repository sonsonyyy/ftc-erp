import AppLogoIcon from '@/components/app-logo-icon';
import { FtcLogoImage } from '@/components/ftc-logo-image';
import { cn } from '@/lib/utils';

export default function AppLogo({
    compact = false,
    showSubtitle = true,
    className,
}: {
    compact?: boolean;
    showSubtitle?: boolean;
    className?: string;
}) {
    return (
        <div className={cn('flex min-w-0 items-center gap-2.5', className)}>
            <div
                className={cn(
                    'relative flex size-10 shrink-0 items-center justify-center overflow-hidden',
                    compact && 'size-8',
                )}
            >
                {compact ? (
                    <AppLogoIcon className="size-5" />
                ) : (
                    <>
                        <FtcLogoImage
                            className="size-full group-data-[collapsible=icon]/sidebar-wrapper:hidden"
                            imageClassName="scale-[1.02]"
                        />
                        <AppLogoIcon className="hidden size-5 group-data-[collapsible=icon]/sidebar-wrapper:block" />
                    </>
                )}
            </div>

            {!compact ? (
                <div className="grid min-w-0 flex-1 text-left group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                    <span className="truncate text-[13px] leading-tight font-semibold tracking-tight text-sidebar-foreground">
                        Fire Teknik Corporation
                    </span>
                    {showSubtitle ? (
                        <span className="truncate text-[10px] leading-3.5 font-medium tracking-[0.01em] whitespace-nowrap text-sidebar-foreground/65">
                            Protection is the best action
                        </span>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
