import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 mt-4">
                    <Skeleton className="h-6 w-40 mx-auto" />
                    <Skeleton className="h-6 w-50 mx-auto" />
                    <Skeleton className="h-6 w-60 mx-auto" />
                </CardHeader>

                <CardContent className="space-y-2 mx-2">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-6 w-full" />
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}