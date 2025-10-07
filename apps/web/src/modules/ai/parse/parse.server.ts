'use server';
import 'server-only';

import { mkdtemp, rm, writeFile } from 'fs/promises';
import { LlamaParseReader } from 'llama-cloud-services';
import { tmpdir } from 'os';
import { join } from 'path';

// Create a singleton instance to avoid multiple imports
let readerInstance: LlamaParseReader | null = null;

function getLlamaParseReader() {
  if (!readerInstance) {
    readerInstance = new LlamaParseReader({
      resultType: 'text',
    });
  }
  return readerInstance;
}

/**
 * Parse a document using LlamaParse
 */
export async function parseDocument(file: File) {
  // Turn the in-memory File into a temp file path
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const tmpDir = await mkdtemp(join(tmpdir(), 'parse-'));
  const tmpPath = join(tmpDir, file.name || 'upload');

  try {
    // Write the file to the temp path
    await writeFile(tmpPath, buffer);

    // Use the singleton reader instance
    const reader = getLlamaParseReader();

    // Parse by file path
    const data = await reader.loadData(tmpPath);

    if (!data) {
      throw new Error('Failed to parse document');
    }

    return data;
  } finally {
    // Cleanup temp file/folder
    await rm(tmpDir, { recursive: true, force: true });
  }
}
