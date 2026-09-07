CREATE TYPE "EmailDeliveryStatus" AS ENUM ('PENDING', 'SENDING', 'SENT', 'FAILED');

CREATE TABLE "email_deliveries" (
  "id" TEXT NOT NULL,
  "order_id" TEXT NOT NULL,
  "dedupe_key" TEXT NOT NULL,
  "message_type" TEXT NOT NULL,
  "recipient_email" TEXT NOT NULL,
  "recipient_name" TEXT,
  "subject" TEXT NOT NULL,
  "status" "EmailDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "provider_message_id" TEXT,
  "attempt_count" INTEGER NOT NULL DEFAULT 0,
  "last_attempt_at" TIMESTAMP(3),
  "last_error" TEXT,
  "sent_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "email_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "email_deliveries_dedupe_key_key" ON "email_deliveries"("dedupe_key");
CREATE UNIQUE INDEX "email_deliveries_provider_message_id_key" ON "email_deliveries"("provider_message_id");
CREATE INDEX "email_deliveries_order_id_created_at_idx" ON "email_deliveries"("order_id", "created_at");
CREATE INDEX "email_deliveries_status_updated_at_idx" ON "email_deliveries"("status", "updated_at");

ALTER TABLE "email_deliveries"
  ADD CONSTRAINT "email_deliveries_order_id_fkey"
  FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
