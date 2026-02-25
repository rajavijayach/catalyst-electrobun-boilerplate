import { useEffect, useMemo, useState } from "react";
import { Electroview } from "electrobun/view";
import type { AppRPC, CatalystHealthResult, DesktopInfo } from "../shared/rpc";

const fallbackRpc = Electroview.defineRPC<AppRPC>({
	handlers: {
		requests: {
			getWindowTitle: () => document.title,
		},
		messages: {
			showStatus: ({ message }) => {
				console.log(`[main->fallback] ${message}`);
			},
		},
	},
});

const electroview = new Electroview({ rpc: fallbackRpc });

function App() {
	const [desktopInfo, setDesktopInfo] = useState<DesktopInfo | null>(null);
	const [health, setHealth] = useState<CatalystHealthResult | null>(null);
	const [loading, setLoading] = useState(false);

	const statusText = useMemo(() => {
		if (!health) return "No health check executed yet.";
		if (health.healthy) return `Catalyst is healthy (${health.statusCode ?? "n/a"}).`;
		return `Catalyst is unreachable (${health.error ?? "unknown error"}).`;
	}, [health]);

	useEffect(() => {
		if (!electroview.rpc) return;

		electroview.rpc.send.notifyFallbackReady({
			timestamp: new Date().toISOString(),
		});

		void electroview.rpc.request.getDesktopInfo({}).then(setDesktopInfo);
	}, []);

	const runHealthCheck = async () => {
		if (!electroview.rpc) return;

		setLoading(true);
		try {
			const result = await electroview.rpc.request.checkCatalystHealth({});
			setHealth(result);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100">
			<div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
				<h1 className="text-4xl font-bold">Catalyst + Electrobun Fallback View</h1>
				<p className="text-slate-300">
					This screen appears when the desktop shell cannot reach the Catalyst URL.
				</p>

				<div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-2">
					<p>
						<span className="text-slate-400">Platform:</span>{" "}
						{desktopInfo?.platform ?? "loading..."}
					</p>
					<p>
						<span className="text-slate-400">Catalyst URL:</span>{" "}
						{desktopInfo?.catalystBaseUrl ?? "loading..."}
					</p>
					<p>
						<span className="text-slate-400">Status:</span> {statusText}
					</p>
				</div>

				<div className="flex items-center gap-3">
					<button
						onClick={() => void runHealthCheck()}
						disabled={loading}
						className="rounded-lg bg-sky-600 px-4 py-2 font-medium hover:bg-sky-500 disabled:opacity-50"
					>
						{loading ? "Checking..." : "Run /api/health Check"}
					</button>
				</div>

				{health?.payload ? (
					<pre className="rounded-xl border border-slate-800 bg-black/40 p-4 overflow-auto text-sm">
						{JSON.stringify(health.payload, null, 2)}
					</pre>
				) : null}
			</div>
		</div>
	);
}

export default App;
