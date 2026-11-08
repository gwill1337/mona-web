import { Sidebar } from "@/components/demo/Sidebar";

export default function DemoLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#0F0E0E]">
            <Sidebar />

            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    );
}