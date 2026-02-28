import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Trophy, Users, AlertTriangle, Swords, Skull, Coins, Calendar, UserPlus, CreditCard, Target, Medal, Diamond, Crown, Flame, ArrowRight, User, LogIn } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Home() {
  const dbGroups = await prisma.group.findMany({
    where: {
      name: {
        in: ["Jogo Bronze", "Jogo Prata", "Jogo Ouro"]
      }
    },
    orderBy: { entryFee: 'asc' }
  });

  const getGroupIcon = (name: string) => {
    if (name.includes("Bronze")) return Medal;
    if (name.includes("Prata")) return Medal;
    if (name.includes("Ouro")) return Medal;
    return Trophy;
  };

  const getGroupColors = (name: string) => {
    if (name.includes("Bronze")) return { accent: "bg-amber-600", text: "text-amber-600", light: "bg-amber-50", rank: "3", rankColor: "text-amber-700 bg-amber-200" };
    if (name.includes("Prata")) return { accent: "bg-gray-400", text: "text-gray-400", light: "bg-gray-50", rank: "2", rankColor: "text-gray-600 bg-gray-200" };
    if (name.includes("Ouro")) return { accent: "bg-yellow-400", text: "text-yellow-500", light: "bg-yellow-50", rank: "1", rankColor: "text-yellow-700 bg-yellow-200" };
    return { accent: "bg-green-600", text: "text-green-600", light: "bg-green-50", rank: null, rankColor: "text-green-600" };
  };

  const getSubtitle = (name: string) => {
    if (name.includes("Bronze")) return "Entrada acessível para iniciantes";
    if (name.includes("Prata")) return "Para jogadores intermediários";
    if (name.includes("Ouro")) return "Premiação elevada";
    return "Participe e vença";
  };

  const groups = dbGroups.map(g => {
    const colors = getGroupColors(g.name);
    return {
      id: g.id,
      name: g.name,
      subtitle: getSubtitle(g.name),
      price: "Jogo recreativo - Fase de testes",
      accentColor: colors.accent,
      textColor: colors.text,
      lightColor: colors.light,
      icon: getGroupIcon(g.name),
      rank: colors.rank,
      rankColor: colors.rankColor
    };
  });


  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <header className="relative w-full pt-20 pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4 bg-pitch shadow-inner">
        {/* Login Button */}
        <div className="absolute top-6 right-6 z-50">
          <Button variant="ghost" className="text-white hover:bg-white/10 gap-2" asChild>
            <Link href="/login">
              <LogIn className="w-4 h-4" /> Entrar
            </Link>
          </Button>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-950/60 via-background to-background -z-10" />

        <div className="relative mb-8 transform hover:scale-105 transition-transform duration-500">
          <div className="absolute -inset-4 bg-green-500/20 blur-3xl rounded-full" />
          <Image
            src="/logo.png"
            alt="King Of Survivors"
            width={400}
            height={400}
            className="relative z-10 w-64 md:w-96 drop-shadow-[0_0_35px_rgba(34,197,94,0.3)]"
            priority
          />
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-200 to-yellow-500 mb-4 drop-shadow-sm">
          Você será capaz de sobreviver até o final ?
        </h1>
        <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-8 font-medium">
          O desafio definitivo do Brasileirão. Escolha seu time, sobreviva às rodadas e conquiste a glória eterna.
        </p>

        <div className="flex gap-4">
          <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-6 text-lg shadow-[0_0_20px_rgba(234,179,8,0.3)] border-b-4 border-yellow-700" asChild>
            <Link href="/register">Começar a Jogar</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm" asChild>
            <Link href="#regras">Como Funciona</Link>
          </Button>
        </div>

        {/* Curvy Separator Bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden rotate-180">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(118%)] h-[100px] fill-white">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.4,38.56,73.12,22.34,149.93,35.91,226.3,27.39,81-9.06,152.19-45.72,210-90.37,28.83-22.31,52.31-48,70.47-75.63H0Z"></path>
          </svg>
        </div>
      </header>

      {/* Stats / Info - Now on White Background */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6">
              <Coins className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Fase de Testes</h3>
            <p className="text-gray-600 mt-2 max-w-xs">Participe gratuitamente durante este período experimental.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6">
              <Swords className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Mata-Mata Intenso</h3>
            <p className="text-gray-600 mt-2 max-w-xs">Sobrevivência pura. Cada rodada é uma final de campeonato.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6">
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Glória Eterna</h3>
            <p className="text-gray-600 mt-2 max-w-xs">19 rodadas de pura emoção. Mostre que entende de futebol.</p>
          </div>
        </div>
      </section>

      {/* Groups Section - Light Gray Background for Contrast */}
      <section id="regras" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Como Funciona</h2>
            <p className="text-gray-600 text-lg">Participar é simples! Siga os passos abaixo e comece a jogar agora mesmo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Visual Connector Line (Hidden on mobile) */}
            <div className="hidden md:block absolute top-[2.5rem] left-[10%] right-[10%] h-0.5 bg-green-100 -z-10" />

            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative group hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold shadow-md z-10">1</div>
              <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center mb-6 text-white shadow-blue-200 shadow-xl">
                <UserPlus className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cadastre-se</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Crie sua conta com seus dados pessoais e escolha seu apelido para o ranking.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative group hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold shadow-md z-10">2</div>
              <div className="w-16 h-16 rounded-2xl bg-purple-500 flex items-center justify-center mb-6 text-white shadow-purple-200 shadow-xl">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Escolha um Grupo</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Selecione o grupo de jogo que deseja participar. Atualmente em fase de testes grátis.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative group hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold shadow-md z-10">3</div>
              <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center mb-6 text-white shadow-green-200 shadow-xl">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Faça sua Escolha</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                A cada rodada, escolha um time que você acredita que vai vencer. Não pode repetir!
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative group hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold shadow-md z-10">4</div>
              <div className="w-16 h-16 rounded-2xl bg-yellow-500 flex items-center justify-center mb-6 text-white shadow-yellow-200 shadow-xl">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sobreviva e Ganhe</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Se seu time vencer, você continua. Sobreviva até o final e leve a premiação!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Groups Section - Light Gray Background for Contrast */}
      <section id="grupos" className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Escolha seu Grupo</h2>
            <p className="text-gray-600 text-lg">Participe de quantos grupos quiser. Cada arena é um jogo independente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groups.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col hover:-translate-y-1 transition-transform duration-300 group">
                  {/* Top Border Accent */}
                  <div className={`h-2 w-full ${group.accentColor}`} />

                  <div className="p-6 flex flex-col flex-grow">
                    {/* Header: Rank/Icon and Price */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="relative">
                        {group.rank ? (
                          <div className="relative">
                            <Icon className={`w-10 h-10 ${group.name === 'Jogo Prata' ? 'text-gray-400' : group.name === 'Jogo Bronze' ? 'text-amber-600' : 'text-yellow-400'}`} />
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-xs font-bold text-white drop-shadow-md">{group.rank}</span>
                          </div>
                        ) : (
                          <Icon className={`w-10 h-10 ${group.textColor}`} />
                        )}
                      </div>
                      <div className={`px-4 py-1.5 rounded-full font-bold text-sm ${group.lightColor} ${group.textColor}`}>
                        {group.price}
                      </div>
                    </div>

                    {/* Title and Subtitle */}
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{group.name}</h3>
                    <p className="text-gray-500 text-sm mb-6">{group.subtitle}</p>

                    {/* Participants and Prize */}
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-8 mt-auto">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>0 participantes</span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold text-green-600">
                        <Trophy className="w-4 h-4" />
                        <span>Fase de Testes</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button className={`w-full ${group.accentColor} hover:opacity-90 text-white font-bold h-12 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm`} asChild>
                        <Link href={`/register?groupId=${group.id}`}>
                          Participar <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" className="w-full text-gray-900 font-medium h-10 hover:bg-gray-50 rounded-lg">
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom stats with Green background */}
      <section className="relative py-24 bg-pitch overflow-hidden">
        {/* Curvy Separator Top */}
        <div className="absolute top-0 left-0 w-full overflow-hidden">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(118%)] h-[100px] fill-gray-50">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.4,38.56,73.12,22.34,149.93,35.91,226.3,27.39,81-9.06,152.19-45.72,210-90.37,28.83-22.31,52.31-48,70.47-75.63H0Z"></path>
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">O Maior Campeonato do Brasil</h2>
            <p className="text-white/70">Acompanhe e sobreviva a cada rodada do Brasileirão.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Rodadas", value: "19", icon: Calendar },
              { label: "Times", value: "20", icon: Shield },
              { label: "Arenas", value: "6", icon: Trophy },
              { label: "Prêmio", value: "Testes", icon: Coins },
            ].map((stat, i) => (
              <div key={i} className="bg-green-950/40 backdrop-blur-md p-8 rounded-2xl border border-white/5 text-center">
                <stat.icon className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white/60 text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>



      <footer className="py-12 bg-gray-950 text-center text-gray-500 text-sm border-t border-white/5">
        <div className="container mx-auto px-4 relative z-10">
          <p className="mb-4 text-gray-400">&copy; 2026 King Of Survivors. Todos os direitos reservados.</p>
          <div className="flex justify-center gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Suporte</Link>
          </div>
          <p className="mt-8 text-xs text-gray-600 max-w-lg mx-auto leading-relaxed">
            Feito para os amantes do futebol brasileiro.
            O King of Survivors é um jogo de prognóstico recreativo sem fins de apostas esportivas diretas.
            Proibido para menores de 18 anos.
          </p>
        </div>
      </footer>
    </main>
  );
}
