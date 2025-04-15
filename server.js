import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import qs from "qs";
import NodeCache from "node-cache";
import winston from "winston";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import shippingRoutes from "./routes/shipping-api.js";
import preferencesRoutes from "./routes/preferences.js";
import addressRoutes from "./routes/addresses.js";
import { router as authRouter } from "./routes/auth.js";
import { addBusinessDays } from "./holidayHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir);
}

// configure logger
const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || "info",
	format: winston.format.combine(
		winston.format.timestamp({
			format: "YYYY-MM-DD HH:mm:ss",
		}),
		winston.format.errors({ stack: true }),
		winston.format.splat(),
		winston.format.json(),
	),
	defaultMeta: { service: "shipping-api" },
	transports: [
		new winston.transports.File({
			filename: path.join(logsDir, "error.log"),
			level: "error",
		}),
		new winston.transports.File({
			filename: path.join(logsDir, "combined.log"),
		}),
	],
});

if (process.env.NODE_ENV !== "production") {
	logger.add(
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple(),
			),
		}),
	);
}

const app = express();
const port = process.env.PORT || 3000;
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

app.use((req, res, next) => {
	const start = Date.now();

	res.on("finish", () => {
		const duration = Date.now() - start;
		logger.info({
			type: "request",
			method: req.method,
			url: req.originalUrl,
			status: res.statusCode,
			duration: `${duration}ms`,
			userAgent: req.get("user-agent") || "unknown",
			ip: req.ip || req.connection.remoteAddress,
		});
	});

	next();
});

app.use((req, res, next) => {
	req.logger = logger;
	next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRouter);
app.use("/preferences", preferencesRoutes);
app.use("/addresses", addressRoutes);


async function callShipEngineApi(fromZip, toZip, weightOz = 1) {
	const url = "https://api.shipengine.com/v1/rates/estimate";

	const payload = {
		carrier_ids: [], // empty will use all carriers
		from_postal_code: fromZip,
		to_postal_code: toZip,
		weight: {
			value: weightOz,
			unit: "ounce"
		},
		confirmation: "none",
		address_residential_indicator: "no"
	};

	try {
		const response = await axios.post(url, payload, {
			headers: {
				"Content-Type": "application/json",
				"Authorization": `ShipEngine ${process.env.SHIPENGINE_API_KEY}`
			}
		});

		return response.data;
	} catch (error) {
		logger.error("Error calling ShipEngine API", {
			fromZip,
			toZip,
			error: error.message,
			stack: error.stack
		});
		throw error;
	}
}


function getCachedRoute(from, to, method) {
	const cacheKey = `${from}-${to}-${weight}`;
	const cachedData = cache.get(cacheKey);

	if (cachedData) {
		logger.debug("Cache hit", { cacheKey });
	} else {
		logger.debug("Cache miss", { cacheKey });
	}

	return cachedData;
}

function setCachedRoute(from, to, method, data) {
	const cacheKey = `${from}-${to}-${weight}`;
	cache.set(cacheKey, data);
	logger.debug("Cache updated", { cacheKey });
}

app.get("/estimates", async (req, res) => {
	const { from, to, weight } = req.query;

	logger.info("Handling ShipEngine shipping estimate request", { from, to });

	const cachedData = getCachedRoute(from, to, weight);
	if (cachedData) return res.json(cachedData);

	try {
		const data = await callShipEngineApi(from, to, Number(weight) || 1);

		// Filter essential info from all rates
		const rates = data.rate_response.rates.map(rate => ({
			carrier: rate.carrier_friendly_name,
			service: rate.service_type,
			days: rate.delivery_days,
			amount: rate.shipping_amount.amount,
			currency: rate.shipping_amount.currency
		}));

		setCachedRoute(from, to, weight, rates);
		res.json({ from, to, weight: Number(weight) || 1, rates });
	} catch (error) {
		res.status(500).json({ error: "Failed to get shipping estimates" });
	}
});


app.get("/shipping-methods", (req, res) => {
	logger.info("Retrieving available shipping methods");
	const shippingMethods = ["Standard", "Priority", "Express"];
	res.json(shippingMethods);
});

app.use("/api/shipping-records", shippingRoutes);

app.use((err, req, res, next) => {
	logger.error("Unhandled application error:", {
		error: err.message,
		stack: err.stack,
		method: req.method,
		url: req.originalUrl,
	});

	res.status(500).json({
		error: "Internal server error",
		message:
			process.env.NODE_ENV === "production"
				? "An unexpected error occurred"
				: err.message,
	});
});

app.listen(port, () => {
	logger.info(`Server started on port ${port}`);
	logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

process.on("unhandledRejection", (reason, promise) => {
	logger.error("Unhandled Promise Rejection:", {
		reason: reason.toString(),
		stack: reason.stack,
	});
});

process.on("uncaughtException", (error) => {
	logger.error("Uncaught Exception:", {
		error: error.message,
		stack: error.stack,
	});
	process.exit(1);
});
