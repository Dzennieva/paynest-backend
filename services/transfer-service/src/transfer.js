// Core business logic for processing PayNest P2P transfers
// This layer knows nothing about HTTP — it just receives data and returns results

const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const config = require("./config");

// In-memory store for now — Project 3 replaces this with PostgreSQL
const transactions = [];

async function initiateTransfer({
	senderId,
	recipientAccount,
	amount,
	narration,
}) {
	// Step 1 — Validate the request before touching any external API
	const errors = validateTransferRequest({
		senderId,
		recipientAccount,
		amount,
	});
	if (errors.length > 0) {
		return { success: false, errors };
	}

	// Step 2 — Generate a unique transaction reference
	// This reference follows the transaction through NIBSS, our DB, and receipts
	const transactionRef = `PNT-${uuidv4().split("-")[0].toUpperCase()}`;

	// Step 3 — Call NIBSS to process the interbank transfer
	// Locally this hits WireMock — in production it hits the real NIBSS NIP endpoint
	let nibssResponse;
	try {
		nibssResponse = await axios.post(
			`${config.NIBSS_BASE_URL}/nip/transfer`,
			{
				reference: transactionRef,
				amount: amount,
				senderAccount: senderId,
				beneficiaryAccount: recipientAccount,
				narration: narration || "PayNest Transfer",
			},
			{
				headers: {
					Authorization: `Bearer ${config.NIBSS_API_KEY}`,
					"Content-Type": "application/json",
				},
				timeout: 30000, // 30 second timeout — NIBSS can be slow
			},
		);
	} catch (error) {
		// NIBSS call failed — could be a network issue or NIBSS is down
		// We record the failed attempt and return a clear error
		const failedTransaction = {
			id: transactionRef,
			senderId,
			recipientAccount,
			amount,
			status: "failed",
			failureReason: error.message,
			createdAt: new Date().toISOString(),
		};
		transactions.push(failedTransaction);

		return {
			success: false,
			errors: ["Transfer processing failed. Please try again."],
			transactionRef,
		};
	}

	// Step 4 — Record the successful transaction
	const transaction = {
		id: transactionRef,
		senderId,
		recipientAccount,
		amount,
		status: "successful",
		nibssSessionId: nibssResponse.data.sessionId,
		createdAt: new Date().toISOString(),
	};
	transactions.push(transaction);

	// Step 5 — Notify the sender asynchronously
	// We don't await this — if notifications fail, the transfer still succeeded
	// A failed notification is a separate problem, not a transaction failure
	notifySender(senderId, transaction).catch((err) => {
		console.error(`Notification failed for ${transactionRef}:`, err.message);
	});

	return {
		success: true,
		transactionRef,
		amount,
		status: "successful",
		message: `Transfer of ₦${amount} to ${recipientAccount} was successful.`,
	};
}

async function getTransaction(transactionRef) {
	const transaction = transactions.find((t) => t.id === transactionRef);
	if (!transaction) {
		return null;
	}
	return transaction;
}

async function notifySender(userId, transaction) {
	await axios.post(
		`${config.NOTIFICATIONS_SERVICE_URL}/api/v1/notify`,
		{
			userId,
			type: "transfer_successful",
			message: `Your transfer of ₦${transaction.amount} (Ref: ${transaction.id}) was successful.`,
		},
		{ timeout: 5000 },
	);
}

function validateTransferRequest({ senderId, recipientAccount, amount }) {
	const errors = [];

	if (!senderId) {
		errors.push("senderId is required");
	}

	if (!recipientAccount) {
		errors.push("recipientAccount is required");
	}

	if (!amount || typeof amount !== "number") {
		errors.push("amount must be a number");
	}

	// CBN minimum transfer amount — ₦1
	if (amount < 1) {
		errors.push("amount must be at least ₦1");
	}

	// PayNest maximum single transfer — ₦5,000,000
	if (amount > 5000000) {
		errors.push("amount exceeds maximum single transfer limit of ₦5,000,000");
	}

	return errors;
}

module.exports = { initiateTransfer, getTransaction };
