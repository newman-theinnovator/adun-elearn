import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Single source of truth for the app's brand mark — the official ADUN crest
 * (public/logo.png). Swap the image file here if the crest is ever updated.
 */

const SIZE_PX = {
    sm: 40,
    md: 64,
} as const;

export function Logo({
    size = "md",
    className,
}: {
    size?: keyof typeof SIZE_PX;
    className?: string;
}) {
    const px = SIZE_PX[size];
    return (
        <Image
            src="/logo.png"
            alt="Admiralty University of Nigeria crest"
            width={px}
            height={px}
            className={cn("object-contain", className)}
            priority
        />
    );
}
