import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "ConvoBench | Voice Agent Paper Hunt",
    description: "Curated collection of papers on Conversational AI, Voice Agents, Speech LLMs, and Real-time Voice Interaction",
    icons: {
        icon: [
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/favicon.ico" },
        ],
        apple: "/apple-touch-icon.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh-CN">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
