const express = require("express");
const router = express.Router();
const {
  getAllMenueItems,
  createMenueItem,
  updateMenueItem,
  deleteMenueItem,
  getByIdMenueItem,
  exportTopSellingItems,
} = require("../controllers/menueItem.controller");
const { protectRoute } = require("../middlewares/auth.mw");

// Note : remove auth middleware in exportTopSellingItems for testing it in web browser
router.get("/export-top-selling", exportTopSellingItems);

router.get("/", protectRoute(["admin", "staff"]), getAllMenueItems);
router.get("/:id", protectRoute(["admin", "staff"]), getByIdMenueItem);
router.post("/", protectRoute(["admin"]), createMenueItem);
router.put("/:id", protectRoute(["admin"]), updateMenueItem);
router.delete("/:id", protectRoute(["admin"]), deleteMenueItem);

module.exports = router;
