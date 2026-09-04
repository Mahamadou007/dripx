# DripX+ — Developer Continuity Guide

## Purpose

DripX+ is a French/English marketplace for men's clothing businesses in Kayes, Mali. It is a multi-vendor catalogue and order-request tool: buyers discover products and contact local sellers; payment and fulfilment happen offline through cash, mobile money, or WhatsApp.

The current front end is a self-contained product prototype with local demo data. It deliberately has no payment provider and no dependency on a hosted backend, so the project can be exported and connected to a self-hosted Supabase instance later.

## Product roles

| Role | Capabilities |
| --- | --- |
| `admin` | Review vendor applications; approve/reject sellers; see all vendors, products, and orders. |
| `vendor` | Register, wait for approval, manage storefront information, publish products, and receive order requests with buyer details. |
| `buyer` | Browse/search approved listings, select a size, submit an order request, and message the seller on WhatsApp. |

## Proposed data model (Supabase/Postgres)

### `profiles`

`id uuid primary key references auth.users`, `full_name text`, `phone text`, `role user_role`, `preferred_locale text default 'fr'`, `created_at timestamptz`.

`user_role` enum: `admin`, `vendor`, `buyer`.

### `vendors`

`id uuid primary key`, `owner_id uuid references profiles(id)`, `store_name text`, `slug text unique`, `phone text`, `whatsapp_number text`, `address text`, `description_fr text`, `description_en text`, `logo_url text`, `cover_url text`, `approval_status approval_status`, `reviewed_by uuid references profiles(id)`, `reviewed_at timestamptz`, `rejection_reason text`, `created_at timestamptz`, `updated_at timestamptz`.

`approval_status` enum: `pending`, `approved`, `rejected`, `suspended`. Only `approved` vendors are publicly visible.

### `categories`

`id uuid primary key`, `slug text unique`, `name_fr text`, `name_en text`, `sort_order int`.

### `products`

`id uuid primary key`, `vendor_id uuid references vendors(id)`, `category_id uuid references categories(id)`, `title_fr text`, `title_en text`, `description_fr text`, `description_en text`, `price_xof integer`, `sizes text[]`, `stock_status stock_status`, `quantity integer`, `is_published boolean`, `created_at timestamptz`, `updated_at timestamptz`.

`stock_status` enum: `in_stock`, `low_stock`, `out_of_stock`. A public product must belong to an approved vendor, have `is_published = true`, and be in stock.

### `product_images`

`id uuid primary key`, `product_id uuid references products(id) on delete cascade`, `storage_path text`, `alt_fr text`, `alt_en text`, `position int`, `created_at timestamptz`.

Use a private-to-write/public-to-read (or signed URL) Supabase Storage bucket such as `product-images`; store paths, not permanent generated URLs.

### `orders`

`id uuid primary key`, `order_number text unique`, `vendor_id uuid references vendors(id)`, `buyer_id uuid references profiles(id) null`, `buyer_name text`, `buyer_phone text`, `delivery_address text`, `note text`, `status order_status`, `created_at timestamptz`, `updated_at timestamptz`.

`order_status` enum: `new`, `confirmed`, `preparing`, `ready`, `completed`, `cancelled`.

### `order_items`

`id uuid primary key`, `order_id uuid references orders(id) on delete cascade`, `product_id uuid references products(id)`, `product_title_snapshot text`, `unit_price_xof integer`, `size text`, `quantity integer`.

Snapshot name and price in each line item so old orders remain accurate after a seller changes a product.

## Essential flows

1. **Vendor signup and review.** Create an auth user and `profiles` row with role `vendor`; create a matching `vendors` row with `approval_status = 'pending'`. An admin sets it to `approved` or `rejected`. Do not expose the storefront or products until approved.
2. **Product publishing.** An approved vendor uploads images, then creates/updates a product. The client should enforce friendly checks; database/RLS must enforce vendor ownership and approved status.
3. **Order request.** A buyer selects one product and size, then submits name, phone, address, and note. Insert `orders` plus `order_items`; no payment record is created. The seller sees the new request in their Orders area.
4. **WhatsApp contact.** Build links as `https://wa.me/<digits-only-number>?text=<encoded prefilled message>`. Store each vendor's country-code phone number (Mali: `223…`) in `vendors.whatsapp_number`. Never include online-payment language in the message.

## Security and RLS conventions

- Admin access must be determined by a database-backed profile/claim, never only by hiding UI.
- Buyers can read only approved vendors and published/in-stock products; they may create orders, and should only read their own orders.
- Vendors can read/update only their own vendor row/products/images and read/update orders where `orders.vendor_id` is their vendor.
- Admins can read all rows and change vendor approval.
- Validate `price_xof >= 0`, `quantity >= 0`, a non-empty title, and ownership on every write. Use integer XOF values; do not use floating point.
- Use a server function/Edge Function or secure RPC for multi-row order creation and for any action that must check vendor approval atomically.

## Front-end conventions

- French is the initial locale; English is switched client-side. All user-facing copy must have both translations.
- The front end uses React Router with dedicated pages: `/` (home), `/shop` (catalogue), `/vendors` (approved storefronts), `/vendor/dashboard` (seller operations), and `/admin` (marketplace moderation). Keep operational portals out of the public landing-page hierarchy.
- Currency is displayed as `12 500 XOF` / `F CFA`, not a payment checkout.
- Visual language: ink-black foundation, bone-white cards, saturated red as the action colour, generous editorial spacing. The DripX+ mark is rendered as type until a production vector asset is supplied.
- Sample data is intentionally marked as demo content. Replace it with Supabase queries rather than preserving it as production source of truth.
- The prototype's `MarketplaceProvider` is the temporary shared client-side state layer: product requests are added to `orders`, and vendor approval changes `vendors.status`. The vendor dashboard, admin portal, and approved-vendor directory all consume this same state. It is intentionally session-only; replace provider actions with Supabase mutations/subscriptions during backend integration.
- Keep buyer/order contact data visible only to the relevant seller and admins.

## Suggested implementation sequence for self-hosted Supabase

1. Create enums, tables, indexes, constraints, and `updated_at` triggers.
2. Create a profile trigger from `auth.users`; seed a protected initial admin through server-side SQL.
3. Configure Storage and RLS policies, then implement registration/approval.
4. Replace local catalogue data with public read queries and the vendor dashboard with authenticated mutations.
5. Implement atomic order creation and test policies with buyer, pending vendor, approved vendor, and admin accounts.
