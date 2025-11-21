import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

// Questões do questionário de sobre-excitabilidades
const QUESTIONS = [
  { id: 1, text: "Tenho intensa atividade mental (pensamentos e ideias incômuns).", domain: "intellectual" },
  { id: 2, text: "Sinto elevada curiosidade em assuntos do meu interesse.", domain: "intellectual" },
  { id: 3, text: "Tenho grande concentração no que gosto de fazer.", domain: "intellectual" },
  { id: 4, text: "Tenho lembranças e/ou ideias em detalhes.", domain: "intellectual" },
  { id: 5, text: "Sou observador(a) em detalhes naquilo que comumente os outros geralmente não percebem.", domain: "intellectual" },
  { id: 6, text: "Faço planejamentos detalhados de atividades (sejam quaisquer atividades).", domain: "intellectual" },
  { id: 7, text: "Construo e/ou compreendo conceitos inesperados para a maioria das pessoas.", domain: "intellectual" },
  { id: 8, text: "Falo e penso sobre minhas próprias ideias com frequência.", domain: "intellectual" },
  { id: 9, text: "Falo e penso sobre as ideias de outras pessoas com frequência (coisas que ouvi alguém dizer, que vi num filme, li num livro, etc).", domain: "intellectual" },
  { id: 10, text: "Tendo a preferir a vida interna, ou seja, ficar mais comigo mesmo(a).", domain: "intellectual" },
  { id: 11, text: "Sou questionadora(or).", domain: "intellectual" },
  { id: 12, text: "Tenho avidez por conhecimentos de uma área específica (ou várias áreas).", domain: "intellectual" },
  { id: 13, text: "Busco saber sempre o porquê das coisas, como elas são.", domain: "intellectual" },
  { id: 14, text: "Tenho profunda compreensão de ideias abstratas.", domain: "intellectual" },
  { id: 15, text: "Tenho preocupação com questões éticas, morais, políticas, ambientais, etc.", domain: "intellectual" },
  { id: 16, text: "Prefiro atividades, jogos, tarefas que exigem raciocínio lógico.", domain: "intellectual" },
  { id: 17, text: "Identifico-me com as emoções e sentimentos dos outros, principalmente o sofrimento.", domain: "emotional" },
  { id: 18, text: "Tenho profunda consciência de minhas emoções e estados internos.", domain: "emotional" },
  { id: 19, text: "Tenho intenso apego a objetos, pessoas, animais, lugares, etc e tenho dificuldade em desapegar.", domain: "emotional" },
  { id: 20, text: "Busco estabelecer intenso vínculo afetivo com outras pessoas.", domain: "emotional" },
  { id: 21, text: "Tenho dificuldade de adaptação a ambientes novos.", domain: "emotional" },
  { id: 22, text: "Sinto responsabilidade pelos outros (por ajudar, por cuidar, proteger, etc).", domain: "emotional" },
  { id: 23, text: "Tenho profunda sensibilidade às diversas situações do quotidiano.", domain: "emotional" },
  { id: 24, text: "Sou muito autocrítica(o).", domain: "emotional" },
  { id: 25, text: "Tenho elevada intensidade em alguns ou todos esses sentimentos: inibição, entusiasmo, euforia, orgulho, culpa, vergonha, ansiedade e medo.", domain: "emotional" },
  { id: 26, text: "Sinto estados de nervosismo, dor de estômago, tristeza profunda, rubores, palpitação e/ou suor excessivo.", domain: "emotional" },
  { id: 27, text: "Tenho o sono agitado e/ou durmo poucas horas.", domain: "emotional" },
  { id: 28, text: "Sinto-me profundamente decepcionada(o) quando não sou correspondida(o) em minhas emoções na relação com os outros.", domain: "emotional" },
  { id: 29, text: "Irrito-me intensamente quando uma situação gera alguma frustração.", domain: "emotional" },
  { id: 30, text: "A raiva ou outra emoção pode ser tanta que, em alguns momentos, \"escapa\" do meu controle e leva a crises emocionais.", domain: "emotional" },
  { id: 31, text: "Sou empática(o) com o sofrimento de pessoas e/ou animais e plantas.", domain: "emotional" },
  { id: 32, text: "Choro com facilidade por situações que comumente não comovem outras pessoas da minha idade ou do mesmo as mais velhas.", domain: "emotional" },
  { id: 33, text: "Tenho facilidade em associar imagens e impressões vindas dos sentidos.", domain: "imaginative" },
  { id: 34, text: "Utilizo e/ou gosto de metáforas para expressar ideias.", domain: "imaginative" },
  { id: 35, text: "Gosto de inventar e/ou construir coisas com os materiais que tenho à minha volta.", domain: "imaginative" },
  { id: 36, text: "Tenho elevada capacidade de enxergar detalhes que outras pessoas comumente não percebem.", domain: "imaginative" },
  { id: 37, text: "Tenho sonhos, sejam agradáveis ou pesadelos, com muitos detalhes.", domain: "imaginative" },
  { id: 38, text: "Tenho muitas imaginações a partir de elementos da realidade à minha volta.", domain: "imaginative" },
  { id: 39, text: "Tenho muitas ideias, mas tenho dificuldade em por em prática.", domain: "imaginative" },
  { id: 40, text: "Começo uma atividade ou projeto, mas não concluo até o final. Largo pela metade para logo começar outro que também não concluo. Tenho essa dificuldade de concluir coisas, pois são sempre muitas ideias.", domain: "imaginative" },
  { id: 41, text: "Distraio-me com facilidade com qualquer coisa ao meu redor, pois quase qualquer coisa estimula a minha imaginação.", domain: "imaginative" },
  { id: 42, text: "Se pudesse, gostaria de ficar mais no mundo da imaginação que no mundo real.", domain: "imaginative" },
  { id: 43, text: "Sou resistente a mudanças.", domain: "imaginative" },
  { id: 44, text: "Vivencio intensamente minhas imaginações (por exemplo, ao contar uma estória, é como se estivesse nela vivendo cada momento).", domain: "imaginative" },
  { id: 45, text: "Prefiro ficções (como Senhor dos Anéis, Harry Potter, etc) e/ou contos de fadas, fábulas, histórias em quadrinhos, etc. Gêneros imaginativos de estórias.", domain: "imaginative" },
  { id: 46, text: "Gosto de inventar/criar estórias, fazer desenhos ou qualquer tipo de arte.", domain: "imaginative" },
  { id: 47, text: "Faço muitos planos e tenho muitas ideias.", domain: "imaginative" },
  { id: 48, text: "Não tolero o tédio.", domain: "imaginative" },
  { id: 49, text: "Tenho necessidade de atividades novas e/ou desafiadoras todo ou a maior parte do tempo.", domain: "imaginative" },
  { id: 50, text: "Tenho estados de ansiedade (que pode se mostrar como medos e preocupações).", domain: "sensorial" },
  { id: 51, text: "Tenho sensibilidade às coisas belas, à estética seja de lugares, de objetos, de plantas, etc.", domain: "sensorial" },
  { id: 52, text: "Tenho satisfação com as coisas belas. Elas não passam despercebidas.", domain: "sensorial" },
  { id: 53, text: "Tenho os sentidos mais aguçados (por exemplo, percebo detalhes do gosto dos alimentos, nuances dos sons, sensibilidade no tato, nos cheiros).", domain: "sensorial" },
  { id: 54, text: "Tenho sensibilidade a certos tipos de luz, sons, gostos, texturas e/ou cheiros ao ponto de o incômodo ser tamanho que gera profunda irritação.", domain: "sensorial" },
  { id: 55, text: "Tenho necessidade de ser percebido(a) e de receber mais atenção dos outros ao meu redor.", domain: "sensorial" },
  { id: 56, text: "Tendo a gostar e buscar espontaneamente contato físico com pessoas (abraços, beijos, etc).", domain: "sensorial" },
  { id: 57, text: "Prefiro ter a companhia de alguém a ficar sozinha(o).", domain: "sensorial" },
  { id: 58, text: "Tenho a buscar por experiências prazerosas e confortáveis.", domain: "sensorial" },
  { id: 59, text: "Gosto de atividade física intensa.", domain: "motor" },
  { id: 60, text: "Sou competitiva(o) mesmo que o ambiente social não estimule essa conduta.", domain: "motor" },
  { id: 61, text: "Tendo a ser impulsiva(o). Falo e/ou ajo sem pensar nas consequências.", domain: "motor" },
  { id: 62, text: "Sou agitada(o). Tenho dificuldade em ficar quieta(o).", domain: "motor" },
  { id: 63, text: "Falo rápido, faço muitas coisas uma na sequência da outra, tenho muita energia.", domain: "motor" },
  { id: 64, text: "Prefiro esportes e/ou jogos que gaste bastante energia física.", domain: "motor" },
  { id: 65, text: "Sinto uma constante pressão interna para fazer coisas, para agir.", domain: "motor" },
  { id: 66, text: "Ficar parada(o) me gera irritação.", domain: "motor" },
  { id: 67, text: "Tenho necessidade de atividades físicas novas e/ou desafiadoras todo ou a maior parte do tempo.", domain: "motor" },
  { id: 68, text: "Eu me envolvo em brigas, conflitos (às vezes, também, para defender amigos ou os mais indefesos).", domain: "motor" },
];

