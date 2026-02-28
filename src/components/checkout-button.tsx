"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner"; // Assuming sonner is installed as per package.json
// import { loadStripe } from "@stripe/stripe-js"; // We might handle redirection server-side or via URL

interface CheckoutButtonProps {
    groupId: string;
    priceId: string | null;
    groupName: string;
    price: number;
    autoCheckout?: boolean;
}

export function CheckoutButton({ groupId, priceId, groupName, price, autoCheckout }: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);
    const hasAutoCheckedOut = useRef(false);

    const handleCheckout = async () => {
        if (!priceId) {
            toast.error("Erro de configuração", {
                description: "Este grupo não tem um ID de preço configurado."
            });
            return;
        }

        setLoading(true);

        try {
            // Bypass payment and redirect to dashboard with success and groupId
            // This leverages the auto-activation logic in src/app/(dashboard)/dashboard/page.tsx
            const successUrl = `/dashboard?success=true&groupId=${groupId}`;
            window.location.href = successUrl;

        } catch (error: any) {
            console.error(error);
            toast.error("Erro no pagamento", {
                description: error.message
            });
            setLoading(false);
        }
    };

    useEffect(() => {
        if (autoCheckout && !hasAutoCheckedOut.current) {
            hasAutoCheckedOut.current = true;
            toast.info("Processando participação...", {
                description: "Aguarde um instante."
            });
            handleCheckout();
        }
    }, [autoCheckout]);

    return (
        <Button
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            onClick={handleCheckout}
            disabled={loading}
        >
            {loading ? "Processando..." : "Participar (Fase de Testes)"}
        </Button>
    );
}
