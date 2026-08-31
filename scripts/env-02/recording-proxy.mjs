import {createWriteStream} from "node:fs";
import {createServer} from "node:http";
const targetUrl = new URL(process.env.TARGET_URL ?? "http://127.0.0.1:9596");
const listenPort = Number(process.env.LISTEN_PORT ?? 19596);
const logFile = process.env.LOG_FILE;
const duplicateFirstBlockEvent = process.env.DUPLICATE_FIRST_BLOCK_EVENT === "true";
let blockEventDuplicated = false;

if (!logFile) {
  throw Error("LOG_FILE is required");
}

const requestLog = createWriteStream(logFile, {flags: "a"});

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", targetUrl);
  requestLog.write(
    `${JSON.stringify({time: new Date().toISOString(), method: request.method, path: requestUrl.pathname + requestUrl.search})}\n`
  );

  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (
      value !== undefined &&
      !["host", "content-length", "connection", "keep-alive", "transfer-encoding", "upgrade"].includes(name)
    ) {
      headers.set(name, Array.isArray(value) ? value.join(", ") : value);
    }
  }

  try {
    const body = [];
    for await (const chunk of request) {
      body.push(chunk);
    }

    const controller = new AbortController();
    response.on("close", () => controller.abort());
    const upstream = await fetch(requestUrl, {
      method: request.method,
      headers,
      body: body.length > 0 ? Buffer.concat(body) : undefined,
      signal: controller.signal,
    });

    response.writeHead(upstream.status, Object.fromEntries(upstream.headers.entries()));
    if (upstream.body) {
      if (duplicateFirstBlockEvent && requestUrl.pathname === "/eth/v1/events") {
        const decoder = new TextDecoder();
        let pending = "";

        for await (const chunk of upstream.body) {
          pending += decoder.decode(chunk, {stream: true});
          let boundary = pending.match(/\r?\n\r?\n/);
          while (boundary?.index !== undefined) {
            const end = boundary.index + boundary[0].length;
            const frame = pending.slice(0, end);
            pending = pending.slice(end);
            response.write(frame);

            if (!blockEventDuplicated && /(^|\r?\n)event: block\r?\n/.test(frame)) {
              response.write(frame);
              blockEventDuplicated = true;
              requestLog.write(`${JSON.stringify({time: new Date().toISOString(), event: "duplicated-first-block-event"})}\n`);
            }

            boundary = pending.match(/\r?\n\r?\n/);
          }
        }

        pending += decoder.decode();
        if (pending.length > 0) {
          response.write(pending);
        }
      } else {
        for await (const chunk of upstream.body) {
          response.write(chunk);
        }
      }
      response.end();
    } else {
      response.end();
    }
  } catch (error) {
    if (!response.headersSent && !response.destroyed) {
      response.writeHead(502, {"content-type": "text/plain"});
      response.end(error instanceof Error ? error.message : String(error));
    }
  }
});

server.listen(listenPort, "127.0.0.1", () => {
  process.stdout.write(`Recording proxy listening on http://127.0.0.1:${listenPort}\n`);
});

const close = () => {
  server.close(() => requestLog.end());
  server.closeAllConnections();
};

process.on("SIGINT", close);
process.on("SIGTERM", close);
