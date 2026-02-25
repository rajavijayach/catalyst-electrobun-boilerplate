import type { RPCSchema } from "electrobun/bun";

export interface DesktopInfo {
	platform: string;
	catalystBaseUrl: string;
}

export interface CatalystHealthResult {
	healthy: boolean;
	healthUrl: string;
	statusCode?: number;
	payload?: unknown;
	error?: string;
}

export type AppRPC = {
	bun: RPCSchema<{
		requests: {
			getDesktopInfo: { params: {}; response: DesktopInfo };
			checkCatalystHealth: { params: {}; response: CatalystHealthResult };
		};
		messages: {
			notifyFallbackReady: { timestamp: string };
		};
	}>;
	webview: RPCSchema<{
		requests: {
			getWindowTitle: { params: {}; response: string };
		};
		messages: {
			showStatus: { message: string };
		};
	}>;
};
