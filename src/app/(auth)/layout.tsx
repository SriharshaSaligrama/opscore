import LoginShell from "@/features/auth/components/login-shell";
import LoginShellLoading from "@/features/auth/components/login-shell-loading";
import { ReactNode, Suspense } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return <Suspense fallback={<LoginShellLoading />}>
        <LoginShell>
            {children}
        </LoginShell>
    </Suspense>
}
