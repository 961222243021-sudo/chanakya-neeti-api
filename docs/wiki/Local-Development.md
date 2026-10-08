# Local Development

**Requires Node.js 24.** No runtime dependencies or database setup.

```sh
git clone https://github.com/961222243021-sudo/chanakya-neeti-api.git
cd chanakya-neeti-api
npm start
```

Open **http://localhost:3000**.

| Command | Purpose |
| :--- | :--- |
| `npm start` | Run the local HTTP server |
| `npm run dev` | Restart automatically when files change |
| `npm test` | Run the automated checks |
| `npm run check` | Validate collection integrity and English coverage |
| `npm run build` | Run the deployment validation step |

<details>
<summary><strong>Run with Docker</strong></summary>

```sh
docker build -t chanakya-neeti-api .
docker run --rm -p 3000:3000 chanakya-neeti-api
```

The supplied image uses Node.js 24 Alpine and runs as the `node` user. Docker execution has not been independently verified in this workspace.

</details>

## Minimal development loop

1. Use Node.js 24.
2. Start npm run dev for watch mode.
3. Open http://localhost:3000 and test the numbered reader.
4. Test API calls in the playground or with curl.
5. Run npm test and npm run build before publishing.

No npm install is needed for the current runtime, because no dependencies are declared. Build validates the data; it does not compile the app or download assets.

## Use another port

```sh
# Bash
PORT=3001 npm start
```

```powershell
# PowerShell
$env:PORT = '3001'
npm start
```

Visit http://localhost:3001. If a port is already occupied, stop the process using it or select another port.

## Reader rendering

The static homepage includes the first verse. Direct /read/{id} requests replace the reader section with the requested verse. Chapter and verse selectors navigate to ordinary reader links; the numbered links do not require JavaScript.

Next: [Architecture](Architecture.md) or [Testing and Contributing](Testing-and-Contributing.md).

---

[Wiki Home](Home.md) · Developed by **Shyam** · © 2026 Shyam. All rights reserved.
