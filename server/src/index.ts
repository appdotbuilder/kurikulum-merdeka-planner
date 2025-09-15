import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schema types
import { 
  createLessonPlanInputSchema,
  getLessonPlansInputSchema,
  getLessonPlanInputSchema,
  updateLessonPlanInputSchema,
  subjectEnum,
  gradeEnum,
  semesterEnum
} from './schema';

// Import handlers
import { createLessonPlan } from './handlers/create_lesson_plan';
import { getLessonPlans } from './handlers/get_lesson_plans';
import { getLessonPlan } from './handlers/get_lesson_plan';
import { updateLessonPlan } from './handlers/update_lesson_plan';
import { deleteLessonPlan } from './handlers/delete_lesson_plan';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Get available options for dropdowns
  getSubjects: publicProcedure.query(() => {
    return subjectEnum.options;
  }),

  getGrades: publicProcedure.query(() => {
    return gradeEnum.options;
  }),

  getSemesters: publicProcedure.query(() => {
    return semesterEnum.options;
  }),

  // Lesson plan CRUD operations
  createLessonPlan: publicProcedure
    .input(createLessonPlanInputSchema)
    .mutation(({ input }) => createLessonPlan(input)),

  getLessonPlans: publicProcedure
    .input(getLessonPlansInputSchema.optional())
    .query(({ input }) => getLessonPlans(input)),

  getLessonPlan: publicProcedure
    .input(getLessonPlanInputSchema)
    .query(({ input }) => getLessonPlan(input)),

  updateLessonPlan: publicProcedure
    .input(updateLessonPlanInputSchema)
    .mutation(({ input }) => updateLessonPlan(input)),

  deleteLessonPlan: publicProcedure
    .input(getLessonPlanInputSchema)
    .mutation(({ input }) => deleteLessonPlan(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
  console.log('Available endpoints:');
  console.log('- healthcheck: GET /healthcheck');
  console.log('- getSubjects: GET /getSubjects');
  console.log('- getGrades: GET /getGrades');
  console.log('- getSemesters: GET /getSemesters');
  console.log('- createLessonPlan: POST /createLessonPlan');
  console.log('- getLessonPlans: GET /getLessonPlans');
  console.log('- getLessonPlan: GET /getLessonPlan');
  console.log('- updateLessonPlan: POST /updateLessonPlan');
  console.log('- deleteLessonPlan: POST /deleteLessonPlan');
}

start();