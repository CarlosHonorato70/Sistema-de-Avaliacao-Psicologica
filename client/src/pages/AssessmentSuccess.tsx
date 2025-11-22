import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Mail, Loader2 } from "lucide-react";

export default function AssessmentSuccess() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setLocation("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-lg opacity-50 animate-pulse"></div>
              <CheckCircle2 className="w-20 h-20 text-green-500 relative" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-700">Sucesso!</CardTitle>
          <CardDescription className="text-base mt-2">
            Suas respostas foram recebidas com sucesso
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              Obrigado por participar da avaliação! Suas respostas foram registradas e serão analisadas por um especialista em superdotação e altas habilidades.
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Próximas etapas:</p>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Respostas registradas</p>
                <p className="text-xs text-gray-500">Seus dados foram salvos com segurança</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Análise em andamento</p>
                <p className="text-xs text-gray-500">Processamento automático com IA</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100">
                  <Mail className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Relatório por email</p>
                <p className="text-xs text-gray-500">Você receberá o resultado em breve</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-800">
              <strong>Tempo estimado:</strong> O relatório completo será enviado para seu email em até 24 horas.
            </p>
          </div>

          {/* Countdown */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Redirecionando em <span className="font-bold text-blue-600">{countdown}</span> segundos...
            </p>
          </div>

          {/* Button */}
          <Button
            onClick={() => setLocation("/")}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          >
            Voltar à Página Inicial
          </Button>
        </CardContent>
      </Card>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>
    </div>
  );
}