const SCALE_OPTIONS = [
  { value: 0, label: "Nunca" },
  { value: 1, label: "Às vezes" },
  { value: 3, label: "Frequentemente" },
  { value: 4, label: "Sempre" },
];

interface AssessmentFormProps {
  token: string;
}

export default function AssessmentForm({ token }: AssessmentFormProps) {
  const [responses, setResponses] = useState<(number | null)[]>(Array(68).fill(null));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const submitMutation = trpc.assessments.submitResponses.useMutation();

  const handleResponseChange = (questionIndex: number, value: number) => {
    const newResponses = [...responses];
    newResponses[questionIndex] = value;
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (responses.some(r => r === null)) {
      alert("Por favor, responda todas as questões antes de enviar.");
      return;
    }

    try {
      await submitMutation.mutateAsync({
        token,
        responses: responses as number[],
      });
      setSubmitted(true);
    } catch (error) {
      alert("Erro ao enviar respostas: " + (error as any).message);
    }
  };

  const answeredCount = responses.filter(r => r !== null).length;
  const progress = (answeredCount / QUESTIONS.length) * 100;
  const currentQ = QUESTIONS[currentQuestion];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center shadow-lg">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Questionário Enviado!</h1>
          <p className="text-gray-600 mb-4">
            Obrigado por responder ao questionário de avaliação psicológica. Suas respostas foram registradas com sucesso.
          </p>
          <p className="text-sm text-gray-500">
            O psicólogo analisará suas respostas e entrará em contato com você em breve.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Questionário de Avaliação Psicológica
          </h1>
          <p className="text-gray-600">
            Indicadores de Sobre-excitabilidades nas Altas Habilidades/Superdotação
          </p>
        </div>

        <Card className="p-6 mb-6 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">
              Progresso: {answeredCount} de {QUESTIONS.length} questões respondidas
            </span>
            <span className="text-sm font-semibold text-indigo-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </Card>

        <Card className="p-8 mb-6 shadow-md">
          <div className="mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                {currentQuestion + 1}
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-800">{currentQ.text}</p>
                <p className="text-xs text-gray-500 mt-2 capitalize">
                  Domínio: {currentQ.domain === "intellectual" ? "Intelectual" : 
                            currentQ.domain === "emotional" ? "Emocional" :
                            currentQ.domain === "imaginative" ? "Imaginativa" :
                            currentQ.domain === "sensorial" ? "Sensorial" : "Motora"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <RadioGroup
              value={responses[currentQuestion]?.toString() ?? ""}
              onValueChange={(value) => handleResponseChange(currentQuestion, parseInt(value))}
            >
              {SCALE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-indigo-200">
                  <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                  <Label htmlFor={`option-${option.value}`} className="cursor-pointer flex-1">
                    <span className="font-medium text-gray-700">{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </Card>

        <div className="flex gap-4 justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
            className="flex-1"
          >
            ← Anterior
          </Button>

          {currentQuestion === QUESTIONS.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount !== QUESTIONS.length || submitMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {submitMutation.isPending ? "Enviando..." : "✓ Enviar Respostas"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              Próxima →
            </Button>
          )}
        </div>

        {answeredCount !== QUESTIONS.length && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Você precisa responder todas as {QUESTIONS.length} questões antes de enviar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
