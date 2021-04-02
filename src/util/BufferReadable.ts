/* eslint-disable no-restricted-syntax */
import { Readable } from 'stream';

export async function buffer(readable: Readable): Promise<Buffer> {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}
