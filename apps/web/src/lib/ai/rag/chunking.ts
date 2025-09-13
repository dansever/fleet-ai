// src/lib/ai/rag/chunkings.ts

export type Chunk = { content: string; order: number; meta?: Record<string, any> };

export function chunkText(
  text: string,
  { targetSize = 900, overlap = 120, minChunk = 200 } = {},
): Chunk[] {
  const paras = text
    .replace(/\r/g, '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let buf = '';
  const pushBuf = () => {
    const t = buf.trim();
    if (t.length >= minChunk) chunks.push(t);
    buf = '';
  };

  for (const p of paras) {
    const next = buf ? buf + '\n\n' + p : p;
    if (next.length <= targetSize) {
      buf = next;
    } else {
      if (buf) pushBuf();
      if (p.length <= targetSize) {
        buf = p;
      } else {
        let i = 0;
        while (i < p.length) {
          chunks.push(p.slice(i, i + targetSize).trim());
          i += Math.max(1, targetSize - overlap);
        }
        buf = '';
      }
    }
  }
  if (buf) pushBuf();

  if (overlap > 0 && chunks.length > 1) {
    for (let i = 1; i < chunks.length; i++) {
      const tail = chunks[i - 1].slice(Math.max(0, chunks[i - 1].length - overlap));
      chunks[i] = `${tail}\n\n${chunks[i]}`;
    }
  }
  return chunks.map((c, idx) => ({ content: c, order: idx }));
}
