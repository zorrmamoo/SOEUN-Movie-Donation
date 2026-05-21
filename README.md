# SOEUN-Movie-Donation

A donation support website for a graduation film project. The site presents the film concept, tracks donation progress toward a funding goal, displays supporter messages with pixel-style avatars, and provides an admin workflow for verifying bank-transfer donations.

This project was built as a lightweight donation and supporter-message platform for a personal film funding campaign. The current production version supports **bank transfer only**, with manual confirmation through an admin page. Third-party payment integrations such as Toss Payments and KakaoPay were considered but not implemented because live payment settlement generally requires the recipient to have an eligible business/merchant account.

## Features

### Core Functionality

* **Donation Progress Tracking**: Displays the current donation total against the campaign goal.
* **Bank Transfer Donation Flow**: Users submit donation amount, nickname, optional message, and optional avatar after choosing bank transfer.
* **Admin Verification System**: Admin can approve or reject pending bank-transfer donations.
* **Manual Total Adjustment**: Admin can add manual positive/negative adjustments to the displayed donation total without creating fake donation records.
* **Supporter Message Display**: Approved/submitted supporter messages appear both in a message list and as floating supporter bubbles in the game-style scene.
* **Pixel Avatar Uploads**: Uploaded images are processed into pixel-style avatars before being saved and displayed.
* **Movie Information Modal**: Provides film concept details such as logline, synopsis, genre, runtime, and director note.
* **Poster Viewer**: Displays the movie poster in a modal with an enlarged viewer.

### User Experience

* Game-like visual layout with stage progression based on donation amount.
* Animated celebration effect when a donation submission is made.
* Responsive supporter display with different message limits for desktop, tablet, and mobile layouts.
* Supporter bubbles are positioned differently by screen size to reduce overlap and avoid blocking the central character.
* Separate public supporter list keeps messages readable outside the game scene.

### Admin Features

* Password-protected admin page.
* View pending bank-transfer donations.
* Approve or reject pending donation records.
* View pending donation count and pending amount.
* Add manual donation adjustments with positive or negative values.
* Server-side Supabase access for protected admin operations.

## Pages Overview

| Page                        | Route            | Description                                                                                                             |
| --------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Home / Donation Page**    | `/`              | Main public page with donation progress, supporter messages, movie info, poster viewer, and bank-transfer donation form |
| **Admin Login / Dashboard** | `/admin`         | Password-protected admin page for verifying bank transfers and applying manual total adjustments                        |
| **Donation API**            | `/api/donations` | Returns the current donation total                                                                                      |
| **Messages API**            | `/api/messages`  | Returns supporter messages from stored donation records                                                                 |
| **Payment API**             | `/api/payments`  | Creates bank-transfer donation records and uploads avatar data when provided                                            |

## Tech Stack

| Component               | Technology                                                                   |
| ----------------------- | ---------------------------------------------------------------------------- |
| Framework               | Next.js                                                                      |
| Language                | TypeScript                                                                   |
| Styling                 | CSS                                                                          |
| Database                | Supabase PostgreSQL                                                          |
| File Storage            | Supabase Storage                                                             |
| Image Processing        | Browser Canvas API                                                           |
| Hosting                 | Vercel                                                                       |

## Project Structure

```txt
app/
├── admin/
│   └── page.tsx              # Admin dashboard (pending donation review, manual adjustments)
├── api/
│   ├── donations/
│   │   └── route.ts          # Donation total endpoint
│   ├── messages/
│   │   └── route.ts          # Supporter message endpoint
│   └── payments/
│       ├── confirm/
│       │   └── route.ts      # Confirm pending donation
│       ├── create/
│       │   └── route.ts      # Create donation order
│       └── route.ts          # Main donation submission handler
├── globals.css               # Global styling for public and admin pages
├── layout.tsx                # Root layout
└── page.tsx                  # Main donation/supporter page

components/
└── AdjustmentForm.tsx        # Client component for manual adjustments

lib/
├── supabaseClient.ts         # Browser/client-side Supabase instance
└── supabaseServer.ts         # Server-side Supabase instance

public/
└── assets/                   # Static image assets such as characters, backgrounds, and poster
    ├── backgrounds/              # Stage backgrounds
    ├── characters/               # Character sprites
    └── poster.png                # Movie poster
```

