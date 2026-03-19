"use client"

export default function Error({
    error,
    reset,
}: {
    error: Error
    reset: () => void
}) {
    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold">{error.message || 'Something went wrong'}</h2>
            <button onClick={reset}>Try again</button>
        </div>
    )
}