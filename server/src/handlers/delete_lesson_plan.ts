import { db } from '../db';
import { lessonPlansTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetLessonPlanInput } from '../schema';

export const deleteLessonPlan = async (input: GetLessonPlanInput): Promise<boolean> => {
  try {
    // Check if lesson plan exists first
    const existingPlan = await db.select()
      .from(lessonPlansTable)
      .where(eq(lessonPlansTable.id, input.id))
      .execute();

    if (existingPlan.length === 0) {
      return false; // Lesson plan not found
    }

    // Delete the lesson plan
    const result = await db.delete(lessonPlansTable)
      .where(eq(lessonPlansTable.id, input.id))
      .execute();

    // Return true if deletion was successful
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Lesson plan deletion failed:', error);
    throw error;
  }
};