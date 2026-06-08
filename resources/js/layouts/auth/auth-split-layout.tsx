import { Link, usePage } from '@inertiajs/react';
import { ClipboardList, FileText, Package, ShieldCheck } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { FtcLogoImage } from '@/components/ftc-logo-image';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="grid min-h-svh bg-background lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative hidden min-h-svh overflow-hidden lg:block">
                <img
                    src="/auth-cover.svg"
                    alt="Fire protection operations overview"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-b from-emerald-950/15 via-emerald-950/20 to-emerald-950/82" />
                <div className="relative z-10 flex h-full flex-col justify-between p-8 text-white xl:p-10">
                    <div className="flex items-center justify-start">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-emerald-950/30 px-4 py-2 text-[13px] font-medium backdrop-blur"
                        >
                            <div className="flex size-8 items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-white/96 p-0.5 shadow-sm">
                                <FtcLogoImage />
                            </div>
                            <span>{name}</span>
                        </Link>
                    </div>

                    <div className="max-w-xl space-y-5">
                        <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium tracking-[0.24em] text-white/80 uppercase">
                            Internal ERP
                        </div>
                        <div className="space-y-3">
                            <h2 className="max-w-lg text-3xl leading-tight font-semibold text-white xl:text-[2rem]">
                                Sales, service, inventory, and compliance in one
                                workspace.
                            </h2>
                            <p className="max-w-xl text-sm leading-6 text-white/78 xl:text-[15px]">
                                Fire Teknik teams track quotations, jobs,
                                warehouse activity, billing, payroll, and
                                renewals from one secure ERP.
                            </p>
                        </div>
                        <div className="grid gap-3 text-[13px] text-white/82 sm:grid-cols-2">
                            <div className="rounded-lg border border-white/12 bg-emerald-950/20 p-4 backdrop-blur-sm">
                                <div className="flex items-start gap-3">
                                    <FileText className="mt-0.5 size-4 shrink-0 text-white/80" />
                                    <span>
                                        Quotation pipeline and sales visibility
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-lg border border-white/12 bg-emerald-950/20 p-4 backdrop-blur-sm">
                                <div className="flex items-start gap-3">
                                    <ClipboardList className="mt-0.5 size-4 shrink-0 text-white/80" />
                                    <span>
                                        Projects, service, and work orders
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-lg border border-white/12 bg-emerald-950/20 p-4 backdrop-blur-sm">
                                <div className="flex items-start gap-3">
                                    <Package className="mt-0.5 size-4 shrink-0 text-white/80" />
                                    <span>
                                        Inventory, purchasing, and warehouse
                                        control
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-lg border border-white/12 bg-emerald-950/20 p-4 backdrop-blur-sm">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-white/80" />
                                    <span>
                                        Billing, payroll, tax, and compliance
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex min-h-svh items-center justify-center px-6 py-10 sm:px-8 lg:px-10 xl:px-12">
                <div className="w-full max-w-md">
                    <Link
                        href={home()}
                        className="mb-8 inline-flex items-center gap-3 lg:hidden"
                    >
                        <AppLogo showSubtitle={false} />
                    </Link>

                    <div className="space-y-5">
                        <div className="space-y-2 text-left">
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                {title}
                            </h1>
                            <p className="text-[13px] leading-5 text-muted-foreground">
                                {description}
                            </p>
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
