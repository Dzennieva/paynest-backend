// Loads environment variables once and exports them
// If a required variable is missing, we crash immediately with a clear message

require("dotenv").config();

function requireEnv(name) {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

module.exports = {
	// Server
	PORT: process.env.PORT || 3001,
	NODE_ENV: process.env.NODE_ENV || "development",
	SERVICE_NAME: "transfer-service",

	// NIBSS — the Nigerian interbank settlement system
	// Locally this points to WireMock
	NIBSS_BASE_URL: requireEnv("NIBSS_BASE_URL"),
	NIBSS_API_KEY: requireEnv("NIBSS_API_KEY"),

	// Paystack — card processing
	PAYSTACK_BASE_URL: requireEnv("PAYSTACK_BASE_URL"),
	PAYSTACK_SECRET_KEY: requireEnv("PAYSTACK_SECRET_KEY"),

	// Notifications service — internal service call
	NOTIFICATIONS_SERVICE_URL: requireEnv("NOTIFICATIONS_SERVICE_URL"),

	// Database — we'll wire this up properly in Project 3
	// For now it's just stored in memory
	DATABASE_URL: process.env.DATABASE_URL || null,
};
