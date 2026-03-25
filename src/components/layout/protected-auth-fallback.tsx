import { Spinner } from "@/components/ui/spinner"

export default function ProtectedAuthFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
                <div className="space-y-4">
                    <div className="space-y-2 text-center">
                        <p className="text-sm font-medium text-foreground">
                            Checking your account
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Preparing your protected workspace...
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Spinner className="mx-auto" />
                    </div>
                </div>
            </div>
        </div>
    )
}
