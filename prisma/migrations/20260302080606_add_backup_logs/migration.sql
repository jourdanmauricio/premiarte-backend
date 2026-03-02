-- CreateTable
CREATE TABLE "backup_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "triggered_by" TEXT NOT NULL
);
