import { cn } from "@/lib/utils";

interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    action?: React.ReactNode;
}

export function AdminCard({ title, action, children, className, ...props }: AdminCardProps) {
    return (
        <div
            className={cn(
                "rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm",
                className
            )}
            {...props}
        >
            {(title || action) && (
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    {title && <h3 className="font-semibold leading-none tracking-tight">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-6">{children}</div>
        </div>
    );
}

export function StatCard({
    title,
    value,
    icon: Icon,
    iconColor,
    description,
    trend,
    className,
}: {
    title: string;
    value: string | number;
    icon?: any;
    iconColor?: string;
    description?: string;
    trend?: "up" | "down" | "neutral";
    className?: string;
}) {
    return (
        <div className={cn("rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between", className)}>
            <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">{title}</p>
                <div className="text-3xl font-bold text-slate-900">{value}</div>
                {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
            </div>
            {Icon && <Icon className={cn("h-6 w-6", iconColor || "text-slate-400")} />}
        </div>
    );
}
