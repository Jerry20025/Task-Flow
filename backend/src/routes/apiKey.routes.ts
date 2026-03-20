import { Router } from "express";
import { generateApiKey, listApiKeys, revokeApiKey } from "../controllers/apiKey.controller";
import { authenticate } from "../middleware/auth";
import { orgAccess } from "../middleware/orgAccess";

const router = Router({ mergeParams: true });
router.use(authenticate);

router.post("/", orgAccess(["OWNER", "ADMIN"]), generateApiKey);
router.get("/", orgAccess(["OWNER", "ADMIN"]), listApiKeys);
router.delete("/:keyId", orgAccess(["OWNER", "ADMIN"]), revokeApiKey);

export default router;
