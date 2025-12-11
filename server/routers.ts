import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createPatient,
  getPatientsByPsychologist,
  getPatientById,
  createAssessmentLink,
  getAssessmentLinkByToken,
  createAssessmentResponse,
  markAssessmentLinkCompleted,
  getAssessmentByPatientId,
  generateToken,
  getAssessmentResponseByLinkId,
  createAssessment,
  updateLinkAccessAudit,
} from "./db";

// Input validation schemas
const createPatientInput = z.object({
  name: z.string().min(1),
  age: z.number().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

const generateLinkInput = z.object({
  patientId: z.number(),
  expiryDays: z.number().min(1).max(365).optional().default(30),
  sendEmail: z.boolean().optional().default(false),
});

const getByTokenInput = z.object({
  token: z.string(),
});

const submitResponsesInput = z.object({
  token: z.string(),
  responses: z.array(z.number()),
});

const getResultsInput = z.object({
  patientId: z.number(),
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  patients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getPatientsByPsychologist(ctx.user.id);
    }),
    
    create: protectedProcedure.input(createPatientInput).mutation(async ({ ctx, input }) => {
      return createPatient({
        psychologistId: ctx.user.id,
        name: input.name,
        age: input.age,
        email: input.email,
        phone: input.phone,
        notes: input.notes,
      });
    }),
    
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return getPatientById(input.id);
    }),
  }),

  assessments: router({
    generateLink: protectedProcedure.input(generateLinkInput).mutation(async ({ ctx, input }) => {
      const patient = await getPatientById(input.patientId);
      if (!patient || patient.psychologistId !== ctx.user.id) {
        throw new Error("Patient not found or access denied");
      }
      
      // Validate patient has email if sendEmail is requested
      if (input.sendEmail && !patient.email) {
        throw new Error("Patient does not have an email address registered");
      }
      
      const token = await generateToken();
      const expiryDays = input.expiryDays || 30;
      const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
      
      const linkData = {
        patientId: input.patientId,
        token,
        expiresAt,
        expiryDays,
        emailSentAt: input.sendEmail ? new Date() : undefined,
      };
      
      await createAssessmentLink(linkData);
      
      // Send email if requested
      let emailSent = false;
      if (input.sendEmail && patient.email) {
        try {
          const { sendAssessmentLinkEmail } = await import("./_core/email");
          const baseUrl = `${ctx.req.protocol}://${ctx.req.headers.host}`;
          const assessmentUrl = `${baseUrl}/assessment/${token}`;
          
          emailSent = await sendAssessmentLinkEmail({
            patientName: patient.name,
            patientEmail: patient.email,
            assessmentUrl,
            expiresAt,
            psychologistName: ctx.user.name || undefined,
          });
        } catch (error) {
          console.error("Failed to send assessment link email:", error);
          // Don't throw error - link is still generated
        }
      }
      
      return { token, expiresAt, expiryDays, emailSent };
    }),
    
    getByToken: publicProcedure.input(getByTokenInput).query(async ({ input, ctx }) => {
      const link = await getAssessmentLinkByToken(input.token);
      
      if (link) {
        // Track access audit information
        const ipAddress = ctx.req.headers['x-forwarded-for'] as string || 
                         ctx.req.headers['x-real-ip'] as string ||
                         (ctx.req.socket as any)?.remoteAddress;
        
        // Update access audit asynchronously
        updateLinkAccessAudit(link.id, ipAddress).catch(err => {
          console.error("Failed to update link access audit:", err);
        });
        
        // Also fetch patient information to return along with link
        const patient = await getPatientById(link.patientId);
        
        return {
          ...link,
          patient,
        };
      }
      
      return link;
    }),
    
    submitResponses: publicProcedure.input(submitResponsesInput).mutation(async ({ input }) => {
      const link = await getAssessmentLinkByToken(input.token);
      if (!link) throw new Error("Invalid assessment link");
      if (link.completedAt) throw new Error("Assessment already completed");
      if (link.expiresAt && new Date() > link.expiresAt) throw new Error("Assessment link expired");
      
      const response = await createAssessmentResponse({
        linkId: link.id,
        patientId: link.patientId,
        responses: JSON.stringify(input.responses),
        completedAt: new Date(),
      });
      
      await markAssessmentLinkCompleted(link.id);
      
      const responseId = (response as any).insertId;
      
      // Disparar análise com IA de forma assíncrona
      processAssessmentAnalysis(link.id, responseId).catch(err => {
        console.error("Erro ao processar análise:", err);
      });
      
      return { success: true, responseId };
    }),
    
    getResults: protectedProcedure.input(getResultsInput).query(async ({ ctx, input }) => {
      const patient = await getPatientById(input.patientId);
      if (!patient || patient.psychologistId !== ctx.user.id) {
        throw new Error("Patient not found or access denied");
      }
      
      return getAssessmentByPatientId(input.patientId);
    }),
  }),
});

// Função assíncrona para processar análise
async function processAssessmentAnalysis(linkId: number, responseId: number) {
  try {
    const { generateClinicalAnalysis, calculateScores } = await import("./assessment-analysis");
    
    const assessmentResponse = await getAssessmentResponseByLinkId(linkId);
    if (!assessmentResponse) return;
    
    const responses = JSON.parse(assessmentResponse.responses) as number[];
    const scores = calculateScores(responses);
    
    const analysis = await generateClinicalAnalysis(
      responses,
      "Paciente",
      undefined,
      assessmentResponse.completedAt
    );
    
    await createAssessment({
      responseId: assessmentResponse.id,
      patientId: assessmentResponse.patientId,
      intellectualScore: Math.round(scores.percentages.intellectual),
      emotionalScore: Math.round(scores.percentages.emotional),
      imaginativeScore: Math.round(scores.percentages.imaginative),
      sensorialScore: Math.round(scores.percentages.sensorial),
      motorScore: Math.round(scores.percentages.motor),
      clinicalAnalysis: analysis.clinicalAnalysis,
      diagnosis: analysis.diagnosis,
      recommendations: analysis.recommendations,
      confidenceLevel: analysis.confidenceLevel,
      giftednessType: analysis.giftednessType,
    });
    
    console.log("Análise completada para resposta:", responseId);
  } catch (error) {
    console.error("Erro ao analisar respostas:", error);
  }
}

export type AppRouter = typeof appRouter;
