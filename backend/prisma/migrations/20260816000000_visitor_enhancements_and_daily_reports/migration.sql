-- AlterTable Visitor: new inquiry-tracker fields
ALTER TABLE "Visitor" ADD COLUMN "heardAboutUsDetail" TEXT;
ALTER TABLE "Visitor" ADD COLUMN "targetBranch" TEXT;
ALTER TABLE "Visitor" ADD COLUMN "isTransfer" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Visitor" ADD COLUMN "transferFrom" TEXT;
ALTER TABLE "Visitor" ADD COLUMN "programType" TEXT;
ALTER TABLE "Visitor" ADD COLUMN "academicYear" TEXT;
ALTER TABLE "Visitor" ADD COLUMN "managementRemarks" TEXT;
ALTER TABLE "Visitor" ADD COLUMN "handledBy" TEXT;

-- CreateTable
CREATE TABLE "VisitorFollowUp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitorId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "note" TEXT,
    "result" TEXT,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VisitorFollowUp_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "branchId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "managerName" TEXT,
    "childrenPresent" INTEGER NOT NULL DEFAULT 0,
    "studentAbsenceIssues" INTEGER NOT NULL DEFAULT 0,
    "parentComplaints" INTEGER NOT NULL DEFAULT 0,
    "newInquiries" INTEGER NOT NULL DEFAULT 0,
    "staffAbsences" INTEGER NOT NULL DEFAULT 0,
    "staffConductIssues" INTEGER NOT NULL DEFAULT 0,
    "maintenanceIssues" INTEGER NOT NULL DEFAULT 0,
    "newEnrollments" INTEGER NOT NULL DEFAULT 0,
    "withdrawals" INTEGER NOT NULL DEFAULT 0,
    "overallStatus" TEXT NOT NULL DEFAULT 'GOOD',
    "highlights" TEXT,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyReport_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BranchIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "branchId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "department" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "personInvolved" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "actionTaken" TEXT,
    "needsFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" DATETIME,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BranchIssue_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyReport_branchId_date_key" ON "DailyReport"("branchId", "date");
