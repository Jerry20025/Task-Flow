-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'STARTER', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "OrgStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrgMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_HOLD', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProjectMemberRole" AS ENUM ('MANAGER', 'DEVELOPER', 'VIEWER', 'QA', 'DESIGNER', 'BUSINESS_ANALYST');

-- CreateEnum
CREATE TYPE "SprintStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('BUG', 'STORY', 'TASK', 'EPIC');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('TICKET', 'PROJECT', 'SPRINT', 'COMMENT', 'ATTACHMENT');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'ASSIGNED', 'COMMENTED', 'STATUS_CHANGED');

-- CreateEnum
CREATE TYPE "ApiKeyScope" AS ENUM ('READ', 'WRITE', 'ADMIN');

-- CreateTable
CREATE TABLE "Org" (
    "org_id" TEXT NOT NULL,
    "org_name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subscription_plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "OrgStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "Org_pkey" PRIMARY KEY ("org_id")
);

-- CreateTable
CREATE TABLE "Org_Members" (
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "OrgMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Org_Members_pkey" PRIMARY KEY ("org_id","user_id")
);

-- CreateTable
CREATE TABLE "Project" (
    "project_id" TEXT NOT NULL,
    "project_key" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "org_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "updated_by_id" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "Project_Members" (
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "ProjectMemberRole" NOT NULL DEFAULT 'VIEWER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_Members_pkey" PRIMARY KEY ("project_id","user_id")
);

-- CreateTable
CREATE TABLE "Sprint" (
    "sprint_id" TEXT NOT NULL,
    "sprint_name" TEXT NOT NULL,
    "goal" TEXT,
    "status" "SprintStatus" NOT NULL DEFAULT 'PLANNED',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "project_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "updated_by_id" TEXT,

    CONSTRAINT "Sprint_pkey" PRIMARY KEY ("sprint_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "ticket_id" TEXT NOT NULL,
    "ticket_name" TEXT NOT NULL,
    "description" TEXT,
    "ticket_type" "TicketType" NOT NULL DEFAULT 'TASK',
    "status" "TicketStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "story_points" INTEGER,
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "project_id" TEXT NOT NULL,
    "sprint_id" TEXT,
    "parent_ticket_id" TEXT,
    "reporter_id" TEXT NOT NULL,
    "assignee_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "updated_by_id" TEXT,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("ticket_id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "comment_id" TEXT NOT NULL,
    "comment_text" TEXT NOT NULL,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "attachment_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticket_id" TEXT,
    "comment_id" TEXT,
    "uploaded_by" TEXT NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("attachment_id")
);

-- CreateTable
CREATE TABLE "Label" (
    "label_id" TEXT NOT NULL,
    "label_name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("label_id")
);

-- CreateTable
CREATE TABLE "Ticket_Label" (
    "ticket_id" TEXT NOT NULL,
    "label_id" TEXT NOT NULL,

    CONSTRAINT "Ticket_Label_pkey" PRIMARY KEY ("ticket_id","label_id")
);

-- CreateTable
CREATE TABLE "Activity_Log" (
    "log_id" TEXT NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "activity_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performed_by_id" TEXT NOT NULL,

    CONSTRAINT "Activity_Log_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "API_Key" (
    "key_id" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scope" "ApiKeyScope" NOT NULL DEFAULT 'READ',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,

    CONSTRAINT "API_Key_pkey" PRIMARY KEY ("key_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Org_slug_key" ON "Org"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_project_key_key" ON "Project"("project_key");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "API_Key_key_hash_key" ON "API_Key"("key_hash");

-- AddForeignKey
ALTER TABLE "Org" ADD CONSTRAINT "Org_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Org_Members" ADD CONSTRAINT "Org_Members_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "Org"("org_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Org_Members" ADD CONSTRAINT "Org_Members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "Org"("org_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_Members" ADD CONSTRAINT "Project_Members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_Members" ADD CONSTRAINT "Project_Members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "Sprint"("sprint_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_parent_ticket_id_fkey" FOREIGN KEY ("parent_ticket_id") REFERENCES "Ticket"("ticket_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Ticket"("ticket_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Ticket"("ticket_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "Comment"("comment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket_Label" ADD CONSTRAINT "Ticket_Label_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Ticket"("ticket_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket_Label" ADD CONSTRAINT "Ticket_Label_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "Label"("label_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity_Log" ADD CONSTRAINT "Activity_Log_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "API_Key" ADD CONSTRAINT "API_Key_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "API_Key" ADD CONSTRAINT "API_Key_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "Org"("org_id") ON DELETE RESTRICT ON UPDATE CASCADE;
