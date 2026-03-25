const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const config = require("./config");
const routes = require("./routes");

const app = express();

app.use(helmet());
app.use(morgan("combined"));
app.use(express.json());
app.use("/", routes);

app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: `Endpoint ${req.method} ${req.path} does not exist`,
	});
});

app.use((err, req, res, next) => {
	console.error("Unhandled error:", err);
	res.status(500).json({
		success: false,
		message: "Internal server error",
	});
});

app.listen(config.PORT, () => {
	console.log(
		`[${config.SERVICE_NAME}] Running on port ${config.PORT} in ${config.NODE_ENV} mode`,
	);
	console.log(
		`[${config.SERVICE_NAME}] Termii endpoint: ${config.TERMII_BASE_URL}`,
	);
});

module.exports = app;
