import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { lessonPlansTable } from '../db/schema';
import { type CreateLessonPlanInput } from '../schema';
import { createLessonPlan } from '../handlers/create_lesson_plan';
import { eq } from 'drizzle-orm';

// Test inputs for different grade levels
const elementaryInput: CreateLessonPlanInput = {
  subject: 'Matematika',
  material: 'Penjumlahan dan Pengurangan',
  grade: '3 SD',
  semester: '1'
};

const middleSchoolInput: CreateLessonPlanInput = {
  subject: 'IPA',
  material: 'Sistem Tata Surya',
  grade: '7 SMP',
  semester: '2'
};

const highSchoolInput: CreateLessonPlanInput = {
  subject: 'Fisika',
  material: 'Hukum Newton dan Penerapannya',
  grade: '11 SMA',
  semester: '1'
};

const vocationalInput: CreateLessonPlanInput = {
  subject: 'Informatika',
  material: 'Pemrograman Dasar Python',
  grade: '10 SMK',
  semester: '2'
};

describe('createLessonPlan', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create lesson plan for elementary level', async () => {
    const result = await createLessonPlan(elementaryInput);

    // Validate basic fields
    expect(result.subject).toEqual('Matematika');
    expect(result.material).toEqual('Penjumlahan dan Pengurangan');
    expect(result.grade).toEqual('3 SD');
    expect(result.semester).toEqual('1');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Validate generated content structure
    expect(result.learning_objectives).toHaveLength(3);
    expect(result.teaching_methods.length).toBeGreaterThan(0);
    expect(result.materials_tools.length).toBeGreaterThan(0);
    expect(result.learning_activities).toHaveLength(5);
    expect(result.assessments).toHaveLength(4);
    expect(result.references).toHaveLength(4);

    // Validate learning objectives structure
    result.learning_objectives.forEach(obj => {
      expect(obj.id).toBeDefined();
      expect(obj.description).toContain('Peserta didik');
      expect(obj.indicator).toBeDefined();
    });

    // Validate teaching methods for elementary (should include play-based learning)
    const hasPlayMethod = result.teaching_methods.some(method => 
      method.name.includes('Bermain') || method.description.includes('permainan')
    );
    expect(hasPlayMethod).toBe(true);

    // Validate total duration is calculated
    expect(result.total_duration_minutes).toBeGreaterThan(0);
    expect(typeof result.total_duration_minutes).toBe('number');
  });

  it('should create lesson plan for middle school level', async () => {
    const result = await createLessonPlan(middleSchoolInput);

    expect(result.subject).toEqual('IPA');
    expect(result.material).toEqual('Sistem Tata Surya');
    expect(result.grade).toEqual('7 SMP');
    expect(result.semester).toEqual('2');

    // Validate middle school specific content
    const hasGroupDiscussion = result.teaching_methods.some(method => 
      method.name.includes('Diskusi Kelompok')
    );
    expect(hasGroupDiscussion).toBe(true);

    // Validate materials include technology tools for higher grades
    const hasTechTools = result.materials_tools.some(material => 
      material.name.includes('Laptop') || material.name.includes('Proyektor')
    );
    expect(hasTechTools).toBe(true);

    // Validate assessment types
    const hasFormativeAssessment = result.assessments.some(assessment => assessment.type === 'formatif');
    const hasSummativeAssessment = result.assessments.some(assessment => assessment.type === 'sumatif');
    expect(hasFormativeAssessment).toBe(true);
    expect(hasSummativeAssessment).toBe(true);
  });

  it('should create lesson plan for high school level', async () => {
    const result = await createLessonPlan(highSchoolInput);

    expect(result.subject).toEqual('Fisika');
    expect(result.material).toEqual('Hukum Newton dan Penerapannya');
    expect(result.grade).toEqual('11 SMA');

    // Validate complex learning objectives for higher grade
    result.learning_objectives.forEach(obj => {
      expect(obj.description.length).toBeGreaterThan(50); // More detailed objectives
      expect(obj.indicator.length).toBeGreaterThan(30); // More specific indicators
    });

    // Validate references include multiple types
    const referenceTypes = result.references.map(ref => ref.type);
    expect(referenceTypes).toContain('buku');
    expect(referenceTypes).toContain('website');
    expect(referenceTypes).toContain('video');
    expect(referenceTypes).toContain('artikel');
  });

  it('should save lesson plan to database', async () => {
    const result = await createLessonPlan(vocationalInput);

    // Query database to verify storage
    const lessonPlans = await db.select()
      .from(lessonPlansTable)
      .where(eq(lessonPlansTable.id, result.id))
      .execute();

    expect(lessonPlans).toHaveLength(1);
    const storedPlan = lessonPlans[0];

    expect(storedPlan.subject).toEqual('Informatika');
    expect(storedPlan.material).toEqual('Pemrograman Dasar Python');
    expect(storedPlan.grade).toEqual('10 SMK');
    expect(storedPlan.semester).toEqual('2');
    expect(storedPlan.total_duration_minutes).toBeGreaterThan(0);
    expect(storedPlan.created_at).toBeInstanceOf(Date);

    // Validate JSONB fields are already parsed objects
    const learningObjectives = storedPlan.learning_objectives as any;
    const teachingMethods = storedPlan.teaching_methods as any;
    const materialsTools = storedPlan.materials_tools as any;
    const learningActivities = storedPlan.learning_activities as any;
    const assessments = storedPlan.assessments as any;
    const references = storedPlan.references as any;

    expect(Array.isArray(learningObjectives)).toBe(true);
    expect(Array.isArray(teachingMethods)).toBe(true);
    expect(Array.isArray(materialsTools)).toBe(true);
    expect(Array.isArray(learningActivities)).toBe(true);
    expect(Array.isArray(assessments)).toBe(true);
    expect(Array.isArray(references)).toBe(true);
  });

  it('should generate appropriate content based on subject', async () => {
    const mathInput: CreateLessonPlanInput = {
      subject: 'Matematika',
      material: 'Aljabar Linear',
      grade: '10 SMA',
      semester: '1'
    };

    const result = await createLessonPlan(mathInput);

    // Validate subject-specific content
    const hasSubjectReference = result.references.some(ref => 
      ref.title.includes('Matematika') || ref.title.includes(mathInput.material)
    );
    expect(hasSubjectReference).toBe(true);

    // Validate material appears in learning objectives
    const hasMaterialInObjectives = result.learning_objectives.some(obj => 
      obj.description.includes(mathInput.material) || obj.indicator.includes(mathInput.material)
    );
    expect(hasMaterialInObjectives).toBe(true);
  });

  it('should calculate total duration correctly', async () => {
    const result = await createLessonPlan(elementaryInput);

    // Calculate expected duration from activities
    const activitiesDuration = result.learning_activities.reduce(
      (total, activity) => total + activity.duration_minutes, 
      0
    );

    // Calculate expected duration from methods
    const methodsDuration = result.teaching_methods.reduce(
      (total, method) => total + method.duration_minutes, 
      0
    );

    // Total duration should be at least the maximum of the two
    const expectedMinDuration = Math.max(activitiesDuration, methodsDuration);
    expect(result.total_duration_minutes).toBeGreaterThanOrEqual(expectedMinDuration);
  });

  it('should handle different grade formats correctly', async () => {
    const inputs = [
      { ...elementaryInput, grade: '1 SD' as const },
      { ...middleSchoolInput, grade: '9 SMP' as const },
      { ...highSchoolInput, grade: '12 SMA' as const },
      { ...vocationalInput, grade: '12 SMK' as const }
    ];

    for (const input of inputs) {
      const result = await createLessonPlan(input);
      
      expect(result.grade).toEqual(input.grade);
      expect(result.learning_objectives.length).toBeGreaterThan(0);
      expect(result.teaching_methods.length).toBeGreaterThan(0);
      expect(result.learning_activities.length).toEqual(5); // Standard 5 activities
      
      // Validate grade-appropriate content
      if (input.grade.includes('SD')) {
        const hasElementaryMethods = result.teaching_methods.some(method => 
          method.description.includes('permainan') || method.description.includes('menyenangkan')
        );
        expect(hasElementaryMethods).toBe(true);
      } else {
        const hasAdvancedMethods = result.teaching_methods.some(method => 
          method.name.includes('Diskusi') || method.description.includes('kolaboratif')
        );
        expect(hasAdvancedMethods).toBe(true);
      }
    }
  });

  it('should generate unique IDs for objectives and lesson plan', async () => {
    const result1 = await createLessonPlan(elementaryInput);
    const result2 = await createLessonPlan(middleSchoolInput);

    // Lesson plan IDs should be unique
    expect(result1.id).not.toEqual(result2.id);

    // Learning objective IDs should be unique
    const allObjectiveIds = [
      ...result1.learning_objectives.map(obj => obj.id),
      ...result2.learning_objectives.map(obj => obj.id)
    ];
    const uniqueIds = new Set(allObjectiveIds);
    expect(uniqueIds.size).toEqual(allObjectiveIds.length);
  });

  it('should include comprehensive assessment methods', async () => {
    const result = await createLessonPlan(highSchoolInput);

    // Should have both formative and summative assessments
    const formativeAssessments = result.assessments.filter(assessment => assessment.type === 'formatif');
    const summativeAssessments = result.assessments.filter(assessment => assessment.type === 'sumatif');

    expect(formativeAssessments.length).toBeGreaterThan(0);
    expect(summativeAssessments.length).toBeGreaterThan(0);

    // Each assessment should have required fields
    result.assessments.forEach(assessment => {
      expect(assessment.method).toBeDefined();
      expect(assessment.description.length).toBeGreaterThan(10);
      expect(assessment.criteria.length).toBeGreaterThan(10);
    });

    // Should include various assessment methods
    const methods = result.assessments.map(assessment => assessment.method);
    expect(methods.length).toBeGreaterThan(2); // Multiple assessment methods
  });
});