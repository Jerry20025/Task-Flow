/*
  Warnings:

  - A unique constraint covering the columns `[org_id,project_key]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Project_org_id_project_key_key" ON "Project"("org_id", "project_key");
