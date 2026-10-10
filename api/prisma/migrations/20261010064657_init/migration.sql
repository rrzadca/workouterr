-- CreateTable
CREATE TABLE "exercise" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "weight_step" DECIMAL(5,2),

    CONSTRAINT "exercise_pkey" PRIMARY KEY ("id")
);
