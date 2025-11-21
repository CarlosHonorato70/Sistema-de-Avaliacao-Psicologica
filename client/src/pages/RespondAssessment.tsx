import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import AssessmentForm from "./AssessmentForm";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function RespondAssessment() {
  const [, params] = useRoute("/assessment/:token");
  const [error, setError] = useState<string | null>(null);
  const token = params?.token as string;

  const linkQuery = trpc.assessments.getByToken.useQuery(
    { token },
    { enabled: !!token }
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Link Inválido</h1>
          <p className="text-gray-600">
            O link de acesso ao questionário não foi encontrado.
          </p>
        </Card>
      </div>
    );
  }

  if (linkQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando questionário...</p>
        </Card>
      </div>
    );
  }

  if (linkQuery.error || !linkQuery.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Link Expirado ou Inválido</h1>
          <p className="text-gray-600">
            Este link de questionário não é válido ou já expirou. Entre em contato com o psicólogo para obter um novo link.
          </p>
        </Card>
      </div>
    );
  }

  if (linkQuery.data.completedAt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Questionário Já Respondido</h1>
          <p className="text-gray-600">
            Este questionário já foi respondido e não pode ser preenchido novamente.
          </p>
        </Card>
      </div>
    );
  }

  return <AssessmentForm token={token} />;
}
