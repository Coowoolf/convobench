import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Voice Agent Evals | Agora AI Engine",
    description: "面向语音Agent的世界级评测平台",
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
