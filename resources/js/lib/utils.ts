import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function cleanQueryParams(
    params: Record<string, unknown>,
): Record<string, string | number | boolean> {
    return Object.fromEntries(
        Object.entries(params).filter(
            ([, value]) =>
                value !== null && value !== undefined && value !== '',
        ),
    ) as Record<string, string | number | boolean>;
}

export function countActiveFilters(params: Record<string, unknown>): number {
    return Object.keys(cleanQueryParams(params)).length;
}
