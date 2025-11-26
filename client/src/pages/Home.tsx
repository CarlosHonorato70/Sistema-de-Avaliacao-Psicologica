import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Brain, Users, BarChart3, Lock, Zap, Shield, ArrowRight, LogOut } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{APP_TITLE}</h1>
                <p className="text-xs text-gray-500">Sistema de Avaliação Psicológica</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button
                onClick={() => logout()}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo, {user.name}!</h2>
            <p className="text-gray-600">Gerencie suas avaliações psicológicas e acompanhe seus pacientes</p>
          </div>

          {/* Main Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Dashboard Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setLocation("/dashboard")}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">Dashboard</CardTitle>
                    <CardDescription>Gerencie seus pacientes e avaliações</CardDescription>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Acesse seu painel de controle para adicionar novos pacientes, gerar links de questionários e visualizar resultados de avaliações.
                </p>
                <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                  Acessar Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            {/* About Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">Sobre o Sistema</CardTitle>
                    <CardDescription>Saiba mais sobre a plataforma</CardDescription>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <Brain className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Plataforma especializada em avaliação de superdotação e altas habilidades, com análise clínica baseada em IA.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>68 questões de sobre-excitabilidades</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span>5 domínios de avaliação</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Análise clínica com IA</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Funcionalidades Principais</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Users,
                  title: "Gerenciamento de Pacientes",
                  description: "Adicione, organize e acompanhe seus pacientes de forma eficiente"
                },
                {
                  icon: BarChart3,
                  title: "Análise Multidimensional",
                  description: "Avaliação em 5 domínios: Intelectual, Emocional, Imaginativa, Sensorial e Motora"
                },
                {
                  icon: Zap,
                  title: "Links Únicos",
                  description: "Gere links personalizados para enviar questionários por email ou WhatsApp"
                },
                {
                  icon: Brain,
                  title: "Análise com IA",
                  description: "Relatórios clínicos automáticos baseados em modelo de Dabrowski"
                },
                {
                  icon: BarChart3,
                  title: "Gráficos Interativos",
                  description: "Visualize resultados com gráficos e comparações por domínio"
                },
                {
                  icon: Shield,
                  title: "Segurança",
                  description: "Dados criptografados e acesso autenticado para proteger privacidade"
                }
              ].map((feature, idx) => (
                <Card key={idx} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <feature.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-base">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Pronto para começar?</CardTitle>
              <CardDescription className="text-blue-100">
                Acesse seu dashboard para gerenciar pacientes e criar novas avaliações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setLocation("/dashboard")}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 gap-2"
              >
                Ir para Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{APP_TITLE}</h1>
              <p className="text-xs text-gray-500">Sistema de Avaliação Psicológica</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Avaliação de Superdotação e Altas Habilidades
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Plataforma especializada para psicólogos avaliarem sobre-excitabilidades com análise clínica baseada em IA
          </p>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-6 text-lg gap-2"
          >
            Fazer Login
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: Users,
              title: "Para Psicólogos",
              description: "Gerencie pacientes, crie avaliações e acompanhe resultados em um único lugar"
            },
            {
              icon: Brain,
              title: "Análise Inteligente",
              description: "IA analisa respostas segundo modelo de Dabrowski com relatórios clínicos detalhados"
            },
            {
              icon: BarChart3,
              title: "Resultados Visuais",
              description: "Gráficos interativos e comparações multidimensionais dos 5 domínios"
            }
          ].map((feature, idx) => (
            <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Como Funciona</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: 1, title: "Login", desc: "Acesse com suas credenciais" },
              { step: 2, title: "Adicione Paciente", desc: "Registre novo paciente" },
              { step: 3, title: "Gere Link", desc: "Crie link único para questionário" },
              { step: 4, title: "Análise", desc: "Receba relatório com IA" }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Comece Agora</CardTitle>
              <CardDescription className="text-blue-100">
                Faça login para acessar o dashboard e começar a avaliar seus pacientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 gap-2"
              >
                Fazer Login
                <ArrowRight className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
