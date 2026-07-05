import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg w-fit whitespace-nowrap shrink-0",
    {
        variants: {
            variant: {
                default: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                success:
                    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                destructive: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                outline:
                    "border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-transparent",
                secondary: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
            },
            pill: {
                true: "rounded-full",
                false: "",
            },
        },
        defaultVariants: {
            variant: "default",
            pill: false,
        },
    }
);

function Badge({
    className,
    variant,
    pill,
    ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
    return (
        <span
            data-slot="badge"
            className={cn(badgeVariants({ variant, pill, className }))}
            {...props}
        />
    );
}

export { Badge, badgeVariants };
