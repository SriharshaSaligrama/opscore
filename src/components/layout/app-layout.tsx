import Sidebar from "./sidebar1"
import Header from "./header1"

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Right side */}
            <div className="flex flex-col flex-1">
                <Header />

                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}