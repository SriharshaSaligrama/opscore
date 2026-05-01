import { Button } from "@/components/ui/button"
import { type ComponentProps } from "react"

type ActionSubmitButtonProps = Omit<ComponentProps<typeof Button>, "children"> & {
    pending: boolean
    label: string
    pendingLabel: string
}

export function ActionSubmitButton({
    pending,
    label,
    pendingLabel,
    disabled,
    ...props
}: ActionSubmitButtonProps) {
    return (
        <Button type="submit" disabled={disabled || pending} {...props}>
            {pending && (
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            )}
            {pending ? pendingLabel : label}
        </Button>
    )
}
