import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "ConvoBench | AI Agent Evaluation Platform",
    description: "专业的对话式 AI Agent 评测平台",
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
