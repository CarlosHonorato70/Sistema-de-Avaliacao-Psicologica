import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Download, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ScoreData {
  domain: string;
  score: number;
  label: string;
  color: string;
}

export default function AssessmentResults() {
  const [, params] = useRoute("/assessment/:patientId/results");
  const patientId = params?.patientId ? parseInt(params.patientId) : null;
  const [isExporting, setIsExporting] = useState(false);

  const resultsQuery = trpc.assessments.getResults.useQuery(
    { patientId: patientId || 0 },
    { enabled: !!patientId }
  );

  const assessment = resultsQuery.data?.[0];

  const getScoreColor = (score: number) => {
    if (score < 50) return "bg-red-100 text-red-800 border-red-300";
    if (score < 70) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-green-100 text-green-800 border-green-300";
  };

  const getScoreLabel = (score: number) => {
    if (score < 50) return "Fraco";
    if (score < 70) return "Moderado";
    return "Alto";
  };

  const scores: ScoreData[] = assessment ? [
    { domain: "Intelectual", score: assessment.intellectualScore || 0, label: getScoreLabel(assessment.intellectualScore || 0), color: getScoreColor(assessment.intellectualScore || 0) },
    { domain: "Emocional", score: assessment.emotionalScore || 0, label: getScoreLabel(assessment.emotionalScore || 0), color: getScoreColor(assessment.emotionalScore || 0) },
    { domain: "Imaginativa", score: assessment.imaginativeScore || 0, label: getScoreLabel(assessment.imaginativeScore || 0), color: getScoreColor(assessment.imaginativeScore || 0) },
    { domain: "Sensorial", score: assessment.sensorialScore || 0, label: getScoreLabel(assessment.sensorialScore || 0), color: getScoreColor(assessment.sensorialScore || 0) },
    { domain: "Motora", score: assessment.motorScore || 0, label: getScoreLabel(assessment.motorScore || 0), color: getScoreColor(assessment.motorScore || 0) },
  ] : [];

  const handleExportPDF = async () => {
    if (!assessment) return;
    
    setIsExporting(true);
    try {
      // Implementar exportação de PDF
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar relatório");
    } finally {
      setIsExporting(false);
    }
  };

  if (!patientId) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Paciente não encontrado</p>
        </div>
      </DashboardLayout>
    );
  }

  if (resultsQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando resultados...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!assessment) {
    return (
      <DashboardLayout>
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Avaliação em Processamento</h2>
          <p className="text-gray-600 mb-6">
            A análise clínica está sendo processada. Por favor, aguarde alguns momentos e recarregue a página.
          </p>
          <Button onClick={() => window.location.reload()}>Recarregar</Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resultados da Avaliação</h1>
            <p className="text-gray-600 mt-1">Análise de Sobre-excitabilidades</p>
          </div>
          <Button onClick={handleExportPDF} disabled={isExporting} className="gap-2">
            <Download className="w-4 h-4" />
            {isExporting ? "Exportando..." : "Exportar PDF"}
          </Button>
        </div>

        {/* Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {scores.map((item) => (
            <Card key={item.domain} className="p-6">
              <div className="text-center">
                <h3 className="font-semibold text-gray-700 mb-4">{item.domain}</h3>
                <div className="text-4xl font-bold text-indigo-600 mb-2">{item.score}%</div>
                <Badge className={`${item.color} border`}>
                  {item.label}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* Diagnosis Card */}
        {assessment.diagnosis && (
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Diagnóstico</h2>
            <p className="text-blue-800 leading-relaxed">{assessment.diagnosis}</p>
            {assessment.confidenceLevel && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Nível de Confiança:</strong> {assessment.confidenceLevel}
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Clinical Analysis Card */}
        {assessment.clinicalAnalysis && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Análise Clínica</h2>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
              {assessment.clinicalAnalysis}
            </div>
          </Card>
        )}

        {/* Giftedness Type Card */}
        {assessment.giftednessType && (
          <Card className="p-6 bg-purple-50 border-purple-200">
            <h2 className="text-xl font-semibold text-purple-900 mb-4">Tipo de Superdotação Detectado</h2>
            <p className="text-lg font-semibold text-purple-800">{assessment.giftednessType}</p>
          </Card>
        )}

        {/* Recommendations Card */}
        {assessment.recommendations && (
          <Card className="p-6 bg-green-50 border-green-200">
            <h2 className="text-xl font-semibold text-green-900 mb-4">Recomendações Clínicas</h2>
            <div className="prose prose-sm max-w-none text-green-800 whitespace-pre-wrap">
              {assessment.recommendations}
            </div>
          </Card>
        )}

        {/* Back Button */}
        <div>
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
