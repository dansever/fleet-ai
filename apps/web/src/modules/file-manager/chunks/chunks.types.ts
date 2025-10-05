// Types for chunks module (currently empty, but can be extended in the future)

export interface ChunkCreateInput {
  documentId: string;
  content: string;
  embedding?: number[];
}
