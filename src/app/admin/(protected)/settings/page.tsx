import { AdminCard } from "@/components/admin/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Power } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h1>
            </div>

            <div className="grid gap-6">
                <AdminCard title="Zona de Perigo" className="border-red-200">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-red-100 rounded-full text-red-600">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-red-900">Resetar Sistema Completo</h3>
                                    <p className="text-sm text-red-700 mt-1">
                                        Esta ação irá apagar TODOS os dados de jogos, rodadas, palpites e participações.
                                        Apenas contas de administradores serão mantidas.
                                    </p>
                                </div>
                            </div>
                            <div>
                                <Button variant="destructive" disabled title="Funcionalidade desabilitada por segurança">
                                    <Power className="w-4 h-4 mr-2" />
                                    Resetar Sistema
                                </Button>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 italic px-2">
                            * O botão de reset foi desabilitado intencionalmente conforme especificações de segurança.
                        </p>
                    </div>
                </AdminCard>
            </div>
        </div>
    );
}
