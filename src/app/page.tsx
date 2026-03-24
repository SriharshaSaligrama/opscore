import { Suspense } from "react";
import HomePageShell from "@/features/auth/components/HomePageShell";
import ProtectedAuthFallback from "@/components/layout/ProtectedAuthFallback";

export default function Home() {
    return (
        <Suspense fallback={<ProtectedAuthFallback />}>
            <HomePageShell />
            <div className="flex min-h-screen items-center justify-center">
                F**k You🖕🫵
            </div>
        </Suspense>
    );
}
