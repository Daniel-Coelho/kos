"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export interface PasswordInputProps extends React.ComponentProps<"input"> { }

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false)

        return (
            <div className="relative group/password">
                <Input
                    type={showPassword ? "text" : "password"}
                    className={className}
                    ref={ref}
                    {...props}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                    {showPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                        <Eye className="size-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">
                        {showPassword ? "Esconder senha" : "Mostrar senha"}
                    </span>
                </Button>
            </div>
        )
    }
)

PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
