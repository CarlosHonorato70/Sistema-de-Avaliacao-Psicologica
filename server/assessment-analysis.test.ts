import { describe, it, expect } from "vitest";
import { calculateScores } from "./assessment-analysis";

describe("Assessment Analysis - Score Calculation", () => {
  it("should calculate scores correctly for all domains", () => {
    // Criar array com 68 respostas
    const responses = new Array(68).fill(0);
    
    // Domínio Intelectual (Q1-16): todas as respostas = 4
    for (let i = 0; i < 16; i++) {
      responses[i] = 4;
    }
    
    // Domínio Emocional (Q17-32): todas as respostas = 3
    for (let i = 16; i < 32; i++) {
      responses[i] = 3;
    }
    
    // Domínio Imaginativa (Q33-49): todas as respostas = 1
    for (let i = 32; i < 49; i++) {
      responses[i] = 1;
    }
    
    // Domínio Sensorial (Q50-58): todas as respostas = 0
    for (let i = 49; i < 58; i++) {
      responses[i] = 0;
    }
    
    // Domínio Motora (Q59-68): todas as respostas = 4
    for (let i = 58; i < 68; i++) {
      responses[i] = 4;
    }

    const result = calculateScores(responses);

    // Verificar pontuações
    expect(result.scores.intellectual).toBe(16 * 4); // 64
    expect(result.scores.emotional).toBe(16 * 3); // 48
    expect(result.scores.imaginative).toBe(17 * 1); // 17
    expect(result.scores.sensorial).toBe(9 * 0); // 0
    expect(result.scores.motor).toBe(10 * 4); // 40

    // Verificar percentuais
    expect(result.percentages.intellectual).toBe(100); // 64 / 64 * 100
    expect(result.percentages.emotional).toBe(75); // 48 / 64 * 100
    expect(result.percentages.imaginative).toBeCloseTo(25, 1); // 17 / 68 * 100
    expect(result.percentages.sensorial).toBe(0); // 0 / 36 * 100
    expect(result.percentages.motor).toBe(100); // 40 / 40 * 100

    // Verificar classificações
    expect(result.classifications.intellectual).toBe("Alto"); // 100% >= 70%
    expect(result.classifications.emotional).toBe("Alto"); // 75% >= 70%
    expect(result.classifications.imaginative).toBe("Fraco"); // 25% < 50%
    expect(result.classifications.sensorial).toBe("Fraco"); // 0% < 50%
    expect(result.classifications.motor).toBe("Alto"); // 100% >= 70%
  });

  it("should classify scores correctly", () => {
    // Teste com respostas variadas
    const responses = new Array(68).fill(0);
    
    // Todas as respostas = 2 (valor médio)
    for (let i = 0; i < 68; i++) {
      responses[i] = 2;
    }

    const result = calculateScores(responses);

    // Com valor 2 em todas as questões, todos os domínios devem estar moderados (~50%)
    Object.values(result.classifications).forEach(classification => {
      expect(classification).toBe("Moderado"); // ~50% >= 50% e < 70%
    });
  });

  it("should handle mixed responses correctly", () => {
    const responses = new Array(68).fill(0);
    
    // Intelectual: alternando 0 e 4
    for (let i = 0; i < 16; i++) {
      responses[i] = i % 2 === 0 ? 4 : 0;
    }
    
    // Resto com valores altos
    for (let i = 16; i < 68; i++) {
      responses[i] = 4;
    }

    const result = calculateScores(responses);

    // Intelectual deve ter metade dos pontos máximos
    expect(result.scores.intellectual).toBe(8 * 4); // 32 (8 questões com 4)
    expect(result.percentages.intellectual).toBeCloseTo(50, 1); // 32 / 64 * 100
    expect(result.classifications.intellectual).toBe("Moderado"); // 50% é >= 50% e < 70%
  });

  it("should return zero scores for empty responses", () => {
    const responses = new Array(68).fill(0);

    const result = calculateScores(responses);

    // Todos os scores devem ser 0
    expect(result.scores.intellectual).toBe(0);
    expect(result.scores.emotional).toBe(0);
    expect(result.scores.imaginative).toBe(0);
    expect(result.scores.sensorial).toBe(0);
    expect(result.scores.motor).toBe(0);

    // Todos os percentuais devem ser 0
    Object.values(result.percentages).forEach(percentage => {
      expect(percentage).toBe(0);
    });

    // Todos devem ser classificados como "Fraco"
    Object.values(result.classifications).forEach(classification => {
      expect(classification).toBe("Fraco"); // 0% < 50%
    });
  });

  it("should return maximum scores for all 4s", () => {
    const responses = new Array(68).fill(4);

    const result = calculateScores(responses);

    // Verificar que todos os percentuais são 100
    Object.values(result.percentages).forEach(percentage => {
      expect(percentage).toBe(100);
    });

    // Todos devem ser classificados como "Alto"
    Object.values(result.classifications).forEach(classification => {
      expect(classification).toBe("Alto"); // 100% >= 70%
    });
  });
});
