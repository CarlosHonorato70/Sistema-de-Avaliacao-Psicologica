import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, patients, assessmentLinks, assessmentResponses, assessments, InsertPatient, InsertAssessmentLink, InsertAssessmentResponse, InsertAssessment, Patient, AssessmentLink, AssessmentResponse, Assessment } from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from 'nanoid';

let _db: ReturnType<typeof drizzle> | null = null;

// Re-export types for use in routers
export type { Patient, AssessmentLink, AssessmentResponse, Assessment } from "../drizzle/schema";

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// Helper function to generate unique tokens with retry logic
export async function generateToken(): Promise<string> {
  const maxRetries = 5;
  
  for (let i = 0; i < maxRetries; i++) {
    // Generate a URL-safe token using nanoid (21 characters by default)
    const token = nanoid(32); // Longer token for better uniqueness
    
    // Check if token already exists
    const db = await getDb();
    if (!db) {
      // If no DB connection, return token without validation
      return token;
    }
    
    const existing = await db
      .select()
      .from(assessmentLinks)
      .where(eq(assessmentLinks.token, token))
      .limit(1);
    
    if (existing.length === 0) {
      return token;
    }
    
    // Token collision - retry
    console.warn(`[Token Generation] Collision detected, retrying... (${i + 1}/${maxRetries})`);
  }
  
  throw new Error("Failed to generate unique token after multiple attempts");
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Pacientes - Gerenciamento de pacientes
 */
export async function createPatient(data: InsertPatient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(patients).values(data);
  return result;
}

export async function getPatientsByPsychologist(psychologistId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(patients).where(eq(patients.psychologistId, psychologistId));
}

export async function getPatientById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return result[0];
}

/**
 * Assessment Links - Gerenciamento de links únicos para questionários
 */
export async function createAssessmentLink(data: InsertAssessmentLink) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(assessmentLinks).values(data);
}

export async function getAssessmentLinkByToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(assessmentLinks).where(eq(assessmentLinks.token, token)).limit(1);
  return result[0];
}

/**
 * Update access audit information for an assessment link
 */
export async function updateLinkAccessAudit(linkId: number, ipAddress?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get current access count
  const link = await db.select().from(assessmentLinks).where(eq(assessmentLinks.id, linkId)).limit(1);
  if (!link[0]) return;
  
  const currentCount = link[0].accessCount || 0;
  
  return db.update(assessmentLinks)
    .set({
      lastAccessedAt: new Date(),
      accessCount: currentCount + 1,
      ...(ipAddress && { ipAddress }),
    })
    .where(eq(assessmentLinks.id, linkId));
}

export async function getAssessmentLinksByPatient(patientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(assessmentLinks).where(eq(assessmentLinks.patientId, patientId));
}

export async function markAssessmentLinkCompleted(linkId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(assessmentLinks).set({ completedAt: new Date() }).where(eq(assessmentLinks.id, linkId));
}

/**
 * Assessment Responses - Armazenamento de respostas do questionário
 */
export async function createAssessmentResponse(data: InsertAssessmentResponse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(assessmentResponses).values(data);
}

export async function getAssessmentResponseByLinkId(linkId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(assessmentResponses).where(eq(assessmentResponses.linkId, linkId)).limit(1);
  return result[0];
}

/**
 * Assessments - Armazenamento de avaliações com IA
 */
export async function createAssessment(data: InsertAssessment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(assessments).values(data);
}

export async function getAssessmentByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(assessments).where(eq(assessments.patientId, patientId));
}

export async function getAssessmentByResponseId(responseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(assessments).where(eq(assessments.responseId, responseId)).limit(1);
  return result[0];
}
