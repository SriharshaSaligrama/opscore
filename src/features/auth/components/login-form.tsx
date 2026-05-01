"use client"

import { useActionState } from "react"
import { loginAction } from "@/features/auth/actions/login.action"
import { Input } from "@/components/ui/input"
import AuthShell from "./auth-shell"
import { ActionError } from "@/components/forms/action-error"
import { ActionSubmitButton } from "@/components/forms/action-submit-button"
import { ActionState } from "@/lib/action-handler"

const initialState: ActionState = {
    success: false,
    error: "",
}

export default function LoginForm() {
    const [state, formAction, pending] = useActionState(loginAction, initialState)

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Login to your workspace"
        >
            <form action={formAction} className="space-y-4">
                <Input name="email" placeholder="you@example.com" />
                <Input name="password" type="password" placeholder="Password" />

                <ActionError state={state} />

                <ActionSubmitButton
                    pending={pending}
                    label="Login"
                    pendingLabel="Logging in..."
                    className="w-full"
                />
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
