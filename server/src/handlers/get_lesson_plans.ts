import { db } from '../db';
import { lessonPlansTable } from '../db/schema';
import { type GetLessonPlansInput, type LessonPlan } from '../schema';
import { eq, and, desc, type SQL } from 'drizzle-orm';

export const getLessonPlans = async (input?: GetLessonPlansInput): Promise<LessonPlan[]> => {
  try {
    // Apply defaults for undefined input
    const filters = input || { limit: 20, offset: 0 };
    
    // Start with base query
    let baseQuery = db.select().from(lessonPlansTable);

    // Collect filter conditions
    const conditions: SQL<unknown>[] = [];

    if (filters.subject) {
      conditions.push(eq(lessonPlansTable.subject, filters.subject));
    }

    if (filters.grade) {
      conditions.push(eq(lessonPlansTable.grade, filters.grade));
    }

    if (filters.semester) {
      conditions.push(eq(lessonPlansTable.semester, filters.semester));
    }

    // Apply where conditions if any exist
    let query = conditions.length > 0 
      ? baseQuery.where(conditions.length === 1 ? conditions[0] : and(...conditions))
      : baseQuery;

    // Apply ordering and pagination
    const results = await query
      .orderBy(desc(lessonPlansTable.created_at))
      .limit(filters.limit)
      .offset(filters.offset)
      .execute();

    // Transform results to match LessonPlan schema
    return results.map(result => ({
      id: result.id,
      subject: result.subject,
      material: result.material,
      grade: result.grade,
      semester: result.semester,
      learning_objectives: result.learning_objectives as any,
      teaching_methods: result.teaching_methods as any,
      materials_tools: result.materials_tools as any,
      learning_activities: result.learning_activities as any,
      assessments: result.assessments as any,
      references: result.references as any,
      total_duration_minutes: result.total_duration_minutes,
      created_at: result.created_at,
      updated_at: result.updated_at
    }));
  } catch (error) {
    console.error('Failed to fetch lesson plans:', error);
    throw error;
  }
};