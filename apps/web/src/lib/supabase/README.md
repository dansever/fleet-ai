# Admin operations:

List All Buckets:
`await supabaseAdmin.storage.listBuckets()`

Delete Bucket:
`await supabaseAdmin.storage.deleteBucket(bucketName);`

Create Bucket:

```
await supabaseAdmin.storage.createBucket(bucketName,{
  public: false,
  allowedMimeTypes: ['text/plain', 'application/pdf'],
  fileSizeLimit: 1024,
  },
);
```
