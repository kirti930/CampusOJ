import { Router, type Request, type Response } from "express";
import { authenticate, optionalAuthenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  CreateProblemSchema,
  UpdateProblemSchema,
  UploadTestCasesSchema,
  ProblemListQuerySchema,
} from "@campusoj/shared";
import {
  listProblems,
  getProblemDetail,
  createProblem,
  updateProblem,
  createTestCases,
} from "./problem.service.js";

const router = Router();

// ─── GET / — list problems ────────────────────────────────────────────────────
router.get(
  "/",
  optionalAuthenticate,
  validateRequest(ProblemListQuerySchema, "query"),
  async (req: Request, res: Response) => {
    const result = await listProblems(req.query as never);
    res.json({ success: true, ...result });
  }
);

// ─── POST / — create problem (Faculty+) ───────────────────────────────────────
router.post(
  "/",
  authenticate,
  requireRole(["FACULTY", "ADMIN", "SUPER_ADMIN"]),
  validateRequest(CreateProblemSchema),
  async (req: Request, res: Response) => {
    const problem = await createProblem(req.body, req.user!.id);
    res.status(201).json({ success: true, data: problem });
  }
);

// ─── GET /:id — problem detail ────────────────────────────────────────────────
router.get("/:id", optionalAuthenticate, async (req: Request, res: Response) => {
  const detail = await getProblemDetail(req.params.id, req.user?.role ?? null);
  res.json({ success: true, data: detail });
});

// ─── PUT /:id — update problem (Faculty+, owner or admin) ─────────────────────
router.put(
  "/:id",
  authenticate,
  requireRole(["FACULTY", "ADMIN", "SUPER_ADMIN"]),
  validateRequest(UpdateProblemSchema),
  async (req: Request, res: Response) => {
    const updated = await updateProblem(
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.role
    );
    res.json({ success: true, data: updated });
  }
);

// ─── POST /:id/testcases — bulk upload test cases (Faculty+) ──────────────────
router.post(
  "/:id/testcases",
  authenticate,
  requireRole(["FACULTY", "ADMIN", "SUPER_ADMIN"]),
  validateRequest(UploadTestCasesSchema),
  async (req: Request, res: Response) => {
    const count = await createTestCases(
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.role
    );
    res.status(201).json({
      success: true,
      message: `${count} test case(s) created`,
      data: { count },
    });
  }
);

export default router;
