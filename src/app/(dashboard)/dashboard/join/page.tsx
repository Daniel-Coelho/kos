import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CheckoutButton } from "@/components/checkout-button";

export default async function JoinGroupPage(props: { searchParams: Promise<{ groupId?: string; checkout?: string }> }) {
    const searchParams = await props.searchParams;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    // @ts-ignore
    const userId = session.user.id;
    const targetGroupId = searchParams.groupId;
    const shouldAutoCheckout = searchParams.checkout === 'true';

    // Fetch all groups
    const groups = await prisma.group.findMany({
        where: {
            name: {
                in: ["Jogo Bronze", "Jogo Prata", "Jogo Ouro"]
            }
        },
        orderBy: { entryFee: 'asc' },
        include: {
            participations: {
                where: { userId }
            }
        }
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Dashboard
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Entrar em um Grupo</h1>
                <p className="text-muted-foreground">Escolha o nível do desafio. Quanto maior o risco, maior a recompensa.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {groups.map((group) => {
                    const isParticipating = group.participations.length > 0;
                    const isAlive = isParticipating && group.participations[0].status === 'ALIVE';
                    const isTargetGroup = group.id === targetGroupId;

                    return (
                        <Card key={group.id} className={`relative flex flex-col ${isParticipating || isTargetGroup ? 'border-green-500 border-2' : ''}`}>
                            {isParticipating && (
                                <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-1">
                                    <Check size={20} />
                                </div>
                            )}

                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-2xl">{group.name}</CardTitle>
                                <CardDescription>Entrada</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 text-center">
                                <div className="text-2xl font-bold text-yellow-600 mb-6">
                                    Jogo recreativo - Fase de testes
                                </div>
                                <ul className="text-sm space-y-2 text-left mx-auto max-w-[200px] mb-6">
                                    <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Premiação Acumulada</li>
                                    <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Ranking Exclusivo</li>
                                    <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Repescagem Disponível</li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                {isParticipating ? (
                                    <Button className="w-full" variant="outline" disabled>
                                        {isAlive ? "Você já está participando" : "Você foi eliminado"}
                                    </Button>
                                ) : (
                                    <CheckoutButton
                                        groupId={group.id}
                                        priceId={group.stripePriceId}
                                        groupName={group.name}
                                        price={Number(group.entryFee)}
                                        autoCheckout={shouldAutoCheckout && isTargetGroup}
                                    />
                                )}
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
