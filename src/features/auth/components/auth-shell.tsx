import { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function AuthShell({
    title,
    subtitle,
    children,
}: {
    title: string
    subtitle?: string
    children: ReactNode
}) {
    return (
        <div className="relative min-h-dvh flex items-center justify-center bg-linear-to-br from-background via-muted to-background px-4 overflow-hidden">

            {/* Background glow accents */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-30 -left-30 w-75 h-75 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-30 -right-30 w-75 h-75 bg-primary/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <Card className="shadow-xl border border-border/50 backdrop-blur">
                    <CardContent className="p-6 space-y-6">

                        {/* Header */}
                        <div className="text-center space-y-1">
                            <p className="text-sm font-medium text-primary">
                                OpsCore
                            </p>

                            <h1 className="text-xl font-semibold">
                                {title}
                            </h1>

                            {subtitle && (
                                <p className="text-sm text-muted-foreground">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {/* Content */}
                        {children}

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}