import { Suspense } from "react";
import HomePageShell from "@/features/auth/components/home-page-shell";
import ProtectedAuthFallback from "@/components/layout/protected-auth-fallback";

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
