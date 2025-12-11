import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface AssessmentLink {
  id: string;
  token: string;
  patientName: string;
  patientEmail?: string;
  createdAt: Date;
  expiresAt?: Date;
  isCompleted: boolean;
}

export default function PatientDashboard() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);

  // Extrair token da URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    setToken(urlToken);
  }, []);

  const linkQuery = trpc.assessments.getByToken.useQuery(
    { token: token || "" },
    { enabled: !!token }
  );

  const loading = linkQuery.isLoading;
  const error = linkQuery.error ? "Link de acesso inválido ou expirado" : null;
  const assessmentLink = linkQuery.data;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Clock className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-gray-600">Carregando avaliação...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-center text-gray-700 font-medium">{error}</p>
              <p className="text-center text-sm text-gray-500">
                Por favor, verifique o link fornecido ou entre em contato com seu psicólogo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assessmentLink || !assessmentLink.patient) {
    return null;
  }

  // Check if link is completed
  if (assessmentLink.completedAt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Questionário Já Respondido</h1>
          <p className="text-gray-600">
            Este questionário já foi respondido e não pode ser preenchido novamente.
          </p>
        </Card>
      </div>
    );
  }

  // Check if link is expired
  if (assessmentLink.expiresAt && new Date(assessmentLink.expiresAt) < new Date()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Link Expirado</h1>
          <p className="text-gray-600">
            Este link de avaliação já expirou. Entre em contato com o psicólogo para obter um novo link.
          </p>
        </Card>
      </div>
    );
  }

  const patientName = assessmentLink.patient.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">AP</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Avaliação Psicológica</h1>
          </div>
          <p className="text-gray-600">Questionário de Sobre-excitabilidades</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Bem-vindo, {patientName}!</CardTitle>
            <CardDescription className="text-blue-100">
              Obrigado por participar desta avaliação psicológica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-blue-50">
              Este questionário contém 68 questões que nos ajudarão a compreender melhor suas características e habilidades.
              Sua resposta honesta é fundamental para uma avaliação precisa.
            </p>
          </CardContent>
        </Card>

        {/* Info Cards Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Duration Card */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Tempo Estimado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">15-20 min</p>
              <p className="text-xs text-gray-500 mt-1">Sem pressa, você pode pausar</p>
            </CardContent>
          </Card>

          {/* Questions Card */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Total de Questões</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-indigo-600">68</p>
              <p className="text-xs text-gray-500 mt-1">Distribuídas em 5 domínios</p>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <p className="text-sm font-medium text-green-700">Pronto para começar</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions Card */}
        <Card className="mb-8 border-0 shadow-md">
          <CardHeader>
            <CardTitle>Como Responder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Leia cada questão com atenção</p>
                  <p className="text-sm text-gray-600">Não há respostas certas ou erradas</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Escolha a resposta que melhor representa você</p>
                  <p className="text-sm text-gray-600">Use a escala: Nunca, Às vezes, Frequentemente, Sempre</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Responda todas as questões</p>
                  <p className="text-sm text-gray-600">Você será notificado se alguma ficar em branco</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">4</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Revise suas respostas antes de enviar</p>
                  <p className="text-sm text-gray-600">Você terá uma chance de revisar tudo</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Preview */}
        <Card className="mb-8 border-0 shadow-md">
          <CardHeader>
            <CardTitle>Domínios da Avaliação</CardTitle>
            <CardDescription>Você responderá questões sobre estes 5 domínios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Intelectual", questions: 16, color: "bg-blue-500" },
                { name: "Emocional", questions: 16, color: "bg-purple-500" },
                { name: "Imaginativa", questions: 17, color: "bg-pink-500" },
                { name: "Sensorial", questions: 9, color: "bg-amber-500" },
                { name: "Motora", questions: 10, color: "bg-green-500" },
              ].map((domain) => (
                <div key={domain.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">{domain.name}</span>
                    <span className="text-sm text-gray-500">{domain.questions} questões</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${domain.color} h-2 rounded-full`}
                      style={{ width: `${(domain.questions / 68) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Button */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => setLocation(`/assessment/${token}`)}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            Começar Avaliação
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            Suas respostas serão analisadas por um especialista em superdotação e altas habilidades.
            <br />
            <span className="text-xs text-gray-500 mt-1 block">Tempo de resposta: aproximadamente 15-20 minutos</span>
          </p>
        </div>
      </div>
    </div>
  );
}
