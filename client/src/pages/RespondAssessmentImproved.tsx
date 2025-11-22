import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const QUESTIONS = [
  // Domínio Intelectual (1-16)
  { id: 1, text: "Tenho curiosidade sobre como as coisas funcionam", domain: "Intelectual" },
  { id: 2, text: "Gosto de resolver problemas complexos", domain: "Intelectual" },
  { id: 3, text: "Leio muito e gosto de aprender coisas novas", domain: "Intelectual" },
  { id: 4, text: "Tenho uma memória excepcional", domain: "Intelectual" },
  { id: 5, text: "Gosto de questionar as coisas e entender o porquê", domain: "Intelectual" },
  { id: 6, text: "Tenho facilidade em compreender conceitos abstratos", domain: "Intelectual" },
  { id: 7, text: "Gosto de analisar diferentes perspectivas sobre um assunto", domain: "Intelectual" },
  { id: 8, text: "Tenho interesse em múltiplos assuntos", domain: "Intelectual" },
  { id: 9, text: "Gosto de discutir ideias profundas", domain: "Intelectual" },
  { id: 10, text: "Tenho facilidade em aprender novos idiomas ou habilidades", domain: "Intelectual" },
  { id: 11, text: "Gosto de desafios intelectuais", domain: "Intelectual" },
  { id: 12, text: "Tenho pensamentos rápidos e ágeis", domain: "Intelectual" },
  { id: 13, text: "Gosto de pesquisar e investigar tópicos de interesse", domain: "Intelectual" },
  { id: 14, text: "Tenho facilidade em ver padrões e conexões", domain: "Intelectual" },
  { id: 15, text: "Gosto de ler sobre ciência, história ou filosofia", domain: "Intelectual" },
  { id: 16, text: "Tenho dificuldade em aceitar respostas superficiais", domain: "Intelectual" },
  
  // Domínio Emocional (17-32)
  { id: 17, text: "Sou muito sensível aos sentimentos dos outros", domain: "Emocional" },
  { id: 18, text: "Tenho reações emocionais intensas", domain: "Emocional" },
  { id: 19, text: "Sou facilmente tocado por histórias ou filmes", domain: "Emocional" },
  { id: 20, text: "Tenho empatia profunda pelas pessoas", domain: "Emocional" },
  { id: 21, text: "Sou muito autocrítico", domain: "Emocional" },
  { id: 22, text: "Tenho medo de decepcionar as pessoas", domain: "Emocional" },
  { id: 23, text: "Sou muito consciente de minhas imperfeições", domain: "Emocional" },
  { id: 24, text: "Tenho sentimentos profundos de responsabilidade social", domain: "Emocional" },
  { id: 25, text: "Sou muito afetado por injustiça ou crueldade", domain: "Emocional" },
  { id: 26, text: "Tenho dificuldade em lidar com críticas", domain: "Emocional" },
  { id: 27, text: "Sou muito leal aos meus amigos e familiares", domain: "Emocional" },
  { id: 28, text: "Tenho paixão por causas que acredito", domain: "Emocional" },
  { id: 29, text: "Sou muito emotivo e expressivo", domain: "Emocional" },
  { id: 30, text: "Tenho dificuldade em controlar minhas emoções às vezes", domain: "Emocional" },
  { id: 31, text: "Sou muito compassivo com o sofrimento alheio", domain: "Emocional" },
  { id: 32, text: "Tenho sentimentos intensos de alegria ou tristeza", domain: "Emocional" },

  // Domínio Imaginativa (33-49)
  { id: 33, text: "Tenho uma imaginação muito ativa", domain: "Imaginativa" },
  { id: 34, text: "Gosto de criar histórias ou mundos imaginários", domain: "Imaginativa" },
  { id: 35, text: "Tenho muitas ideias criativas", domain: "Imaginativa" },
  { id: 36, text: "Gosto de pensar em possibilidades e 'e se'", domain: "Imaginativa" },
  { id: 37, text: "Sou muito criativo em resolver problemas", domain: "Imaginativa" },
  { id: 38, text: "Tenho facilidade em visualizar coisas em minha mente", domain: "Imaginativa" },
  { id: 39, text: "Gosto de brincadeiras imaginativas ou jogos de fantasia", domain: "Imaginativa" },
  { id: 40, text: "Tenho sonhos muito vívidos e detalhados", domain: "Imaginativa" },
  { id: 41, text: "Gosto de arte, música ou atividades criativas", domain: "Imaginativa" },
  { id: 42, text: "Tenho uma perspectiva única e original", domain: "Imaginativa" },
  { id: 43, text: "Gosto de pensar em conceitos abstratos", domain: "Imaginativa" },
  { id: 44, text: "Tenho facilidade em encontrar soluções inovadoras", domain: "Imaginativa" },
  { id: 45, text: "Gosto de metáforas e analogias", domain: "Imaginativa" },
  { id: 46, text: "Tenho uma mente que faz conexões inusitadas", domain: "Imaginativa" },
  { id: 47, text: "Gosto de explorar ideias novas e não convencionais", domain: "Imaginativa" },
  { id: 48, text: "Tenho facilidade em pensar de forma divergente", domain: "Imaginativa" },
  { id: 49, text: "Gosto de desafiar convenções e explorar o desconhecido", domain: "Imaginativa" },

  // Domínio Sensorial (50-58)
  { id: 50, text: "Sou sensível a sons altos ou ruídos", domain: "Sensorial" },
  { id: 51, text: "Sou afetado por luzes brilhantes ou mudanças de iluminação", domain: "Sensorial" },
  { id: 52, text: "Tenho preferências fortes por certos sabores ou texturas", domain: "Sensorial" },
  { id: 53, text: "Sou sensível a odores", domain: "Sensorial" },
  { id: 54, text: "Tenho gosto refinado em artes ou estética", domain: "Sensorial" },
  { id: 55, text: "Sou afetado por desconforto físico ou dor", domain: "Sensorial" },
  { id: 56, text: "Tenho sensibilidade a mudanças de temperatura", domain: "Sensorial" },
  { id: 57, text: "Sou muito consciente de detalhes visuais", domain: "Sensorial" },
  { id: 58, text: "Tenho sensibilidade a texturas de roupas ou materiais", domain: "Sensorial" },

  // Domínio Motora (59-68)
  { id: 59, text: "Sou muito ativo e energético", domain: "Motora" },
  { id: 60, text: "Tenho dificuldade em ficar parado por muito tempo", domain: "Motora" },
  { id: 61, text: "Gosto de esportes ou atividades físicas", domain: "Motora" },
  { id: 62, text: "Tenho boa coordenação motora", domain: "Motora" },
  { id: 63, text: "Sou impulsivo e ajo rápido", domain: "Motora" },
  { id: 64, text: "Tenho muita energia e entusiasmo", domain: "Motora" },
  { id: 65, text: "Gosto de atividades que envolvem movimento", domain: "Motora" },
  { id: 66, text: "Tenho dificuldade em relaxar ou desacelerar", domain: "Motora" },
  { id: 67, text: "Sou muito expressivo corporalmente", domain: "Motora" },
  { id: 68, text: "Tenho necessidade de movimento constante", domain: "Motora" },
];

