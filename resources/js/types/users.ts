export type UserListItem = {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    email_verified_at: string | null;
    roles: string[];
    created_at: string | null;
    can: {
        view: boolean;
        update: boolean;
        delete: boolean;
    };
};

export type UserRoleDetail = {
    id: number;
    name: string;
    description: string | null;
};

export type UserDetail = {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    email_verified_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    roles: UserRoleDetail[];
    permissions: string[];
    can: {
        update: boolean;
        delete: boolean;
    };
};
