"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner"; // Assuming sonner is installed as per package.json
// import { loadStripe } from "@stripe/stripe-js"; // We might handle redirection server-side or via URL

interface CheckoutButtonProps {
    groupId: string;
    priceId: string | null;
    groupName: string;
    price: number;
}

export function CheckoutButton({ groupId, priceId, groupName, price }: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        if (!priceId) {
            toast.error("Erro de configuração", {
                description: "Este grupo não tem um ID de preço configurado."
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    priceId: priceId,
                    groupId: groupId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.error || "Erro ao iniciar pagamento";
                throw new Error(errorMsg);
            }

            // Redirect to Stripe Checkout URL
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("URL de pagamento não encontrada");
            }

        } catch (error: any) {
            console.error(error);
            toast.error("Erro no pagamento", {
                description: error.message
            });
            setLoading(false);
        }
    };

    return (
        <Button
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            onClick={handleCheckout}
            disabled={loading}
        >
            {loading ? "Processando..." : `Entrar por R$ ${price.toFixed(2)}`}
        </Button>
    );
}