## Getting Started

### Prerequisites

* Node.js
* pnpm
* Supabase project
* Vercel project for deployment

### Local Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/zorrmamoo/SOEUN-Movie-Donation.git
   cd SOEUN-Movie-Donation
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a local environment file:

   ```bash
   touch .env.local
   ```

4. Configure environment variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=<your_supabase_project_url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
   SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>
   ADMIN_PASSWORD=<your_admin_password>
   ```

5. Start the development server:

   ```bash
   pnpm dev
   ```

6. Open the local site:

   ```txt
   http://localhost:3000
   ```

### Build for Production

```bash
pnpm build
pnpm start
```

## How It Works

### Donation Flow

1. User selects or enters a donation amount.
2. User optionally enters a nickname, message, and avatar image.
3. User submits the form after choosing bank transfer.
4. The app creates a donation record in Supabase with `status = 'pending'`.
5. Admin checks the actual bank transfer externally.
6. Admin approves or rejects the pending record in `/admin`.
7. Approved donations are included in the displayed donation total.

### Admin Verification Flow

1. Admin logs in through `/admin` using a password stored in environment variables.
2. Pending bank-transfer donations are displayed in the admin dashboard.
3. Admin compares the submitted donation information against the actual bank transfer record.
4. Admin approves valid donations or rejects invalid/mismatched submissions.
5. Approved records become part of the public donation progress.

### Manual Adjustment Flow

Manual adjustments are stored separately from donation records.

This keeps the system cleaner:

```txt
donations = actual donation/payment records
donation_adjustments = manual correction records
public total = approved donations + manual adjustments
```

This avoids creating fake donation entries while still allowing the admin to correct the displayed total when needed.

### Supporter Messages and Avatar Display

1. Donation records can include a supporter message and optional avatar.
2. Uploaded images are processed in the browser into pixel-style avatars.
3. Avatar files are uploaded and stored through Supabase.
4. Supporter messages are fetched from the database.
5. The game screen displays a limited number of floating supporter bubbles depending on screen size:

   * Desktop: up to 10
   * Medium/tablet: up to 6
   * Mobile: up to 4
6. The message list below the scene provides a more readable supporter-message view.

## Database Overview

### `donations`

Stores donation submissions and verified donation records.

Common fields include:

* `id`
* `amount`
* `nickname`
* `message`
* `payment_method`
* `status`
* `order_id`
* `payment_key`
* `avatar_url`
* `created_at`
* `approved_at`

Expected statuses:

* `pending`
* `approved`
* `rejected`

Current payment method:

* `bank-transfer`

### `donation_adjustments`

Stores manual admin adjustments to the displayed total.

Common fields include:

* `id`
* `amount`
* `reason`
* `created_at`

Positive values increase the displayed total, while negative values decrease it.

## Security Notes

* Admin operations are protected behind an admin password.
* The admin password is stored in environment variables, not hardcoded.
* Server-side Supabase operations use a service role key and should only run in protected server routes/actions.
* Public users should not receive access to privileged Supabase keys.
* Row Level Security should be configured so public users cannot modify protected records directly.

## Known Limitations

* Only bank transfer is supported for production payments.
* Bank transfer verification is manual and depends on the admin checking the recipient's bank account.
* The admin login is intentionally simple and password-based.

## Deployment Notes

The project is deployed through Vercel and uses Supabase for database and storage.

The Supabase and Vercel projects are owned by the repository owner/project recipient. Other contributors may only have temporary or limited access for development and deployment support.

Required Vercel environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD
```

## Contribution Notes

This repository is owned and maintained by the project owner. Development work includes contributions across initial UI prototyping, Supabase integration, donation persistence, admin verification workflows, avatar processing, responsive layout fixes, and deployment configuration.

## License

No license has been specified yet. Please contact the repository owner for usage or redistribution permissions.
