import { BrowserView, BrowserWindow, Updater } from "electrobun/bun";
import type { AppRPC, CatalystHealthResult } from "../shared/rpc";

const CATALYST_BASE_URL = process.env.CATALYST_WEB_URL ?? "http://localhost:3005";
const CATALYST_HEALTH_URL = new URL("/api/health", CATALYST_BASE_URL).toString();

const FALLBACK_DEV_SERVER_PORT = 5173;
const FALLBACK_DEV_SERVER_URL = `http://localhost:${FALLBACK_DEV_SERVER_PORT}`;
const FALLBACK_BUNDLED_URL = "views://mainview/index.html";

async function urlReachable(url: string): Promise<boolean> {
	try {
		const response = await fetch(url, { method: "HEAD" });
		return response.ok;
	} catch {
		return false;
	}
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function waitForUrl(url: string, attempts = 20, delayMs = 500): Promise<boolean> {
	for (let attempt = 0; attempt < attempts; attempt += 1) {
		if (await urlReachable(url)) return true;
		await sleep(delayMs);
	}
	return false;
}

async function getFallbackViewUrl(): Promise<string> {
	const channel = await Updater.localInfo.channel();
	if (channel === "dev" && (await urlReachable(FALLBACK_DEV_SERVER_URL))) {
		console.log(`Using fallback Vite dev server: ${FALLBACK_DEV_SERVER_URL}`);
		return FALLBACK_DEV_SERVER_URL;
	}
	return FALLBACK_BUNDLED_URL;
}

async function getMainWindowUrl(): Promise<string> {
	if (await waitForUrl(CATALYST_BASE_URL, 30, 500)) {
		console.log(`Loading Catalyst app from ${CATALYST_BASE_URL}`);
		return CATALYST_BASE_URL;
	}

	console.warn(
		`Catalyst app not reachable at ${CATALYST_BASE_URL}. Loading fallback desktop view.`,
	);
	return getFallbackViewUrl();
}

async function checkCatalystHealth(): Promise<CatalystHealthResult> {
	try {
		const response = await fetch(CATALYST_HEALTH_URL);
		let payload: unknown = null;

		try {
			payload = await response.json();
		} catch {
			payload = null;
		}

		return {
			healthy: response.ok,
			healthUrl: CATALYST_HEALTH_URL,
			statusCode: response.status,
			payload,
		};
	} catch (error) {
		return {
			healthy: false,
			healthUrl: CATALYST_HEALTH_URL,
			error: error instanceof Error ? error.message : "Unknown health check error",
		};
	}
}

const rpc = BrowserView.defineRPC<AppRPC>({
	handlers: {
		requests: {
			getDesktopInfo: () => ({
				platform: process.platform,
				catalystBaseUrl: CATALYST_BASE_URL,
			}),
			checkCatalystHealth,
		},
		messages: {
			notifyFallbackReady: ({ timestamp }) => {
				console.log(`Fallback view ready at ${timestamp}`);
			},
		},
	},
});

const url = await getMainWindowUrl();
const mainWindow = new BrowserWindow({
	title: "Catalyst + Electrobun",
	url,
	rpc,
	frame: {
		width: 1080,
		height: 760,
		x: 180,
		y: 120,
	},
});

mainWindow.webview.on("dom-ready", () => {
	console.log(`Main window loaded URL: ${url}`);
});
