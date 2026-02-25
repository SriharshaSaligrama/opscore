import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function getCurrentSession() {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("sessionId")?.value

    if (!sessionId) return null

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true }
    })

    if (!session) return null
    if (session.expiresAt < new Date()) return null

    return {
        sessionId: session.id,
        user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email
        },
        activeWorkspaceId: session.activeWorkspaceId,
        expiresAt: session.expiresAt
    }
}