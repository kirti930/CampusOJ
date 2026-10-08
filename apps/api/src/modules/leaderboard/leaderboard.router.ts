import { Router, type Request, type Response } from "express";
import { optionalAuthenticate, authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/requireRole.js";
import {
  getLeaderboard,
  recalculateAndPersistLeaderboard,
} from "./leaderboard.service.js";

const router = Router({ mergeParams: true });

// ─── GET /api/v1/contests/:id/leaderboard ─────────────────────────────────────
router.get("/:id/leaderboard", optionalAuthenticate, async (req: Request, res: Response) => {
  const result = await getLeaderboard(
    req.params.id,
    req.user?.role ?? null,
    req.user?.id ?? null
  );
  res.json({ success: true, data: result });
});

// ─── POST /api/v1/contests/:id/leaderboard/recalculate (Faculty/Admin) ────────
router.post(
  "/:id/leaderboard/recalculate",
  authenticate,
  requireRole(["FACULTY", "ADMIN", "SUPER_ADMIN"]),
  async (req: Request, res: Response) => {
    const result = await recalculateAndPersistLeaderboard(req.params.id);
    res.json({
      success: true,
      message: "Leaderboard recalculated and broadcasted successfully",
      data: result,
    });
  }
);

export default router;
