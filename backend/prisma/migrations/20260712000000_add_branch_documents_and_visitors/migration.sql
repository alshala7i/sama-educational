-- CreateTable
CREATE TABLE "BranchDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'LICENSE',
    "filePath" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "expiryDate" DATETIME NOT NULL,
    "notes" TEXT,
    "uploadedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BranchDocument_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "branchId" TEXT NOT NULL,
    "visitDate" DATETIME NOT NULL,
    "visitType" TEXT NOT NULL DEFAULT 'IN_PERSON',
    "childName" TEXT NOT NULL,
    "guardianName" TEXT NOT NULL,
    "guardianPhone" TEXT,
    "childDob" DATETIME,
    "gradeLevel" TEXT,
    "heardAboutUs" TEXT,
    "tookTour" BOOLEAN NOT NULL DEFAULT false,
    "tourAccompaniedBy" TEXT,
    "guardianFeedback" TEXT,
    "notes" TEXT,
    "followUpStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Visitor_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
