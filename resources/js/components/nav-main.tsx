import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import type { NavItem, NavSection } from '@/types';

type NavMainProps = {
    primaryItems?: NavItem[];
    sections?: NavSection[];
};

export function NavMain({ primaryItems = [], sections = [] }: NavMainProps) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const activeItemClasses =
        'data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-xs data-[active=true]:hover:bg-primary/90 data-[active=true]:hover:text-primary-foreground data-[active=true]:font-semibold';

    const findBestMatchingItem = (items: NavItem[]): NavItem | null => {
        const matchingItems = items.filter((item) =>
            isCurrentOrParentUrl(item.href),
        );

        if (matchingItems.length === 0) {
            return null;
        }

        return matchingItems.reduce((bestMatch, item) => {
            return toUrl(item.href).length > toUrl(bestMatch.href).length
                ? item
                : bestMatch;
        });
    };

    const activeSectionTitle =
        sections.find((section) => findBestMatchingItem(section.items) !== null)
            ?.title ?? null;
    const [openSectionTitle, setOpenSectionTitle] = useState<string | null>(
        activeSectionTitle,
    );

    const hasPrimaryItems = primaryItems.length > 0;
    const hasSections = sections.length > 0;

    useEffect(() => {
        setOpenSectionTitle(activeSectionTitle);
    }, [activeSectionTitle]);

    return (
        <>
            {hasPrimaryItems && (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {primaryItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentOrParentUrl(
                                            item.href,
                                        )}
                                        className={activeItemClasses}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            )}

            {hasPrimaryItems && hasSections && (
                <SidebarSeparator className="my-1" />
            )}

            {hasSections && (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>ERP Modules</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {sections.map((section) => {
                                const activeSectionItem = findBestMatchingItem(
                                    section.items,
                                );

                                if (section.items.length === 1) {
                                    const [item] = section.items;
                                    const ItemIcon = item.icon ?? section.icon;

                                    return (
                                        <SidebarMenuItem key={section.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={
                                                    activeSectionItem !==
                                                        null &&
                                                    toUrl(
                                                        activeSectionItem.href,
                                                    ) === toUrl(item.href)
                                                }
                                                className={activeItemClasses}
                                                tooltip={{
                                                    children: item.title,
                                                }}
                                            >
                                                <Link href={item.href} prefetch>
                                                    {ItemIcon && <ItemIcon />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                }

                                return (
                                    <Collapsible
                                        key={section.title}
                                        asChild
                                        open={
                                            openSectionTitle === section.title
                                        }
                                        onOpenChange={(open) =>
                                            setOpenSectionTitle(
                                                open ? section.title : null,
                                            )
                                        }
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton
                                                    tooltip={{
                                                        children: section.title,
                                                    }}
                                                >
                                                    {section.icon && (
                                                        <section.icon />
                                                    )}
                                                    <span>{section.title}</span>
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>

                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuAction
                                                    showOnHover
                                                    className="transition-transform group-data-[state=open]/collapsible:rotate-90"
                                                >
                                                    <ChevronRight />
                                                    <span className="sr-only">
                                                        Toggle {section.title}
                                                    </span>
                                                </SidebarMenuAction>
                                            </CollapsibleTrigger>

                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {section.items.map(
                                                        (item) => (
                                                            <SidebarMenuSubItem
                                                                key={`${section.title}-${item.title}`}
                                                            >
                                                                <SidebarMenuSubButton
                                                                    asChild
                                                                    isActive={
                                                                        activeSectionItem !==
                                                                            null &&
                                                                        toUrl(
                                                                            activeSectionItem.href,
                                                                        ) ===
                                                                            toUrl(
                                                                                item.href,
                                                                            )
                                                                    }
                                                                    className={
                                                                        activeItemClasses
                                                                    }
                                                                >
                                                                    <Link
                                                                        href={
                                                                            item.href
                                                                        }
                                                                        prefetch
                                                                    >
                                                                        <span>
                                                                            {
                                                                                item.title
                                                                            }
                                                                        </span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ),
                                                    )}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            )}
        </>
    );
}
