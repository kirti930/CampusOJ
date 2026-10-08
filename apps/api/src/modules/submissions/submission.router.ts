import { Router, type Request, type Response } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  CreateSubmissionSchema,
  RunCodeSchema,
  SubmissionListQuerySchema,
} from "@campusoj/shared";
import {
  runCode,
  submitSolution,
  getSubmissionById,
  listSubmissions,
} from "./submission.service.js";

const router = Router();

// ─── POST /run — Custom / Sample test run (does not affect contest leaderboard) ─
router.post(
  "/run",
  authenticate,
  validateRequest(RunCodeSchema),
  async (req: Request, res: Response) => {
    const result = await runCode(req.body);
    res.json({
      success: true,
      data: result,
      stdout: result.stdout,
      stderr: result.stderr,
      compile_output: result.compile_output,
      status: result.status,
    });
  }
);

// ─── POST / or /submit — Official submission (evaluated against all test cases) ─────
router.post(
  ["/", "/submit"],
  authenticate,
  validateRequest(CreateSubmissionSchema),
  async (req: Request, res: Response) => {
    const submission = await submitSolution(
      req.body,
      req.user!.id,
      req.user!.role
    );
    res.status(201).json({
      success: true,
      message: "Submission queued for evaluation",
      data: submission,
    });
  }
);

// ─── GET /:id — Get submission status and results ─────────────────────────────
router.get("/:id", authenticate, async (req: Request, res: Response) => {
  const submission = await getSubmissionById(
    req.params.id,
    req.user!.id,
    req.user!.role
  );
  res.json({ success: true, data: submission });
});

// ─── GET / — List submissions with filters ────────────────────────────────────
router.get(
  "/",
  authenticate,
  validateRequest(SubmissionListQuerySchema, "query"),
  async (req: Request, res: Response) => {
    const result = await listSubmissions(
      req.query as never,
      req.user!.id,
      req.user!.role
    );
    res.json({ success: true, ...result });
  }
);

export default router;
