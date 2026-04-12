CREATE TABLE "suggestions" (
	"id" text PRIMARY KEY NOT NULL,
	"game_name" text NOT NULL,
	"game_url" text NOT NULL,
	"game_description" text NOT NULL,
	"game_reason" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_user_id_unique";--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "plan" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "billing_cycle" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "billing_cycle" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "amount" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "amount" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "is_active" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "is_active" SET DEFAULT 'false';--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "is_active" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "recurring_payment" varchar;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "next_payment_date" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "last_checked_at" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "interval" varchar(10);--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "status" varchar(20) DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "pending_cancellation" text DEFAULT 'false';--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "cancellation_requested_at" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "cancellation_reason" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "failed_payment_count" varchar DEFAULT '0';--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "last_failed_payment_reason" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "discord_id" text;--> statement-breakpoint
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "razorpay_order_id";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_discord_id_unique" UNIQUE("discord_id");