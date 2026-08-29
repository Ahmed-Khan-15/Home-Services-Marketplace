const authMiddleware = require("../middleware/authMiddleware");
const validateTransaction = require("../middleware/validation/transactionValidation");
const express = require("express");

const router = express.Router();

const { getTransactions ,
        createTransaction,
        getTransactionById,
        updateTransaction,
        deleteTransactions,
        deleteTransaction
} = require("../controllers/transactionControllers");

router.get("/", authMiddleware ,getTransactions);
router.get("/:id", authMiddleware ,getTransactionById);

router.post("/", authMiddleware,validateTransaction ,createTransaction);
router.put("/:id", authMiddleware,validateTransaction ,updateTransaction);

router.delete("/", authMiddleware ,deleteTransactions);
router.delete("/:id", authMiddleware ,deleteTransaction);

module.exports = router;