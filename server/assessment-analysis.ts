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

/**
 * Calcula as pontuações por domínio
 */
export function calculateScores(responses: number[]): AssessmentScores {
  const scores: ScoresByDomain = {
    intellectual: 0,
    emotional: 0,
    imaginative: 0,
    sensorial: 0,
    motor: 0,
  };

  // Calcular soma por domínio
  Object.entries(DOMAIN_QUESTIONS).forEach(([domain, questionIndices]) => {
    const domainScore = questionIndices.reduce((sum, qIndex) => {
      const responseIndex = qIndex - 1; // Converter para índice 0-based
      return sum + (responses[responseIndex] || 0);
    }, 0);
    scores[domain as keyof ScoresByDomain] = domainScore;
  });

  // Calcular percentuais
  const percentages: PercentagesByDomain = {
    intellectual: (scores.intellectual / (16 * 4)) * 100,
    emotional: (scores.emotional / (16 * 4)) * 100,
    imaginative: (scores.imaginative / (17 * 4)) * 100,
    sensorial: (scores.sensorial / (9 * 4)) * 100,
    motor: (scores.motor / (10 * 4)) * 100,
  };

  // Classificar por faixa
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

/**
 * Gera análise clínica usando IA baseada no prompt fornecido
 */
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

  // Preparar dados para o prompt
  const responseTable = Object.entries(DOMAIN_QUESTIONS)
    .map(([domain, questionIndices]) => {
      const domainResponses = questionIndices.map((qIndex) => responses[qIndex - 1]);
      return `${domain.toUpperCase()}: Questões ${questionIndices.join(", ")} = [${domainResponses.join(", ")}]`;
    })
    .join("\n");

  const systemPrompt = `Você é um especialista clínico em superdotação e altas habilidades, fundamentado no "Manual Clínico para Adultos Superdotados" e em modelos consagrados de sobre-excitabilidade psicomotora (Dabrowski, Renzulli, Gagné).`;

  const userPrompt = `DADOS DO PACIENTE:
- Nome: ${patientName}
- Idade: ${patientAge || "Não informada"}
- Data da Avaliação: ${assessmentDate ? assessmentDate.toLocaleDateString("pt-BR") : "Não informada"}
- Instrumento: Questionário de Indicadores de Sobre-excitabilidade nas Altas Habilidades/Superdotação (68 questões)

RESPOSTAS DO QUESTIONÁRIO (68 questões sequenciais):
${responseTable}

ESTRUTURA DE DOMÍNIOS E RESPOSTAS:
SE Intelectual - Questões de 1 a 16: Pontuação ${scores.scores.intellectual} (${scores.percentages.intellectual.toFixed(1)}%) - ${scores.classifications.intellectual}
SE Emocional - Questões de 17 a 32: Pontuação ${scores.scores.emotional} (${scores.percentages.emotional.toFixed(1)}%) - ${scores.classifications.emotional}
SE Imaginativa - Questões de 33 a 49: Pontuação ${scores.scores.imaginative} (${scores.percentages.imaginative.toFixed(1)}%) - ${scores.classifications.imaginative}
SE Sensorial - Questões de 50 a 58: Pontuação ${scores.scores.sensorial} (${scores.percentages.sensorial.toFixed(1)}%) - ${scores.classifications.sensorial}
SE Motora - Questões de 59 a 68: Pontuação ${scores.scores.motor} (${scores.percentages.motor.toFixed(1)}%) - ${scores.classifications.motor}

ESCALA DE RESPOSTA: 0 = Nunca | 1 = Às vezes | 3 = Frequentemente | 4 = Sempre

TAREFA:
1. EXTRAÇÃO PRECISA DE DADOS - Organize as 68 respostas em uma tabela por domínio - Indique a resposta (0, 1, 3 ou 4) para CADA questão - Calcule pontuação total por domínio - Calcule percentual de cada domínio em relação ao máximo possível

2. INTERPRETAÇÃO CLÍNICA POR DOMÍNIO Para cada domínio (Intelectual, Emocional, Imaginativa, Sensorial, Motora): - Descreva o que a pontuação representa clinicamente - Identifique questões-chave com respostas altas (3-4) ou baixas (0-1) - Explique o significado das respostas em contexto de superdotação - Aponte padrões consistentes ou inconsistentes

3. ANÁLISE DO PERFIL MULTIDIMENSIONAL - Identifique o padrão geral de sobre-excitabilidade (uniforme vs. heterogêneo) - Destaque domínios fortes (70%+), moderados (50-70%), fracos (<50%) - Explique como o padrão específico correlaciona com tipos de superdotação: * Superdotado Intelectual Puro (alta intelectual, outras variáveis) * Superdotado Criativo (alta intelectual + imaginativa) * Superdotado Emocional/Sensível (alta emocional + sensorial) * Superdotado Motora (alta motora + respostas variáveis) * Superdotado Multidimensional (múltiplos domínios elevados)

4. CRITÉRIOS DE SUPERDOTAÇÃO Avalie cada critério: ✅ Capacidade intelectual avançada (baseado em sobre-excitabilidade intelectual + imaginativa) ✅ Criatividade e pensamento divergente (baseado em imaginativa + sensorial) ✅ Comprometimento com tarefa (baseado em padrão de concentração e intensidade) ✅ Profundidade perceptual (baseado em sensorial + intelectual) ✅ Sobre-excitabilidade psicomotora multidimensional (número de domínios em níveis moderado-alto)

5. DIAGNÓSTICO FINAL Conclusão clara sobre a presença ou ausência de superdotação/altas habilidades - Indique nível de confiança (Alta/Moderada/Baixa) - Especifique tipo/perfil de superdotação detectado

6. CONSIDERAÇÕES ESPECIAIS POR IDADE Se adulto (25+): - Avalie possível masking emocional ou regulação desenvolvida - Considere canalização de energias em idade adulta - Interprete padrões atípicos como adaptação psicossocial Se criança/adolescente (<18): - Avalie se padrão é developmentalmente apropriado - Identifique áreas de aceleração potencial - Considere necessidade de enriquecimento ambiental

7. RECOMENDAÇÕES CLÍNICAS - Avaliação complementar necessária (testes de QI, criatividade, aptidões específicas) - Intervenções educacionais/clínicas recomendadas - Orientação vocacional/ocupacional baseada no perfil - Estratégias de bem-estar baseadas em padrão de sobre-excitabilidade

FORMATO DE RESPOSTA: Estruture a análise em seções claramente demarcadas com:
- Tabelas para dados (questões, respostas, pontuações)
- Análises interpretativas fundamentadas
- Citações do Manual Clínico quando aplicável
- Conclusões explícitas e fundamentadas
- Recomendações práticas
- Limitações ou ressalvas metodológicas

IMPORTANTE:
- Use apenas os dados fornecidos (não especule além do questionário)
- Cite características específicas com números de questões
- Respeite a abordagem multidimensional de Dabrowski
- Considere que padrões heterogêneos são comuns em superdotados reais
- Diferencie entre ausência de respostas altas e resposta genuína baixa.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message.content;
    const analysisText = typeof content === "string" ? content : "";

    // Extrair seções da análise
    const clinicalAnalysis = extractSection(analysisText, "INTERPRETAÇÃO CLÍNICA", "ANÁLISE DO PERFIL") || analysisText;
    const diagnosis = extractSection(analysisText, "DIAGNÓSTICO FINAL", "RECOMENDAÇÕES") || "Análise em andamento";
    const recommendations = extractSection(analysisText, "RECOMENDAÇÕES CLÍNICAS", "") || "Recomendações serão fornecidas após análise completa";

    // Determinar nível de confiança e tipo de superdotação
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
    console.error("Erro ao gerar análise clínica:", error);
    throw new Error("Falha ao gerar análise com IA");
  }
}

/**
 * Extrai uma seção do texto da análise
 */
function extractSection(text: string, startMarker: string, endMarker: string): string | null {
  const startIndex = text.indexOf(startMarker);
  if (startIndex === -1) return null;

  const contentStart = startIndex + startMarker.length;
  const endIndex = endMarker ? text.indexOf(endMarker, contentStart) : text.length;

  const result = text.substring(contentStart, endIndex > startIndex ? endIndex : text.length).trim();
  return result || null;
}

/**
 * Extrai o nível de confiança da análise
 */
function extractConfidenceLevel(text: string): "Alta" | "Moderada" | "Baixa" {
  if (text.includes("Alta confiança") || text.includes("confiança alta")) return "Alta";
  if (text.includes("Moderada") || text.includes("moderada")) return "Moderada";
  return "Baixa";
}

/**
 * Extrai o tipo de superdotação detectado
 */
function extractGiftednessType(text: string): string {
  if (text.includes("Multidimensional")) return "Superdotado Multidimensional";
  if (text.includes("Criativo")) return "Superdotado Criativo";
  if (text.includes("Emocional") && text.includes("Sensível")) return "Superdotado Emocional/Sensível";
  if (text.includes("Intelectual Puro")) return "Superdotado Intelectual Puro";
  if (text.includes("Motora")) return "Superdotado Motora";
  return "Padrão de Superdotação Detectado";
}
