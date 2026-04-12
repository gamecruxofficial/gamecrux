CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan" varchar(20) NOT NULL,
	"billing_cycle" varchar(10) NOT NULL,
	"amount" integer NOT NULL,
	"razorpay_order_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"image" text,
	"name" text,
	"username" varchar(50) NOT NULL,
	"password" text,
	"provider" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reset_token" text,
	"reset_token_expiry" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;