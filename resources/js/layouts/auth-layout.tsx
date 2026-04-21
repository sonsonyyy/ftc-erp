import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

export default function AuthLayout({
    title = '',
    description = '',
    variant = 'simple',
    children,
}: {
    title?: string;
    description?: string;
    variant?: 'simple' | 'split';
    children: React.ReactNode;
}) {
    const LayoutTemplate =
        variant === 'split' ? AuthSplitLayout : AuthSimpleLayout;

    return (
        <LayoutTemplate title={title} description={description}>
            {children}
        </LayoutTemplate>
    );
}
