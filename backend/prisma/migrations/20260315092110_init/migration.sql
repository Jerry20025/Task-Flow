/*
  Warnings:

  - A unique constraint covering the columns `[org_email]` on the table `Org` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Org" ADD COLUMN     "address_line1" TEXT,
ADD COLUMN     "address_line2" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "org_email" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "timezone" TEXT DEFAULT 'UTC',
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Org_org_email_key" ON "Org"("org_email");
