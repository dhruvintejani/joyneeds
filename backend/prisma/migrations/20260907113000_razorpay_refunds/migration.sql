CREATE TYPE "RefundStatus" AS ENUM ('CREATED', 'PROCESSING', 'PROCESSED', 'FAILED');

CREATE TABLE "refunds" (
  "id" TEXT NOT NULL,
  "payment_id" TEXT NOT NULL,
  "provider_refund_id" TEXT NOT NULL,
  "amount_paise" INTEGER NOT NULL,
  "status" "RefundStatus" NOT NULL DEFAULT 'CREATED',
  "reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "refunds_provider_refund_id_key" ON "refunds"("provider_refund_id");
CREATE INDEX "refunds_payment_id_status_idx" ON "refunds"("payment_id", "status");

ALTER TABLE "refunds"
ADD CONSTRAINT "refunds_payment_id_fkey"
FOREIGN KEY ("payment_id") REFERENCES "payments"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
