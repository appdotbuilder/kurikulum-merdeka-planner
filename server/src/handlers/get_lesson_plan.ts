import { db } from '../db';
import { lessonPlansTable } from '../db/schema';
import { type GetLessonPlanInput, type LessonPlan } from '../schema';
import { eq } from 'drizzle-orm';

export async function getLessonPlan(input: GetLessonPlanInput): Promise<LessonPlan | null> {
  try {
    // Query the database for lesson plan with the given ID
    const results = await db.select()
      .from(lessonPlansTable)
      .where(eq(lessonPlansTable.id, input.id))
      .execute();

    // Return the lesson plan if found, null otherwise
    if (results.length === 0) {
      return null;
    }

    const lessonPlan = results[0];
    
    // Return the lesson plan with proper type conversion
    // JSONB fields are already parsed as objects by drizzle
    return {
      id: lessonPlan.id,
      subject: lessonPlan.subject,
      material: lessonPlan.material,
      grade: lessonPlan.grade,
      semester: lessonPlan.semester,
      learning_objectives: lessonPlan.learning_objectives as any[],
      teaching_methods: lessonPlan.teaching_methods as any[],
      materials_tools: lessonPlan.materials_tools as any[],
      learning_activities: lessonPlan.learning_activities as any[],
      assessments: lessonPlan.assessments as any[],
      references: lessonPlan.references as any[],
      total_duration_minutes: lessonPlan.total_duration_minutes,
      created_at: lessonPlan.created_at,
      updated_at: lessonPlan.updated_at
    };
  } catch (error) {
    console.error('Failed to fetch lesson plan:', error);
    throw error;
  }
}