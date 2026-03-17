"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import {
    LayoutDashboard,
    Package,
    ClipboardList,
    Users,
    Settings,
} from "lucide-react"

export default function Sidebar() {
    const pathname = usePathname()

    const navItems = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "Assets",
            href: "/assets",
            icon: Package,
        },
        {
            label: "Work Orders",
            href: "/work-orders",
            icon: ClipboardList,
        },
        {
            label: "Members",
            href: "/members",
            icon: Users,
        },
        {
            label: "Settings",
            href: "/settings",
            icon: Settings,
        },
    ]

    return (
        <aside className="w-64 border-r flex flex-col gap-4 bg-sidebar">
            <Link href={'/dashboard'} className="text-lg font-semibold p-4 pt-5 pb-0 cursor-pointer">OpsCore</Link>

            <Separator className="bg-border/60" />

            <nav className="flex flex-col gap-2 p-2 pt-0">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const active = pathname === item.href

                    return (
                        <Button
                            key={item.href}
                            asChild
                            variant={active ? "secondary" : "ghost"}
                            className={`w-full justify-start gap-2 cursor-pointer ${active ? "border-primary" : ""}`}
                        >
                            <Link href={item.href}>
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        </Button>
                    )
                })}
            </nav>
        </aside>
    )
}