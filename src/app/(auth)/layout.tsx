export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-pitch p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-green-950/40 via-transparent to-green-900/20 -z-10" />
            <div className="w-full max-w-md relative z-10">
                {children}
            </div>
        </div>
    );
}

