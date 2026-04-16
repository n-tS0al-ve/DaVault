
## 2024-05-18 - Missing Foreign Key Indexes in Prisma/PostgreSQL
**Learning:** PostgreSQL does not automatically create indexes on foreign keys. In Next.js applications using NextAuth and Prisma, this can lead to sequential scans for session lookups and cascading deletes. Furthermore, queries ordering by a timestamp (like `createdAt: 'desc'`) for a specific user require a composite index to avoid sorting in memory.
**Action:** Always add explicit indexes (`@@index([foreignKeyId])`) for relation fields in Prisma schema when using PostgreSQL, particularly for NextAuth `Account` and `Session` models. For listing views, use composite indexes that cover both the filtering foreign key and the sorting column (`@@index([foreignKeyId, sortColumn(sort: Desc)])`).
