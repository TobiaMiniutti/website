import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";

const root = path.resolve(process.argv[2] || "dist");
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";

if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("PORT non valida");
await access(root);

const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".avif", "image/avif"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
]);

const sendFile = async (request, response, file, statusCode = 200) => {
  const info = await stat(file);
  response.writeHead(statusCode, {
    "Content-Type": types.get(path.extname(file).toLowerCase()) || "application/octet-stream",
    "Content-Length": info.size,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (request.method === "HEAD") response.end();
  else createReadStream(file).pipe(response);
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }

    const url = new URL(request.url || "/", `http://${host}:${port}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.includes("\0")) throw new Error("Percorso non valido");

    const extension = path.posix.extname(pathname);
    if (!extension && pathname !== "/" && !pathname.endsWith("/")) {
      const candidateDirectory = path.join(root, pathname);
      try {
        if ((await stat(candidateDirectory)).isDirectory()) {
          response.writeHead(308, { Location: `${pathname}/${url.search}` }).end();
          return;
        }
      } catch {
        const htmlCandidate = path.join(root, `${pathname}.html`);
        try {
          if ((await stat(htmlCandidate)).isFile()) {
            response.writeHead(308, { Location: `${pathname}.html${url.search}` }).end();
            return;
          }
        } catch {
          // La risposta 404 viene gestita in seguito.
        }
      }
    }

    if (pathname.endsWith("/")) pathname += "index.html";
    const file = path.resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) throw new Error("Percorso fuori dalla root");

    try {
      if ((await stat(file)).isFile()) {
        await sendFile(request, response, file);
        return;
      }
    } catch {
      // La risposta 404 usa la pagina personalizzata.
    }

    await sendFile(request, response, path.join(root, "404.html"), 404);
  } catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }).end("Richiesta non valida");
  }
});

server.listen(port, host, () => console.log(`Anteprima: http://${host}:${port}/ (${root})`));
