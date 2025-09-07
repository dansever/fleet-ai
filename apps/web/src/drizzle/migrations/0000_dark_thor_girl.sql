CREATE TYPE "public"."contract_type" AS ENUM('fuel', 'ground_handling', 'catering', 'technical_mro_parts', 'airport_and_nav_charges', 'security_compliance', 'it_data_comms', 'logistics_freight', 'training_and_crew', 'insurance_and_finance', 'other');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('received', 'approved', 'paid', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."order_direction" AS ENUM('sent', 'received');--> statement-breakpoint
CREATE TYPE "public"."process_status" AS ENUM('pending', 'in_progress', 'closed');--> statement-breakpoint
CREATE TYPE "public"."urgency_level" AS ENUM('routine', 'urgent', 'aog');--> statement-breakpoint
CREATE TYPE "public"."decision" AS ENUM('open', 'shortlisted', 'rejected', 'accepted');--> statement-breakpoint
CREATE TABLE "airports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" text NOT NULL,
	"iata" text,
	"icao" text,
	"is_hub" boolean DEFAULT false,
	"city" text,
	"state" text,
	"country" text NOT NULL,
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
	"department" text,
	"role" text,
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
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"org_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contract_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"doc_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"label" text,
	"content" text NOT NULL,
	"embedding" vector(1536),
	"meta" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contract_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"contract_id" uuid NOT NULL,
	"title" text NOT NULL,
	"version" integer DEFAULT 1,
	"source_type" text,
	"storage_url" text,
	"raw_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"airport_id" uuid,
	"vendor_id" uuid,
	"title" text NOT NULL,
	"contract_type" "contract_type" NOT NULL,
	"vendor_name" text,
	"vendor_address" text,
	"vendor_contact_name" text,
	"vendor_contact_email" text,
	"vendor_contact_phone" text,
	"vendor_comments" text,
	"effective_from" date NOT NULL,
	"effective_to" date NOT NULL,
	"process_status" "process_status" DEFAULT 'pending',
	"doc_url" text,
	"summary" text,
	"commercial_terms" text,
	"slas" text,
	"edge_cases" text,
	"risk_liability" text,
	"termination_law" text,
	"operational_baselines" text,
	"tags" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fuel_bids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"tender_id" uuid NOT NULL,
	"vendor_id" uuid,
	"title" text,
	"round" integer,
	"bid_submitted_at" date,
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
CREATE TABLE "fuel_tenders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"airport_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"fuel_type" text,
	"projected_annual_volume" integer,
	"base_currency" text,
	"base_uom" text,
	"bidding_starts" date,
	"bidding_ends" date,
	"delivery_starts" date,
	"delivery_ends" date,
	"process_status" "process_status" DEFAULT 'pending',
	"winning_bid_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"doc_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"label" text,
	"content" text NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"title" text NOT NULL,
	"version" integer DEFAULT 1,
	"source_type" text,
	"storage_url" text,
	"raw_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"airport_id" uuid,
	"contract_id" uuid,
	"vendor_id" uuid,
	"invoice_number" text NOT NULL,
	"invoice_date" date,
	"vendor_name" text,
	"vendor_address" text,
	"vendor_contact_name" text,
	"vendor_contact_email" text,
	"vendor_contact_phone" text,
	"vendor_comments" text,
	"summary" text,
	"charges_narrative" text,
	"disputes_notes" text,
	"tags" jsonb DEFAULT '{}'::jsonb,
	"period_start" date,
	"period_end" date,
	"invoice_status" "invoice_status" DEFAULT 'received',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
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
	"process_status" "process_status" DEFAULT 'pending',
	"sent_at" timestamp with time zone,
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
	"process_status" "process_status" DEFAULT 'pending',
	"selected_quote_id" uuid,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "airports" ADD CONSTRAINT "fk_airports_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "fk_contacts_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "fk_contacts_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "fk_users_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "fk_vendors_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_chunks" ADD CONSTRAINT "fk_contract_chunks_contract_id" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_chunks" ADD CONSTRAINT "fk_contract_chunks_doc_id" FOREIGN KEY ("doc_id") REFERENCES "public"."contract_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_documents" ADD CONSTRAINT "fk_contract_documents_contract_id" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_documents" ADD CONSTRAINT "fk_contract_documents_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "fk_contracts_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "fk_contracts_airport_id" FOREIGN KEY ("airport_id") REFERENCES "public"."airports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "fk_contracts_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_bids" ADD CONSTRAINT "fk_fuel_bids_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_bids" ADD CONSTRAINT "fk_fuel_bids_tender_id" FOREIGN KEY ("tender_id") REFERENCES "public"."fuel_tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_bids" ADD CONSTRAINT "fk_fuel_bids_decision_by_user_id" FOREIGN KEY ("decision_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_bids" ADD CONSTRAINT "fk_fuel_bids_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_tenders" ADD CONSTRAINT "fk_fuel_tenders_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_tenders" ADD CONSTRAINT "fk_fuel_tenders_airport_id" FOREIGN KEY ("airport_id") REFERENCES "public"."airports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_chunks" ADD CONSTRAINT "fk_invoice_chunks_invoice_id" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_chunks" ADD CONSTRAINT "fk_invoice_chunks_doc_id" FOREIGN KEY ("doc_id") REFERENCES "public"."invoice_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_documents" ADD CONSTRAINT "fk_invoice_documents_invoice_id" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_documents" ADD CONSTRAINT "fk_invoice_documents_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "fk_invoices_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "fk_invoices_airport_id" FOREIGN KEY ("airport_id") REFERENCES "public"."airports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "fk_invoices_contract_id" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "fk_invoices_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "fk_quotes_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "fk_quotes_rfq_id" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfqs" ADD CONSTRAINT "fk_rfqs_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfqs" ADD CONSTRAINT "fk_rfqs_org_id" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_org_email_uniq" ON "users" USING btree ("org_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "vendors_org_name_uniq" ON "vendors" USING btree ("org_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "contract_chunks_doc_order_unique" ON "contract_chunks" USING btree ("doc_id","order");--> statement-breakpoint
CREATE INDEX "contract_chunks_embedding_hnsw" ON "contract_chunks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "contract_chunks_contract_id_idx" ON "contract_chunks" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "contract_chunks_doc_id_idx" ON "contract_chunks" USING btree ("doc_id");--> statement-breakpoint
CREATE INDEX "contract_chunks_doc_order_idx" ON "contract_chunks" USING btree ("doc_id","order");--> statement-breakpoint
CREATE UNIQUE INDEX "contract_documents_contract_version_uniq" ON "contract_documents" USING btree ("contract_id","version");--> statement-breakpoint
CREATE INDEX "contract_documents_org_id_idx" ON "contract_documents" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "contracts_org_id_idx" ON "contracts" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "contracts_airport_id_idx" ON "contracts" USING btree ("airport_id");--> statement-breakpoint
CREATE INDEX "contracts_vendor_id_idx" ON "contracts" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "contracts_type_idx" ON "contracts" USING btree ("contract_type");--> statement-breakpoint
CREATE INDEX "contracts_effective_range_idx" ON "contracts" USING btree ("effective_from","effective_to");--> statement-breakpoint
CREATE INDEX "invoice_chunks_embedding_hnsw" ON "invoice_chunks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "invoice_chunks_invoice_id_idx" ON "invoice_chunks" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "invoice_chunks_doc_id_idx" ON "invoice_chunks" USING btree ("doc_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_chunks_doc_order_unique" ON "invoice_chunks" USING btree ("doc_id","order");--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_documents_invoice_version_uniq" ON "invoice_documents" USING btree ("invoice_id","version");--> statement-breakpoint
CREATE INDEX "invoice_documents_invoice_created_idx" ON "invoice_documents" USING btree ("invoice_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_vendor_number_uniq" ON "invoices" USING btree ("org_id","vendor_id","invoice_number");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("invoice_status");--> statement-breakpoint
CREATE INDEX "invoices_period_idx" ON "invoices" USING btree ("period_start","period_end");--> statement-breakpoint
CREATE INDEX "invoices_tags_gin" ON "invoices" USING gin ("tags");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_org_rfq_number" ON "rfqs" USING btree ("rfq_number","org_id");