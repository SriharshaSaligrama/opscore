import "dotenv/config"
import { authService } from "@/features/auth/auth.service"

async function run() {
    // const signup = await authService.signup(
    //     "Sriharsha",
    //     "sri@test.com",
    //     "password123"
    // )

    const login = await authService.login(
        "sri@test.com",
        "password123"
    )

    console.log({ login })
}

run()