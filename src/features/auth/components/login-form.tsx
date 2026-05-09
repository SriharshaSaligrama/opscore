"use client"

import { useActionState } from "react"
import { loginAction } from "@/features/auth/actions/login.action"
import { Input } from "@/components/ui/input"
import AuthShell from "./auth-shell"
import { ActionForm } from "@/components/forms/action-form"
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
            <ActionForm
                action={formAction}
                state={state}
                pending={pending}
                label="Login"
                pendingLabel="Logging in..."
            >
                <Input name="email" placeholder="you@example.com" />
                <Input name="password" type="password" placeholder="Password" />
            </ActionForm>

            <p className="text-sm text-center text-muted-foreground">
                Don’t have an account?{" "}
                <a href="/sign-up" className="underline hover:text-primary">
                    Sign up
                </a>
            </p>
        </AuthShell>
    )
}
