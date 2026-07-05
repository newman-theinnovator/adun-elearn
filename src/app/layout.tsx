import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { APP_NAME, UNIVERSITY_NAME } from "@/lib/branding";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: APP_NAME,
    description: `${UNIVERSITY_NAME} E-Learning Platform`,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} antialiased`}>
                <AuthProvider>
                    <QueryProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange
                        >
                            {children}
                        </ThemeProvider>
                    </QueryProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
