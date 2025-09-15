import { db } from '../db';
import { lessonPlansTable } from '../db/schema';
import { type UpdateLessonPlanInput, type LessonPlan } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateLessonPlan(input: UpdateLessonPlanInput): Promise<LessonPlan | null> {
  try {
    // Check if lesson plan exists first
    const existingPlan = await db.select()
      .from(lessonPlansTable)
      .where(eq(lessonPlansTable.id, input.id))
      .execute();

    if (existingPlan.length === 0) {
      return null;
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof lessonPlansTable.$inferInsert> = {
      updated_at: new Date() // Always update timestamp
    };

    if (input.subject !== undefined) {
      updateData.subject = input.subject;
    }

    if (input.material !== undefined) {
      updateData.material = input.material;
    }

    if (input.grade !== undefined) {
      updateData.grade = input.grade;
    }

    if (input.semester !== undefined) {
      updateData.semester = input.semester;
    }

    if (input.learning_objectives !== undefined) {
      updateData.learning_objectives = input.learning_objectives;
    }

    if (input.teaching_methods !== undefined) {
      updateData.teaching_methods = input.teaching_methods;
    }

    if (input.materials_tools !== undefined) {
      updateData.materials_tools = input.materials_tools;
    }

    if (input.learning_activities !== undefined) {
      updateData.learning_activities = input.learning_activities;
    }

    if (input.assessments !== undefined) {
      updateData.assessments = input.assessments;
    }

    if (input.references !== undefined) {
      updateData.references = input.references;
    }

    if (input.total_duration_minutes !== undefined) {
      updateData.total_duration_minutes = input.total_duration_minutes;
    }

    // Perform the update
    const result = await db.update(lessonPlansTable)
      .set(updateData)
      .where(eq(lessonPlansTable.id, input.id))
      .returning()
      .execute();

    // Return the updated lesson plan with proper typing
    const updatedPlan = result[0];
    if (!updatedPlan) return null;

    // Cast JSONB fields to proper types
    return {
      ...updatedPlan,
      learning_objectives: updatedPlan.learning_objectives as LessonPlan['learning_objectives'],
      teaching_methods: updatedPlan.teaching_methods as LessonPlan['teaching_methods'],
      materials_tools: updatedPlan.materials_tools as LessonPlan['materials_tools'],
      learning_activities: updatedPlan.learning_activities as LessonPlan['learning_activities'],
      assessments: updatedPlan.assessments as LessonPlan['assessments'],
      references: updatedPlan.references as LessonPlan['references']
    };
  } catch (error) {
    console.error('Lesson plan update failed:', error);
    throw error;
  }
}