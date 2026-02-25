# Desktop Shell (`apps/desktop`)

Electrobun desktop shell for the Catalyst app in `../web`.

## Behavior

- Loads Catalyst URL from `CATALYST_WEB_URL` (default: `http://localhost:3005`)
- If Catalyst is unreachable, loads bundled fallback React view
- Exposes typed RPC for desktop info + Catalyst health checks

## Commands

```bash
bun install
bun run dev:hmr
```

## Typed RPC

Shared RPC schema is in:

- `src/shared/rpc.ts`

Main-process handlers are implemented in:

- `src/bun/index.ts`

Fallback view client calls are implemented in:

- `src/mainview/App.tsx`
