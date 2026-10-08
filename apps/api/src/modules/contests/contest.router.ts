import { Router, type Request, type Response } from "express";
import { authenticate, optionalAuthenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  CreateContestSchema,
  UpdateContestSchema,
  AttachProblemSchema,
  ContestListQuerySchema,
} from "@campusoj/shared";
import {
  listContests,
  getContestDetail,
  createContest,
  updateContest,
  registerForContest,
  attachProblemToContest,
} from "./contest.service.js";
import leaderboardRouter from "../leaderboard/leaderboard.router.js";

const router = Router();

router.use("/", leaderboardRouter);

// ─── GET / — list contests ────────────────────────────────────────────────────
router.get(
  "/",
  optionalAuthenticate,
  validateRequest(ContestListQuerySchema, "query"),
  async (req: Request, res: Response) => {
    const result = await listContests(req.query as never);
    res.json({ success: true, ...result });
  }
);

// ─── POST / — create contest (Faculty+) ───────────────────────────────────────
router.post(
  "/",
  authenticate,
  requireRole(["FACULTY", "ADMIN", "SUPER_ADMIN"]),
  validateRequest(CreateContestSchema),
  async (req: Request, res: Response) => {
    const contest = await createContest(req.body, req.user!.id);
    res.status(201).json({ success: true, data: contest });
  }
);

// ─── GET /:id — contest detail ────────────────────────────────────────────────
router.get("/:id", optionalAuthenticate, async (req: Request, res: Response) => {
  const detail = await getContestDetail(
    req.params.id,
    req.user?.role ?? null,
    req.user?.id ?? null
  );
  res.json({ success: true, data: detail });
});

// ─── PUT /:id — update contest (Faculty+, owner or admin) ─────────────────────
router.put(
  "/:id",
  authenticate,
  requireRole(["FACULTY", "ADMIN", "SUPER_ADMIN"]),
  validateRequest(UpdateContestSchema),
  async (req: Request, res: Response) => {
    const updated = await updateContest(
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.role
    );
    res.json({ success: true, data: updated });
  }
);

// ─── POST /:id/register — student self-registration ───────────────────────────
router.post(
  "/:id/register",
  authenticate,
  requireRole(["STUDENT", "FACULTY", "ADMIN", "SUPER_ADMIN"]),
  async (req: Request, res: Response) => {
    const participant = await registerForContest(req.params.id, req.user!.id);
    res.status(201).json({
      success: true,
      data: participant,
      message: "Registered successfully",
    });
  }
);

// ─── POST /:id/problems — attach problem to contest (Faculty+) ────────────────
router.post(
  "/:id/problems",
  authenticate,
  requireRole(["FACULTY", "ADMIN", "SUPER_ADMIN"]),
  validateRequest(AttachProblemSchema),
  async (req: Request, res: Response) => {
    const cp = await attachProblemToContest(
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.role
    );
    res.status(201).json({ success: true, data: cp });
  }
);

export default router;
