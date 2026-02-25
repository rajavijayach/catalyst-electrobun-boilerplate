const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js")
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js")

const fetchContextFromGitHub = async () => {
    const url = "https://raw.githubusercontent.com/tata1mg/catalyst-core/main/context.md"
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch context from GitHub`)
    }

    return await response.text()
}

const server = new McpServer({
    name: "catalyst",
    version: "1.0.0",
    capabilities: {
        tools: {},
    },
})

server.tool("get_context", "Complete context of catalyst framework", {}, async () => {
    try {
        const context = await fetchContextFromGitHub()
        return {
            content: [
                {
                    type: "text",
                    text: context,
                },
            ],
        }
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching context: ${error.message}`,
                },
            ],
        }
    }
})

const init = async () => {
    try {
        const transport = new StdioServerTransport()
        await server.connect(transport)
    } catch (error) {
        console.error("Error starting MCP server:", error)
    }
}

init()
