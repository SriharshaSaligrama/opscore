import LoginShell from "@/features/auth/components/LoginShell";
import LoginShellLoading from "@/features/auth/components/LoginShellLoading";
import { ReactNode, Suspense } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return <Suspense fallback={<LoginShellLoading />}>
        <LoginShell>
            {children}
        </LoginShell>
    </Suspense>
}
