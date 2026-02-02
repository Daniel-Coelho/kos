import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey || stripeKey.includes("sk_test_...")) {
    console.error("Stripe Secret Key is missing or invalid in .env");
}

const stripe = new Stripe(stripeKey || "", {
    apiVersion: "2025-12-15.clover" as any,
});

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("sk_test_...")) {
            return NextResponse.json(
                { error: "Erro de configuração do servidor: Stripe API Key inválida." },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { priceId, groupId } = body;

        if (!priceId || !groupId) {
            return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
        }

        // @ts-ignore
        const userId = session.user.id;

        // Verify if user is already participating (double check)
        const existingParticipation = await prisma.participation.findFirst({
            where: {
                userId,
                groupId,
            }
        });

        // Uncomment logic later if we want to block re-buying strictly here, 
        // but user might be re-buying after elimination (Repescagem/Re-entry).
        // For 'Entrada inicial', if status is ALIVE we should block.
        if (existingParticipation && existingParticipation.status === 'ALIVE') {
            return NextResponse.json({ error: "Você já está participando deste grupo." }, { status: 400 });
        }

        // Create Checkout Session
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/dashboard?success=true&groupId=${groupId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/dashboard/join`,
            metadata: {
                userId: userId,
                groupId: groupId,
                type: "ENTRY_FEE"
            },
            customer_email: session.user.email || undefined,
        });

        return NextResponse.json({ url: checkoutSession.url });

    } catch (error: any) {
        console.error("Stripe Error:", error);
        return NextResponse.json(
            { error: "Erro ao criar sessão de pagamento", details: error.message },
            { status: 500 }
        );
    }
}
