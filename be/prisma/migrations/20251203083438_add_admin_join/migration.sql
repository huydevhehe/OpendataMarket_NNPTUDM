-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_buyer_id_fkey";

-- AlterTable
ALTER TABLE "public"."Conversation" ADD COLUMN     "admin_joined" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
