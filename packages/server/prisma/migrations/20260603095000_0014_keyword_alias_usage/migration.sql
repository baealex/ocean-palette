CREATE TABLE "KeywordAlias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "keywordId" INTEGER NOT NULL,
    CONSTRAINT "KeywordAlias_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "KeywordAlias_name_key" ON "KeywordAlias"("name");
CREATE INDEX "KeywordAlias_keywordId_idx" ON "KeywordAlias"("keywordId");
