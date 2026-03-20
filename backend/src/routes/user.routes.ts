import { Router } from "express";
import { getMe, updateMe, changePassword, deleteMe, getMyOrgs, getMyTickets } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateProfileSchema, changePasswordSchema } from "../validators/user.validator";

const router = Router();
router.use(authenticate);

router.get("/me", getMe);
router.patch("/me", validate(updateProfileSchema), updateMe);
router.patch("/me/password", validate(changePasswordSchema), changePassword);
router.delete("/me", deleteMe);
router.get("/me/orgs", getMyOrgs);
router.get("/me/tickets", getMyTickets);

export default router;
