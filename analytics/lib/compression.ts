/**
 * Compression utilities for large analytics datasets (issue #150).
 * Uses the native CompressionStream / DecompressionStream APIs (supported in
 * all modern browsers) with a fallback that returns the data unchanged.
 */

const COMPRESSION_THRESHOLD_BYTES = 100_000; // 100 KB

function supportsCompressionStream(): boolean {
  return typeof CompressionStream !== 'undefined';
}

async function compress(data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const stream = new CompressionStream('gzip');
  const writer = stream.writable.getWriter();
  writer.write(encoder.encode(data));
  writer.close();
  const chunks: Uint8Array[] = [];
  const reader = stream.readable.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

async function decompress(data: Uint8Array): Promise<string> {
  const stream = new DecompressionStream('gzip');
  const writer = stream.writable.getWriter();
  writer.write(data);
  writer.close();
  const chunks: Uint8Array[] = [];
  const reader = stream.readable.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(merged);
}

export interface CompressedPayload {
  compressed: true;
  data: number[]; // Uint8Array serialised as plain array for JSON transport
  originalSize: number;
  compressedSize: number;
  /** Compression ratio saved, e.g. 0.42 means 42 % smaller */
  ratio: number;
}

export interface UncompressedPayload {
  compressed: false;
  data: string;
}

export type DataPayload = CompressedPayload | UncompressedPayload;

/**
 * Compress a JSON-serialisable value if it exceeds the threshold.
 * Returns a `DataPayload` that can be passed to `decompressPayload`.
 */
export async function compressIfLarge<T>(value: T): Promise<DataPayload> {
  const json = JSON.stringify(value);
  const originalSize = new TextEncoder().encode(json).length;

  if (originalSize < COMPRESSION_THRESHOLD_BYTES || !supportsCompressionStream()) {
    return { compressed: false, data: json };
  }

  const bytes = await compress(json);
  const ratio = parseFloat(((1 - bytes.length / originalSize) * 100).toFixed(1));

  return {
    compressed: true,
    data: Array.from(bytes),
    originalSize,
    compressedSize: bytes.length,
    ratio,
  };
}

/**
 * Decompress a `DataPayload` back to the original value.
 */
export async function decompressPayload<T>(payload: DataPayload): Promise<T> {
  if (!payload.compressed) {
    return JSON.parse(payload.data) as T;
  }
  const json = await decompress(new Uint8Array(payload.data));
  return JSON.parse(json) as T;
}

/**
 * Convenience: compress → decompress round-trip used by the API client.
 * Returns the value plus a human-readable compression summary (or null when
 * compression was not applied).
 */
export async function processLargeDataset<T>(
  value: T,
): Promise<{ value: T; compressionInfo: string | null }> {
  const payload = await compressIfLarge(value);
  if (!payload.compressed) {
    return { value, compressionInfo: null };
  }
  const restored = await decompressPayload<T>(payload);
  const info = `Compressed ${(payload.originalSize / 1024).toFixed(1)} KB → ${(payload.compressedSize / 1024).toFixed(1)} KB (${payload.ratio}% saved)`;
  return { value: restored, compressionInfo: info };
}