export default function RespondAssessmentImproved() {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const question = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const answeredCount = Object.keys(responses).length;
  const allAnswered = answeredCount === QUESTIONS.length;

  const handleResponse = (value: number) => {
    setResponses({
      ...responses,
      [question.id]: value,
    });
    
    // Auto-advance to next question
    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      toast.error("Por favor, responda todas as questões antes de enviar");
      return;
    }

    setLoading(true);
    try {
      // Converter respostas para array
      const responsesArray = QUESTIONS.map((q) => responses[q.id] || 0);
      
      // Aqui você chamaria a API para enviar as respostas
      // await trpc.assessment.submitResponses.useMutation()
      
      toast.success("Respostas enviadas com sucesso!");
      setLocation("/assessment-success");
    } catch (error) {
      toast.error("Erro ao enviar respostas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getResponseColor = (value: number | undefined) => {
    if (value === undefined) return "bg-gray-100 text-gray-600";
    if (value === 0) return "bg-red-100 text-red-700 border-red-300";
    if (value === 1) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    if (value === 3) return "bg-blue-100 text-blue-700 border-blue-300";
    if (value === 4) return "bg-green-100 text-green-700 border-green-300";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header with Progress */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Questionário de Avaliação</h1>
              <p className="text-sm text-gray-600">Questão {currentQuestion + 1} de {QUESTIONS.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-blue-600">{answeredCount}/{QUESTIONS.length} respondidas</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!showReview ? (
          <>
            {/* Question Card */}
            <Card className="mb-8 border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{question.text}</CardTitle>
                    <CardDescription className="mt-2">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {question.domain}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-300">Q{question.id}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-8">
                <div className="mb-8">
                  <p className="text-sm text-gray-600 mb-4 font-medium">Escolha sua resposta:</p>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { value: 0, label: "Nunca", color: "bg-red-500 hover:bg-red-600" },
                      { value: 1, label: "Às vezes", color: "bg-yellow-500 hover:bg-yellow-600" },
                      { value: 3, label: "Frequentemente", color: "bg-blue-500 hover:bg-blue-600" },
                      { value: 4, label: "Sempre", color: "bg-green-500 hover:bg-green-600" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleResponse(option.value)}
                        className={`p-4 rounded-lg font-semibold text-white transition-all transform hover:scale-105 ${
                          responses[question.id] === option.value
                            ? `${option.color} ring-4 ring-offset-2 ring-gray-400`
                            : `${option.color} opacity-70`
                        }`}
                      >
                        <div className="text-lg font-bold">{option.value === 0 ? "0" : option.value === 1 ? "1" : option.value === 3 ? "3" : "4"}</div>
                        <div className="text-xs mt-1">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mb-8">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                variant="outline"
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>

              <div className="flex gap-2">
                {QUESTIONS.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                      idx === currentQuestion
                        ? "bg-blue-600 text-white ring-2 ring-blue-300"
                        : responses[q.id] !== undefined
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleNext}
                disabled={currentQuestion === QUESTIONS.length - 1}
                className="gap-2"
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Submit Button */}
            {currentQuestion === QUESTIONS.length - 1 && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowReview(true)}
                  disabled={!allAnswered}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-6 text-lg font-semibold"
                >
                  Revisar e Enviar
                  <Send className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Review Screen */}
            <Card className="mb-8 border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle>Revise suas respostas</CardTitle>
                <CardDescription>Verifique se tudo está correto antes de enviar</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {QUESTIONS.map((q) => (
                    <div key={q.id} className="pb-4 border-b last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{q.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{q.domain}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-lg font-semibold ml-4 ${getResponseColor(responses[q.id])}`}>
                          {responses[q.id] === 0 ? "Nunca" : responses[q.id] === 1 ? "Às vezes" : responses[q.id] === 3 ? "Freq." : "Sempre"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Final Actions */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setShowReview(false)}
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg"
              >
                Voltar e Editar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-6 text-lg font-semibold"
              >
                {loading ? "Enviando..." : "Enviar Respostas"}
                <Send className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
