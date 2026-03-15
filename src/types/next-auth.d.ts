import "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        role: string;
        firstName?: string;
        lastName?: string;
        matricNumber?: string;
        staffId?: string;
    }

    interface Session {
        user: User & {
            id: string;
            role: string;
            firstName?: string;
            lastName?: string;
            matricNumber?: string;
            staffId?: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        firstName?: string;
        lastName?: string;
    }
}
