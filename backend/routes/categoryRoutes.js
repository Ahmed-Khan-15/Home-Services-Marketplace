const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

const { getCategory , 
        createCategory,
        getCategoryById,
        updateCategory,
        deleteCategory
} = require("../controllers/categoryControllers");

router.get("/",authMiddleware, getCategory);
router.get("/:id",authMiddleware, getCategoryById);

router.post("/",authMiddleware, createCategory);
router.put("/:id",authMiddleware, updateCategory);

router.delete("/:id",authMiddleware, deleteCategory);

module.exports = router;

