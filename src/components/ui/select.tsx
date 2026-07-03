"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
    return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
    return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
    return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
    className,
    children,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
    return (
        <SelectPrimitive.Trigger
            data-slot="select-trigger"
            className={cn(
                "flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white",
                className
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon asChild>
                <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    );
}

function SelectContent({
    className,
    children,
    position = "popper",
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                data-slot="select-content"
                className={cn(
                    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800",
                    position === "popper" &&
                        "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
                    className
                )}
                position={position}
                {...props}
            >
                <SelectPrimitive.Viewport
                    className={cn(
                        "p-1",
                        position === "popper" &&
                            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
                    )}
                >
                    {children}
                </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
    return (
        <SelectPrimitive.Label
            data-slot="select-label"
            className={cn(
                "px-2 py-1.5 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400",
                className
            )}
            {...props}
        />
    );
}

function SelectItem({
    className,
    children,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
    return (
        <SelectPrimitive.Item
            data-slot="select-item"
            className={cn(
                "relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 pr-2 pl-8 text-sm text-gray-700 outline-none select-none hover:bg-gray-50 focus:bg-gray-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700",
                className
            )}
            {...props}
        >
            <span className="absolute left-2 flex size-3.5 items-center justify-center">
                <SelectPrimitive.ItemIndicator>
                    <Check className="h-4 w-4 text-blue-600" />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
}

function SelectSeparator({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
    return (
        <SelectPrimitive.Separator
            data-slot="select-separator"
            className={cn("-mx-1 my-1 h-px bg-gray-100 dark:bg-gray-700", className)}
            {...props}
        />
    );
}

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
};
