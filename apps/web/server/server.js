const express = require("express")
const path = require("path")

// Server middlewares are added here.

export function addMiddlewares(app) {
    app.get("/api/health", (_req, res) => {
        res.status(200).json({
            status: "ok",
            service: "catalyst-web",
            timestamp: new Date().toISOString(),
            uptimeSeconds: Math.floor(process.uptime())
        })
    })

    app.use("/favicon.ico", express.static(path.join(__dirname, "../public/favicon.ico")))
}
