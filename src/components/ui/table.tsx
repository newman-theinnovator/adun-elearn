import * as React from "react";

import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
    return (
        <div className="overflow-x-auto">
            <table data-slot="table" className={cn("w-full text-sm", className)} {...props} />
        </div>
    );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
    return (
        <thead
            data-slot="table-header"
            className={cn(
                "border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80",
                className
            )}
            {...props}
        />
    );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
    return (
        <tbody
            data-slot="table-body"
            className={cn("divide-y divide-gray-100 dark:divide-gray-700", className)}
            {...props}
        />
    );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
    return (
        <tfoot
            data-slot="table-footer"
            className={cn(
                "border-t border-gray-100 bg-gray-50 font-medium dark:border-gray-700 dark:bg-gray-800/80",
                className
            )}
            {...props}
        />
    );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
    return (
        <tr
            data-slot="table-row"
            className={cn(
                "transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30",
                className
            )}
            {...props}
        />
    );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
    return (
        <th
            data-slot="table-head"
            className={cn(
                "px-5 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400",
                className
            )}
            {...props}
        />
    );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
    return <td data-slot="table-cell" className={cn("px-5 py-4", className)} {...props} />;
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
    return (
        <caption
            data-slot="table-caption"
            className={cn("mt-4 text-sm text-gray-400", className)}
            {...props}
        />
    );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
