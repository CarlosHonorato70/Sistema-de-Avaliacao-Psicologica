import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de pacientes - armazena informações básicas dos pacientes
 */
export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  psychologistId: int("psychologistId").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  age: int("age"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

/**
 * Tabela de links únicos para questionários
 */
export const assessmentLinks = mysqlTable("assessmentLinks", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull().references(() => patients.id),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AssessmentLink = typeof assessmentLinks.$inferSelect;
export type InsertAssessmentLink = typeof assessmentLinks.$inferInsert;

/**
 * Tabela de respostas do questionário
 * Armazena as 68 respostas do paciente (0, 1, 3 ou 4)
 */
export const assessmentResponses = mysqlTable("assessmentResponses", {
  id: int("id").autoincrement().primaryKey(),
  linkId: int("linkId").notNull().references(() => assessmentLinks.id),
  patientId: int("patientId").notNull().references(() => patients.id),
  // Armazenar todas as 68 respostas como JSON
  responses: text("responses").notNull(), // JSON string com array de respostas
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AssessmentResponse = typeof assessmentResponses.$inferSelect;
export type InsertAssessmentResponse = typeof assessmentResponses.$inferInsert;

/**
 * Tabela de avaliações - armazena o resultado da análise com IA
 */
export const assessments = mysqlTable("assessments", {
  id: int("id").autoincrement().primaryKey(),
  responseId: int("responseId").notNull().references(() => assessmentResponses.id),
  patientId: int("patientId").notNull().references(() => patients.id),
  // Scores por domínio (0-100)
  intellectualScore: int("intellectualScore"),
  emotionalScore: int("emotionalScore"),
  imaginativeScore: int("imaginativeScore"),
  sensorialScore: int("sensorialScore"),
  motorScore: int("motorScore"),
  // Resultado da análise com IA (texto completo)
  clinicalAnalysis: text("clinicalAnalysis"),
  diagnosis: text("diagnosis"),
  recommendations: text("recommendations"),
  confidenceLevel: varchar("confidenceLevel", { length: 20 }), // Alta, Moderada, Baixa
  giftednessType: varchar("giftednessType", { length: 100 }), // Tipo de superdotação detectado
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = typeof assessments.$inferInsert;