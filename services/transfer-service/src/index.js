// Entry point for the transfer-service
// Starts the HTTP server and wires middleware and routes together
// transfer-service — PayNest P2P payment engine
// transfer-service — PayNest P2P payment engine

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const config = require("./config");
const routes = require("./routes");

const app = express();

// Security headers — helmet sets a collection of HTTP headers
// that protect against common web vulnerabilities
// e.g. X-Frame-Options, X-XSS-Protection, etc.
app.use(helmet());

// Request logging — every incoming request is logged to stdout
// In production these logs are picked up by the Datadog agent
app.use(morgan("combined"));

// Parse incoming JSON request bodies
app.use(express.json());

// Mount all routes
app.use("/", routes);

// 404 handler — catches any request to an endpoint that doesn't exist
app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: `Endpoint ${req.method} ${req.path} does not exist`,
	});
});

// Global error handler — catches any unhandled errors
app.use((err, req, res, next) => {
	console.error("Unhandled error:", err);
	res.status(500).json({
		success: false,
		message: "Internal server error",
	});
});

// Start the server
app.listen(config.PORT, () => {
	console.log(
		`[${config.SERVICE_NAME}] Running on port ${config.PORT} in ${config.NODE_ENV} mode`,
	);
	console.log(
		`[${config.SERVICE_NAME}] NIBSS endpoint: ${config.NIBSS_BASE_URL}`,
	);
	console.log(
		`[${config.SERVICE_NAME}] Notifications service: ${config.NOTIFICATIONS_SERVICE_URL}`,
	);
});

module.exports = app; // exported for testing



