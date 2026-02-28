"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { getUserDetails } from "@/app/admin/(protected)/users/actions";
import { cn } from "@/lib/utils";

export function UserHistoryDialog({ userId }: { userId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (open && !data) {
            setLoading(true);
            getUserDetails(userId).then(result => {
                setData(result);
                setLoading(false);
            });
        }
    }, [open, userId, data]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
                    <Eye className="w-4 h-4 mr-2" />
                    Histórico
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white text-slate-900">
                <DialogHeader>
                    <DialogTitle>Detalhes do Usuário</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : data ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-500">Nome</p>
                                <p className="font-semibold">{data.name}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Email</p>
                                <p className="font-semibold">{data.email}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">CPF</p>
                                <p className="font-medium">{data.cpf}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Telefone</p>
                                <p className="font-medium">{data.phone || "-"}</p>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                            <h3 className="font-semibold mb-3">Participações em Grupos</h3>
                            {data.participations.length === 0 ? (
                                <p className="text-sm text-slate-500">Nenhuma participação.</p>
                            ) : (
                                <div className="space-y-2">
                                    {data.participations.map((p: any) => (
                                        <div key={p.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg text-sm">
                                            <div>
                                                <p className="font-medium text-slate-900">{p.group.name}</p>
                                                <p className="text-xs text-slate-500">Entrou em {format(new Date(p.joinedAt), "dd/MM/yyyy")}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={cn(
                                                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold mb-1",
                                                    p.status === "ALIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                )}>
                                                    {p.status === "ALIVE" ? "VIVO" : "ELIMINADO"}
                                                </span>
                                                {p.status === "ELIMINATED" && (
                                                    <p className="text-xs text-slate-500">
                                                        Erros: {p.errors}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-red-500">Erro ao carregar dados.</p>
                )}
            </DialogContent>
        </Dialog>
    );
}
