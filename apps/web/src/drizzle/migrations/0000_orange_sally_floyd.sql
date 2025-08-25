CREATE TYPE "public"."contract_type" AS ENUM('fuel', 'ground_handling', 'cargo_handling', 'airport_services', 'catering', 'maintenance_mro', 'aeronautical_services', 'non_aeronautical_services', 'security', 'cleaning', 'it_services', 'construction', 'leasing', 'consulting', 'other');--> statement-breakpoint
CREATE TYPE "public"."order_direction" AS ENUM('sent', 'received');--> statement-breakpoint
CREATE TYPE "public"."decision" AS ENUM('undecided', 'accepted', 'rejected', 'shortlisted');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('draft', 'pending', 'in_progress', 'completed', 'rejected', 'closed');--> statement-breakpoint
CREATE TABLE "airports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"iata" text,
	"icao" text,
	"name" text NOT NULL,
	"city" text,
	"state" text,
	"country" text NOT NULL,
	"is_hub" boolean DEFAULT false,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"vendor_id" uuid,
	"name" text,
	"email" text,
	"phone" text,
	"role" text,
	"department" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fuel_bids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tender_id" uuid NOT NULL,
	"title" text,
	"round" integer,
	"bid_submitted_at" timestamp with time zone,
	"vendor_name" text,
	"vendor_address" text,
	"vendor_contact_name" text,
	"vendor_contact_email" text,
	"vendor_contact_phone" text,
	"vendor_comments" text,
	"price_type" text,
	"uom" text DEFAULT 'USG',
	"currency" text DEFAULT 'USD',
	"payment_terms" text,
	"base_unit_price" numeric,
	"index_name" text,
	"index_location" text,
	"differential" numeric,
	"differential_unit" text,
	"formula_notes" text,
	"into_plane_fee" numeric,
	"handling_fee" numeric,
	"other_fee" numeric,
	"other_fee_description" text,
	"includes_taxes" boolean,
	"includes_airport_fees" boolean,
	"density_at_15c" numeric,
	"norm_usd_per_usg" numeric,
	"ai_summary" text,
	"decision" "decision",
	"decision_by_user_id" uuid,
	"decision_at" timestamp with time zone,
	"decision_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fuel_contract_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"fuel_contract_id" uuid,
	"invoice_number" text NOT NULL,
	"invoice_date" timestamp with time zone,
	"vendor_name" text,
	"vendor_address" text,
	"vendor_contact_name" text,
	"vendor_contact_email" text,
	"vendor_contact_phone" text,
	"total_amount" numeric,
	"currency" text,
	"lines" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fuel_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"airport_id" uuid NOT NULL,
	"contract_number" text,
	"title" text,
	"fuel_type" text,
	"vendor_name" text,
	"vendor_address" text,
	"vendor_contact_name" text,
	"vendor_contact_email" text,
	"vendor_contact_phone" text,
	"currency" text,
	"price_type" text,
	"price_formula" text,
	"base_unit_price" numeric,
	"normalized_usd_per_usg" numeric,
	"volume_committed" numeric,
	"volume_unit" text,
	"into_plane_fee" numeric,
	"includes_taxes" boolean,
	"includes_airport_fees" boolean,
	"effective_from" timestamp with time zone,
	"effective_to" timestamp with time zone,
	"pdf_url" text,
	"raw_text" text,
	"ai_summary" text,
	"terms" jsonb DEFAULT '{}'::jsonb,
	"status" "status" DEFAULT 'pending',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fuel_tenders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"airport_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"fuel_type" text,
	"base_currency" text,
	"base_uom" text,
	"bidding_starts" date,
	"bidding_ends" date,
	"delivery_starts" date,
	"delivery_ends" date,
	"status" "status" DEFAULT 'pending',
	"winning_bid_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_settings" (
	"org_id" uuid PRIMARY KEY NOT NULL,
	"auto_approval_limit" integer DEFAULT 10000,
	"ai_insights_enabled" boolean DEFAULT true,
	"agents_enabled" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"name" text,
	"ai_tokens_used" integer DEFAULT 0,
	"total_quotes_processed" integer DEFAULT 0,
	"total_rfqs_processed" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_clerk_org_id_unique" UNIQUE("clerk_org_id")
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfq_id" uuid NOT NULL,
	"rfq_number" text,
	"direction" "order_direction",
	"vendor_name" text,
	"vendor_address" text,
	"vendor_contact_name" text,
	"vendor_contact_email" text,
	"vendor_contact_phone" text,
	"part_number" text,
	"serial_number" text,
	"part_description" text,
	"condition_code" text,
	"unit_of_measure" text,
	"quantity" integer,
	"price" numeric,
	"currency" text,
	"pricing_type" text,
	"pricing_method" text,
	"core_due" text,
	"core_change" text,
	"payment_terms" text,
	"minimum_order_quantity" integer,
	"lead_time" text,
	"delivery_terms" text,
	"warranty" text,
	"quote_expiration_date" text,
	"certifications" text[] DEFAULT '{}',
	"trace_to" text,
	"tag_type" text,
	"tagged_by" text,
	"tagged_date" text,
	"vendor_comments" text,
	"status" "status" DEFAULT 'pending',
	"received_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"direction" "order_direction",
	"rfq_number" text,
	"vendor_name" text,
	"vendor_address" text,
	"vendor_contact_name" text,
	"vendor_contact_email" text,
	"vendor_contact_phone" text,
	"part_number" text,
	"alt_part_number" text,
	"part_description" text,
	"condition_code" text,
	"unit_of_measure" text,
	"quantity" integer,
	"pricing_type" text,
	"urgency_level" text,
	"deliver_to" text,
	"buyer_comments" text,
	"status" "status" DEFAULT 'pending',
	"status_history" jsonb DEFAULT '[]'::jsonb,
	"selected_quote_id" uuid,
	"sent_at" timestamp with time zone,
	"received_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_contract_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"service_contract_id" uuid,
	"invoice_number" text NOT NULL,
	"invoice_date" timestamp with time zone,
	"vendor_name" text,
	"vendor_address" text,
	"vendor_contact_name" text,
	"vendor_contact_email" text,
	"vendor_contact_phone" text,
	"total_amount" numeric,
	"currency" text,
	"lines" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"airport_id" uuid,
	"title" text NOT NULL,
	"notes" text,
	"vendor_name" text,
	"vendor_address" text,
	"vendor_contact_name" text,
	"vendor_contact_email" text,
	"vendor_contact_phone" text,
	"effective_from" timestamp with time zone,
	"effective_to" timestamp with time zone,
	"pdf_url" text,
	"raw_text" text,
	"ai_summary" text,
	"terms" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"org_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"email" text NOT NULL,
	"position" text,
	"ai_tokens_used" integer DEFAULT 0,
	"total_quotes_processed" integer DEFAULT 0,
	"total_rfqs_processed" integer DEFAULT 0,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" text NOT NULL,
	"internal_rating" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "airports" ADD CONSTRAINT "fk_airports_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "fk_contacts_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "fk_contacts_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_bids" ADD CONSTRAINT "fk_fuel_bids_tender_id" FOREIGN KEY ("tender_id") REFERENCES "public"."fuel_tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_bids" ADD CONSTRAINT "fk_fuel_bids_decision_by_user_id" FOREIGN KEY ("decision_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_contract_invoices" ADD CONSTRAINT "fk_fuel_contract_invoices_fuel_contract_id" FOREIGN KEY ("fuel_contract_id") REFERENCES "public"."fuel_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_contracts" ADD CONSTRAINT "fk_fuel_contracts_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_contracts" ADD CONSTRAINT "fk_fuel_contracts_airport_id" FOREIGN KEY ("airport_id") REFERENCES "public"."airports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_tenders" ADD CONSTRAINT "fk_fuel_tenders_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_tenders" ADD CONSTRAINT "fk_fuel_tenders_airport_id" FOREIGN KEY ("airport_id") REFERENCES "public"."airports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_settings" ADD CONSTRAINT "fk_org_settings_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "fk_quotes_rfq_id" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfqs" ADD CONSTRAINT "fk_rfqs_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfqs" ADD CONSTRAINT "fk_rfqs_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_contract_invoices" ADD CONSTRAINT "fk_service_contract_invoices_service_contract_id" FOREIGN KEY ("service_contract_id") REFERENCES "public"."service_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_contracts" ADD CONSTRAINT "fk_service_contracts_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_contracts" ADD CONSTRAINT "fk_service_contracts_airport_id" FOREIGN KEY ("airport_id") REFERENCES "public"."airports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "fk_users_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "fk_vendors_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_org_airport_type_fuel_contract" ON "fuel_contracts" USING btree ("org_id","airport_id","fuel_type");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_org_rfq_number" ON "rfqs" USING btree ("rfq_number","org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_org_invoice_number" ON "service_contract_invoices" USING btree ("invoice_number","org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_org_airport_vendor_contract" ON "service_contracts" USING btree ("title","org_id","airport_id");