"use client"

import { useActionState } from "react"
import { signupAction } from "@/features/auth/actions/signup.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthShell from "./auth-shell"

export default function SignupForm() {
    const [state, formAction, pending] = useActionState(signupAction, null)

    return (
        <AuthShell
            title="Create account"
            subtitle="Start managing your operations"
        >
            <form action={formAction} className="space-y-4">
                <Input name="name" placeholder="Full name" />
                <Input name="email" placeholder="you@example.com" />
                <Input name="password" type="password" placeholder="Password" />

                {state?.error && (
                    <p className="text-sm text-red-500">{state.error}</p>
                )}

                <Button className="w-full" disabled={pending}>
                    {pending ? "Creating..." : "Sign up"}
                </Button>
            </form>

            <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <a href="/login" className="underline hover:text-primary">
                    Log in
                </a>
            </p>
        </AuthShell>
    )
}