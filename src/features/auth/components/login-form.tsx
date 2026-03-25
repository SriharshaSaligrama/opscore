"use client"

import { useActionState } from "react"
import { loginAction } from "@/features/auth/actions/login.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthShell from "./auth-shell"

export default function LoginForm() {
    const [state, formAction, pending] = useActionState(loginAction, null)

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Login to your workspace"
        >
            <form action={formAction} className="space-y-4">
                <Input name="email" placeholder="you@example.com" />
                <Input name="password" type="password" placeholder="Password" />

                {state?.error && (
                    <p className="text-sm text-red-500">{state.error}</p>
                )}

                <Button className="w-full" disabled={pending}>
                    {pending ? "Logging in..." : "Login"}
                </Button>
            </form>

            <p className="text-sm text-center text-muted-foreground">
                Don’t have an account?{" "}
                <a href="/sign-up" className="underline hover:text-primary">
                    Sign up
                </a>
            </p>
        </AuthShell>
    )
}