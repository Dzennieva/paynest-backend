// HTTP route definitions for the transfer service
// This layer handles HTTP concerns only — validation of HTTP shape,
// calling business logic, and formatting responses

const express = require("express");
const { initiateTransfer, getTransaction } = require("./transfer");

const router = express.Router();

// Health check — used by Kubernetes liveness and readiness probes
// ArgoCD and the ALB also ping this to confirm the service is up
router.get("/health", (req, res) => {
	res.status(200).json({
		status: "healthy",
		service: "transfer-service",
		timestamp: new Date().toISOString(),
	});
});

// POST /api/v1/transfers — initiate a new transfer
router.post("/api/v1/transfers", async (req, res) => {
	const { senderId, recipientAccount, amount, narration } = req.body;

	// Basic HTTP-level check — is the body even there?
	if (!req.body || Object.keys(req.body).length === 0) {
		return res.status(400).json({
			success: false,
			message: "Request body is required",
		});
	}

	try {
		const result = await initiateTransfer({
			senderId,
			recipientAccount,
			amount,
			narration,
		});

		if (!result.success) {
			return res.status(400).json({
				success: false,
				message: "Transfer failed",
				errors: result.errors,
				transactionRef: result.transactionRef || null,
			});
		}

		return res.status(201).json({
			success: true,
			message: result.message,
			data: {
				transactionRef: result.transactionRef,
				amount: result.amount,
				status: result.status,
			},
		});
	} catch (error) {
		console.error("Unhandled error in transfer route:", error);
		return res.status(500).json({
			success: false,
			message: "An unexpected error occurred. Please try again.",
		});
	}
});

// GET /api/v1/transfers/:ref — look up a transaction by reference
router.get("/api/v1/transfers/:ref", async (req, res) => {
	const { ref } = req.params;

	try {
		const transaction = await getTransaction(ref);

		if (!transaction) {
			return res.status(404).json({
				success: false,
				message: `Transaction ${ref} not found`,
			});
		}

		return res.status(200).json({
			success: true,
			data: transaction,
		});
	} catch (error) {
		console.error("Error fetching transaction:", error);
		return res.status(500).json({
			success: false,
			message: "An unexpected error occurred.",
		});
	}
});

module.exports = router;
