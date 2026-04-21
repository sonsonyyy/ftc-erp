import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
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
                <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/10 to-black/75" />
                <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
                    <div className="flex items-center justify-start">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium backdrop-blur"
                        >
                            <AppLogoIcon className="size-5 fill-current text-white" />
                            <span>{name}</span>
                        </Link>
                    </div>

                    <div className="max-w-xl space-y-6">
                        <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium tracking-[0.24em] text-white/80 uppercase">
                            Internal ERP
                        </div>
                        <div className="space-y-4">
                            <h2 className="max-w-lg text-4xl leading-tight font-semibold text-white">
                                Run sales, service, inventory, and compliance
                                from one operations workspace.
                            </h2>
                            <p className="max-w-xl text-base leading-7 text-white/78">
                                Fire Teknik teams can monitor quotations,
                                projects, work orders, warehousing, billing,
                                payroll, and renewals from a single secured
                                portal.
                            </p>
                        </div>
                        <div className="grid gap-3 text-sm text-white/82 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/12 bg-black/20 p-4 backdrop-blur-sm">
                                Quotation tracking and awarded job visibility
                            </div>
                            <div className="rounded-2xl border border-white/12 bg-black/20 p-4 backdrop-blur-sm">
                                Project, service, and work-order coordination
                            </div>
                            <div className="rounded-2xl border border-white/12 bg-black/20 p-4 backdrop-blur-sm">
                                Inventory, purchasing, and warehouse control
                            </div>
                            <div className="rounded-2xl border border-white/12 bg-black/20 p-4 backdrop-blur-sm">
                                Billing, payroll, tax, and compliance snapshots
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex min-h-svh items-center justify-center px-6 py-10 sm:px-8 lg:px-12">
                <div className="w-full max-w-md">
                    <Link
                        href={home()}
                        className="mb-8 inline-flex items-center gap-3 lg:hidden"
                    >
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                            <AppLogoIcon className="size-6 fill-current" />
                        </div>
                        <span className="text-sm font-semibold tracking-tight">
                            {name}
                        </span>
                    </Link>

                    <div className="space-y-6">
                        <div className="space-y-2 text-left">
                            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                                {title}
                            </h1>
                            <p className="text-sm leading-6 text-muted-foreground">
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
