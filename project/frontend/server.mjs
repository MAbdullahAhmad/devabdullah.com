import { createServer } from 'node:http';

import next from 'next';

const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOST || '0.0.0.0';
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

const server = createServer((request, response) => handle(request, response));

server.listen(port, hostname, () => {
  console.log(`devabdullah listening on ${hostname}:${port}`);
});

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
