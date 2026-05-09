"use client"

import { useActionState } from "react"
import { signupAction } from "@/features/auth/actions/signup.action"
import { Input } from "@/components/ui/input"
import AuthShell from "./auth-shell"
import { ActionForm } from "@/components/forms/action-form"
import { ActionState } from "@/lib/action-handler"

const initialState: ActionState = {
    success: false,
    error: "",
}

export default function SignupForm() {
    const [state, formAction, pending] = useActionState(signupAction, initialState)

    return (
        <AuthShell
            title="Create account"
            subtitle="Start managing your operations"
        >
            <ActionForm
                action={formAction}
                state={state}
                pending={pending}
                label="Sign up"
                pendingLabel="Creating..."
            >
                <Input name="name" placeholder="Full name" />
                <Input name="email" placeholder="you@example.com" />
                <Input name="password" type="password" placeholder="Password" />
            </ActionForm>

            <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <a href="/login" className="underline hover:text-primary">
                    Log in
                </a>
            </p>
        </AuthShell>
    )
}
