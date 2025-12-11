import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de pacientes - armazena informações básicas dos pacientes
 */
export const patients = sqliteTable("patients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  psychologistId: integer("psychologistId").notNull().references(() => users.id),
  name: text("name").notNull(),
  age: integer("age"),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

/**
 * Tabela de links únicos para questionários
 */
export const assessmentLinks = sqliteTable("assessmentLinks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: integer("patientId").notNull().references(() => patients.id),
  token: text("token").notNull().unique(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }),
  completedAt: integer("completedAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  // Audit fields
  lastAccessedAt: integer("lastAccessedAt", { mode: "timestamp" }),
  accessCount: integer("accessCount").default(0).notNull(),
  ipAddress: text("ipAddress"), // Supports IPv6
  expiryDays: integer("expiryDays").default(30).notNull(), // Customizable expiry period
  emailSentAt: integer("emailSentAt", { mode: "timestamp" }), // Track when email was sent
});

export type AssessmentLink = typeof assessmentLinks.$inferSelect;
export type InsertAssessmentLink = typeof assessmentLinks.$inferInsert;

/**
 * Tabela de respostas do questionário
 * Armazena as 68 respostas do paciente (0, 1, 3 ou 4)
 */
export const assessmentResponses = sqliteTable("assessmentResponses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  linkId: integer("linkId").notNull().references(() => assessmentLinks.id),
  patientId: integer("patientId").notNull().references(() => patients.id),
  // Armazenar todas as 68 respostas como JSON
  responses: text("responses").notNull(), // JSON string com array de respostas
  completedAt: integer("completedAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export type AssessmentResponse = typeof assessmentResponses.$inferSelect;
export type InsertAssessmentResponse = typeof assessmentResponses.$inferInsert;

/**
 * Tabela de avaliações - armazena o resultado da análise com IA
 */
export const assessments = sqliteTable("assessments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  responseId: integer("responseId").notNull().references(() => assessmentResponses.id),
  patientId: integer("patientId").notNull().references(() => patients.id),
  // Scores por domínio (0-100)
  intellectualScore: integer("intellectualScore"),
  emotionalScore: integer("emotionalScore"),
  imaginativeScore: integer("imaginativeScore"),
  sensorialScore: integer("sensorialScore"),
  motorScore: integer("motorScore"),
  // Resultado da análise com IA (texto completo)
  clinicalAnalysis: text("clinicalAnalysis"),
  diagnosis: text("diagnosis"),
  recommendations: text("recommendations"),
  confidenceLevel: text("confidenceLevel"), // Alta, Moderada, Baixa
  giftednessType: text("giftednessType"), // Tipo de superdotação detectado
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = typeof assessments.$inferInsert;