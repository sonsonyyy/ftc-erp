import type { InertiaLinkProps } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { toUrl } from '@/lib/utils';

type Props = {
    href: NonNullable<InertiaLinkProps['href']>;
    label?: string;
};

export function ExportCsvButton({ href, label = 'Export CSV' }: Props) {
    return (
        <Button variant="outline" asChild>
            <a href={toUrl(href)}>{label}</a>
        </Button>
    );
}
