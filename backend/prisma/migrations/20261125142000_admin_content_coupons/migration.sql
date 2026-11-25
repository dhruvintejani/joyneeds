ALTER TABLE "orders" ADD COLUMN "coupon_code" TEXT;
CREATE TABLE "coupons" (
  "id" TEXT NOT NULL PRIMARY KEY, "code" TEXT NOT NULL UNIQUE,
  "percent_off" INTEGER NOT NULL CHECK ("percent_off" BETWEEN 1 AND 90),
  "min_subtotal_paise" INTEGER NOT NULL DEFAULT 0 CHECK ("min_subtotal_paise" >= 0),
  "active" BOOLEAN NOT NULL DEFAULT true, "expires_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "store_content" (
  "id" TEXT NOT NULL PRIMARY KEY, "hero_eyebrow" TEXT NOT NULL,
  "hero_title" TEXT NOT NULL, "hero_accent" TEXT NOT NULL, "hero_description" TEXT NOT NULL,
  "announcement" TEXT, "updated_at" TIMESTAMP(3) NOT NULL
);
