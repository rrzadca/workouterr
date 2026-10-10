import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import type { Express } from 'express';

export interface ListeningApp {
  baseUrl: string;
  close: () => Promise<void>;
}

/** Starts the app on a free port (port 0 lets the OS pick one). */
export async function listen(app: Express): Promise<ListeningApp> {
  const server = app.listen(0);
  await once(server, 'listening');
  const address = server.address() as AddressInfo;
  return {
    baseUrl: `http://localhost:${address.port}`,
    close: async () => {
      server.close();
      await once(server, 'close');
    },
  };
}
