User upload file:

1. Create document in documentsTable
2. Upload file blob to storage
   2.1 Update document entity --> document.storage_path = storage path
3. Parse file for text w/ LlamaParse
   3.1 Update document entity --> document.content = paresed content
4. Extract file for structured content w/ LlamaExtract
   4.1 Update document entity --> document.summary, document.extracted_data
5. Generate chunks from the document.content.
   5.1 For each chunk generate a vector embedding
   5.2 Update chunk with new vector embedding
