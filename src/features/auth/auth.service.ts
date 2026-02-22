// auth.service.ts
import bcrypt from "bcrypt"
import { authRepository } from "./auth.repository"

export const authService = {
    async signup(email: string, password: string) {
        const existing = await authRepository.findUserByEmail(email)

        if (existing) {
            throw new Error("Email already exists")
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const user = await authRepository.createUser({
            email,
            passwordHash
        })

        const workspace = await authRepository.createWorkspace(
            `${email}'s Workspace`
        )

        await authRepository.createMembership({
            userId: user.id,
            workspaceId: workspace.id,
            role: "OWNER"
        })

        return { user, workspace }
    }
}