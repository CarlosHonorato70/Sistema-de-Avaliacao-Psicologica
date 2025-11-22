import { invokeLLM } from "./_core/llm";

// Mapeamento de questões por domínio
const DOMAIN_QUESTIONS = {
  intellectual: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  emotional: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
  imaginative: [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
  sensorial: [50, 51, 52, 53, 54, 55, 56, 57, 58],
  motor: [59, 60, 61, 62, 63, 64, 65, 66, 67, 68],
};

export interface ScoresByDomain {
  intellectual: number;
  emotional: number;
  imaginative: number;
  sensorial: number;
  motor: number;
}

export interface PercentagesByDomain {
  intellectual: number;
  emotional: number;
  imaginative: number;
  sensorial: number;
  motor: number;
}

export interface AssessmentScores {
  scores: ScoresByDomain;
  percentages: PercentagesByDomain;
  classifications: Record<string, string>;
}

export function calculateScores(responses: number[]): AssessmentScores {
  const scores: ScoresByDomain = {
    intellectual: 0,
    emotional: 0,
    imaginative: 0,
    sensorial: 0,
    motor: 0,
  };

  Object.entries(DOMAIN_QUESTIONS).forEach(([domain, questionIndices]) => {
    const domainScore = questionIndices.reduce((sum, qIndex) => {
      const responseIndex = qIndex - 1;
      return sum + (responses[responseIndex] || 0);
    }, 0);
    scores[domain as keyof ScoresByDomain] = domainScore;
  });

  const percentages: PercentagesByDomain = {
    intellectual: (scores.intellectual / (16 * 4)) * 100,
    emotional: (scores.emotional / (16 * 4)) * 100,
    imaginative: (scores.imaginative / (17 * 4)) * 100,
    sensorial: (scores.sensorial / (9 * 4)) * 100,
    motor: (scores.motor / (10 * 4)) * 100,
  };

  const classifications: Record<string, string> = {};
  Object.entries(percentages).forEach(([domain, percentage]) => {
    if (percentage < 50) {
      classifications[domain] = "Fraco";
    } else if (percentage < 70) {
      classifications[domain] = "Moderado";
    } else {
      classifications[domain] = "Alto";
    }
  });

  return { scores, percentages, classifications };
}

export async function generateClinicalAnalysis(
  responses: number[],
  patientName: string,
  patientAge?: number,
  assessmentDate?: Date
): Promise<{
  clinicalAnalysis: string;
  diagnosis: string;
  recommendations: string;
  confidenceLevel: "Alta" | "Moderada" | "Baixa";
  giftednessType: string;
}> {
  const scores = calculateScores(responses);

  // Preparar tabela detalhada com todas as 68 respostas
  let responsesTable = "";
  const domainNames: Record<string, string> = {
    intellectual: "Intelectual",
    emotional: "Emocional",
    imaginative: "Imaginativa",
    sensorial: "Sensorial",
    motor: "Motora",
  };

  Object.entries(DOMAIN_QUESTIONS).forEach(([domain, questionIndices]) => {
    const domainResponses = questionIndices
      .map((qIndex) => `Q${qIndex}: ${responses[qIndex - 1] ?? "X"}`)
      .join(", ");
    responsesTable += `\nSE ${domainNames[domain]} - Questoes de ${questionIndices[0]} a ${questionIndices[questionIndices.length - 1]}: ${domainResponses}`;
  });

  const systemPrompt = `Voce eh um especialista clinico em superdotacao e altas habilidades, fundamentado no Manual Clinico para Adultos Superdotados e em modelos consagrados de sobre-excitabilidade psicomotora (Dabrowski, Renzulli, Gagne).`;

  const userPrompt = `DADOS DO PACIENTE:
- Nome: ${patientName}
- Idade: ${patientAge || "Nao informada"}
- Data da Avaliacao: ${assessmentDate ? assessmentDate.toLocaleDateString("pt-BR") : "Nao informada"}
- Instrumento: Questionario de Indicadores de Sobre-excitabilidade nas Altas Habilidades/Superdotacao (68 questoes)

RESPOSTAS DO QUESTIONARIO (68 questoes sequenciais):
${responsesTable}

ESTRUTURA DE DOMINIOS E RESPOSTAS:
SE Intelectual - Questoes de 1 a 16: Pontuacao ${scores.scores.intellectual} (${scores.percentages.intellectual.toFixed(1)}%) - ${scores.classifications.intellectual}
SE Emocional - Questoes de 17 a 32: Pontuacao ${scores.scores.emotional} (${scores.percentages.emotional.toFixed(1)}%) - ${scores.classifications.emotional}
SE Imaginativa - Questoes de 33 a 49: Pontuacao ${scores.scores.imaginative} (${scores.percentages.imaginative.toFixed(1)}%) - ${scores.classifications.imaginative}
SE Sensorial - Questoes de 50 a 58: Pontuacao ${scores.scores.sensorial} (${scores.percentages.sensorial.toFixed(1)}%) - ${scores.classifications.sensorial}
SE Motora - Questoes de 59 a 68: Pontuacao ${scores.scores.motor} (${scores.percentages.motor.toFixed(1)}%) - ${scores.classifications.motor}

ESCALA DE RESPOSTA: 0 = Nunca | 1 = As vezes | 3 = Frequentemente | 4 = Sempre
Obs.: Perguntas nao respondidas sao indicadas por um X.

TAREFA:

1. EXTRACAO PRECISA DE DADOS
- Organize as 68 respostas em uma tabela por dominio
- Indique a resposta (0, 1, 3 ou 4) para CADA questao
- Calcule pontuacao total por dominio
- Calcule percentual de cada dominio em relacao ao maximo possivel

2. INTERPRETACAO CLINICA POR DOMINIO
Para cada dominio (Intelectual, Emocional, Imaginativa, Sensorial, Motora):
- Descreva o que a pontuacao representa clinicamente
- Identifique questoes-chave com respostas altas (3-4) ou baixas (0-1)
- Explique o significado das respostas em contexto de superdotacao
- Aponte padroes consistentes ou inconsistentes

3. ANALISE DO PERFIL MULTIDIMENSIONAL
- Identifique o padrao geral de sobre-excitabilidade (uniforme vs. heterogeneo)
- Destaque dominios fortes (70%+), moderados (50-70%), fracos (<50%)
- Explique como o padrao especifico correlaciona com tipos de superdotacao:
  * Superdotado Intelectual Puro (alta intelectual, outras variaveis)
  * Superdotado Criativo (alta intelectual + imaginativa)
  * Superdotado Emocional/Sensivel (alta emocional + sensorial)
  * Superdotado Motora (alta motora + respostas variaveis)
  * Superdotado Multidimensional (multiplos dominios elevados)

4. CRITERIOS DE SUPERDOTACAO
Avalie cada criterio:
- Capacidade intelectual avancada (baseado em sobre-excitabilidade intelectual + imaginativa)
- Criatividade e pensamento divergente (baseado em imaginativa + sensorial)
- Comprometimento com tarefa (baseado em padrao de concentracao e intensidade)
- Profundidade perceptual (baseado em sensorial + intelectual)
- Sobre-excitabilidade psicomotora multidimensional (numero de dominios em niveis moderado-alto)

5. DIAGNOSTICO FINAL
Conclusao clara sobre a presenca ou ausencia de superdotacao/altas habilidades
- Indique nivel de confianca (Alta/Moderada/Baixa)
- Especifique tipo/perfil de superdotacao detectado

6. CONSIDERACOES ESPECIAIS POR IDADE
Se adulto (25+):
- Avalie possivel masking emocional ou regulacao desenvolvida
- Considere canalizacao de energias em idade adulta
- Interprete padroes atipicos como adaptacao psicossocial

Se crianca/adolescente (<18):
- Avalie se padrao eh developmentalmente apropriado
- Identifique areas de aceleracao potencial
- Considere necessidade de enriquecimento ambiental

7. RECOMENDACOES CLINICAS
- Avaliacao complementar necessaria (testes de QI, criatividade, aptidoes especificas)
- Intervencoes educacionais/clinicas recomendadas
- Orientacao vocacional/ocupacional baseada no perfil
- Estrategias de bem-estar baseadas em padrao de sobre-excitabilidade

FORMATO DE RESPOSTA:
Estruture a analise em secoes claramente demarcadas com:
- Tabelas para dados (questoes, respostas, pontuacoes)
- Analises interpretativas fundamentadas
- Citacoes do Manual Clinico quando aplicavel
- Conclusoes explicitas e fundamentadas
- Recomendacoes praticas
- Limitacoes ou ressalvas metodologicas

IMPORTANTE:
- Use apenas os dados fornecidos (nao especule alem do questionario)
- Cite caracteristicas especificas com numeros de questoes
- Respeite a abordagem multidimensional de Dabrowski
- Considere que padroes heterogeneos sao comuns em superdotados reais
- Diferencie entre ausencia de respostas altas e resposta genuina baixa
- Nao citar outros pacientes na avaliacao`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message.content;
    const analysisText = typeof content === "string" ? content : "";

    const clinicalAnalysis = extractSection(analysisText, "INTERPRETACAO CLINICA", "ANALISE DO PERFIL") || analysisText;
    const diagnosis = extractSection(analysisText, "DIAGNOSTICO FINAL", "RECOMENDACOES") || "Analise em andamento";
    const recommendations = extractSection(analysisText, "RECOMENDACOES CLINICAS", "") || "Recomendacoes serao fornecidas apos analise completa";

    const confidenceLevel = extractConfidenceLevel(analysisText);
    const giftednessType = extractGiftednessType(analysisText);

    return {
      clinicalAnalysis,
      diagnosis,
      recommendations,
      confidenceLevel,
      giftednessType,
    };
  } catch (error) {
    console.error("Erro ao gerar analise clinica:", error);
    throw new Error("Falha ao gerar analise com IA");
  }
}

function extractSection(text: string, startMarker: string, endMarker: string): string | null {
  const startIndex = text.indexOf(startMarker);
  if (startIndex === -1) return null;

  const contentStart = startIndex + startMarker.length;
  const endIndex = endMarker ? text.indexOf(endMarker, contentStart) : text.length;

  const result = text.substring(contentStart, endIndex > startIndex ? endIndex : text.length).trim();
  return result || null;
}

function extractConfidenceLevel(text: string): "Alta" | "Moderada" | "Baixa" {
  if (text.includes("Alta confianca") || text.includes("confianca alta")) return "Alta";
  if (text.includes("Moderada") || text.includes("moderada")) return "Moderada";
  return "Baixa";
}

function extractGiftednessType(text: string): string {
  if (text.includes("Multidimensional")) return "Superdotado Multidimensional";
  if (text.includes("Criativo")) return "Superdotado Criativo";
  if (text.includes("Emocional") && text.includes("Sensivel")) return "Superdotado Emocional/Sensivel";
  if (text.includes("Intelectual Puro")) return "Superdotado Intelectual Puro";
  if (text.includes("Motora")) return "Superdotado Motora";
  return "Padrao de Superdotacao Detectado";
}
