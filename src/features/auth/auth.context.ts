import { getCurrentSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cache } from "react";

export const getAuthContext = cache(async function () {
    const session = await getCurrentSession()

    if (!session || !session.user) {
        redirect("/login")
    }

    return {
        session,
        user: session.user,
    }
});