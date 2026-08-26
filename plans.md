# Implementation Plan

## Phase 1: Project Foundation and Design System

**Goal**: Stand up the web app skeleton with routing, base pages, and Forest Earth theming in light/dark mode.

### Tasks
1. [x] Confirm the modern stack (Vite + React + TypeScript + Tailwind) is in place from the scaffold; linting/formatting duties are covered by the project toolchain (`tsc --noEmit` + `vite build`), so no extra ESLint/Prettier config files are required.
2. [x] Define global CSS variables for the Forest Earth palette in `src/index.css`:
   - Light mode: `--background: #f7fee7`, `--surface: #ffffff`, `--accent: #4d7c0f`, `--text: #1a2e05`.
   - Dark mode: `--background: #1a2e05`, `--surface: #243c06`, `--accent: #4d7c0f`, `--text: #f7fee7`.
3. [x] Extend `tailwind.config.js` with the Forest Earth palette (`forest` scale) and reuse it across pages.
4. [x] Implement a theme store (Zustand) that reads the user's system preference on first load, allows manual toggling, and persists the choice in `localStorage`.
5. [x] Build a shared navigation header (brand, guest links, staff link, mobile menu) plus a footer; both work in light and dark modes.
6. [x] Add base routes with placeholders for every page the app will eventually have: `/` (home), `/search`, `/hotels/:hotelId`, `/booking`, `/booking/confirmation/:reservationId`, `/lookup` (my booking), `/staff/login`, and the protected staff area `/staff/reservations`, `/staff/hotels`, `/staff/rooms`.
7. [x] Add a home page with a working search form (city, dates, guests) that submits to `/search` to verify routing, plus a light/dark toggle in the header.

### Exit Criteria
- The app starts locally and all base routes render.
- A visible light/dark toggle changes the page theme correctly on all base pages.
- The Forest Earth palette is applied through theme-aware CSS variables.

## Phase 2: Data Models and Seed Data

**Goal**: Define the data layer for hotels, rooms, and reservations, with representative seed data.

### Tasks
1. [x] Define TypeScript types in `src/types.ts`: `User` (`GUEST`/`STAFF`), `Hotel`, `Room`, `Reservation` with status (`PENDING`, `CONFIRMED`, `CANCELLED`, `CHECKED_IN`, `CHECKED_OUT`), and search/booking input shapes.
2. [x] Create a repository/service layer (Zustand store persisted to `localStorage`) to query and mutate hotels, rooms, and reservations.
3. [x] Add seed data: at least 5 hotels in different cities with varied amenities, 2+ room types per hotel with realistic prices, and a demo staff user `staff@hotel.app` / `staff123`.
4. [x] Add availability validation logic: a room is unavailable if overlapping dates exist in a reservation whose status is not `CANCELLED`.

### Exit Criteria
- Data can be reset and re-seeded from one entry point.
- There are at least 5 hotels and 2+ room types per hotel.
- Overlapping reservations block a room and non-overlapping reservations do not.

## Phase 3: Service Layer for Guest and Staff Operations

**Goal**: Implement the data-access functions that back search, details, booking, and staff operations (in-browser, since this is a frontend-only app).

### Tasks
1. [x] `searchHotels({ city, checkIn, checkOut, guests })` → hotels with rooms available for the given dates and party size.
2. [x] `getHotel(id)` → hotel details, room types, and amenities.
3. [x] `getAvailableRooms(hotelId, { checkIn, checkOut, guests })` → available rooms for the selected dates.
4. [x] `createReservation(...)` → creates a reservation without any payment step; validates guest info, hotel/room existence, date range, and availability; returns a confirmation ID.
5. [x] `getReservation(id)` → reservation details for confirmation purposes.
6. [x] `staffLogin(email, password)` → authenticates a staff user and sets the staff session.
7. [x] `getAllReservations()` and `updateReservationStatus(id, status)` for the staff dashboard.
8. [x] Input validation for all operations; role checks on staff operations reject guest sessions.

### Exit Criteria
- Search only returns hotels/rooms that are available for the requested dates and guest count.
- Creating a reservation succeeds and returns a confirmation ID.
- Staff operations reject guest sessions and allow staff users.

## Phase 4: Guest-Facing Booking Flow

**Goal**: Implement the complete guest journey: search, inspect details, book, and confirm.

### Tasks
1. [x] Build the home page search form: city, check-in, check-out, number of guests; submit to the search results page.
2. [x] Build the search results page: hotel cards with name, city, star rating, price from, and availability summary; link each card to the hotel details page.
3. [x] Build the hotel details page: full hotel info, amenities, photo gallery (gradient/icon art), and room list; for each room show capacity, price, amenities, and availability; include a "Book" button per available room.
4. [x] Build the booking flow: pre-fill hotel, room, and dates from query parameters; collect guest name, email, and optional phone; validate check-out is after check-in and rooms are still available; create the reservation and show a confirmation screen with the reservation ID and human-readable details.
5. [x] Add clear messaging when no hotels/rooms are available.
6. [x] Ensure all guest pages work in both light and dark Forest Earth modes.

### Exit Criteria
- A guest can search, select a hotel, select a room, enter details, book, and see a confirmation from end to end.
- No payment/financial form appears anywhere in the guest flow.
- Attempting to book an already-booked room shows a validation error.

## Phase 5: Staff Dashboard and Reservations Management

**Goal**: Give hotel staff the ability to review and manage reservations and hotel inventory.

### Tasks
1. [x] Build the staff login page: email/password form; on success, redirect to the staff dashboard.
2. [x] Build the staff dashboard layout: protected route that redirects unauthenticated users to `/staff/login`; top navigation with "Reservations", "Hotels", and "Rooms".
3. [x] Build the reservations management page: table of reservations with guest, hotel, room, dates, and status; filter by status; allow status updates.
4. [x] Build the hotel management page: list hotels; create/edit hotel details and amenities.
5. [x] Build the room management page: add/edit/remove rooms within a hotel; set price, capacity, type, and amenities.
6. [x] Ensure all staff pages use the same Forest Earth theme and support dark mode.

### Exit Criteria
- Staff can log in and access the dashboard.
- Staff can see all reservations and change their status.
- Staff can add or edit hotels and rooms, and those changes appear on the public guest side immediately.
- Unauthenticated users cannot access staff pages.

## Phase 6: End-to-End Integration and Polish

**Goal**: Verify every flow works together and tighten performance, accessibility, and visual polish.

### Tasks
1. [x] Integrate all guest and staff flows into one continuous user journey with a global navigation header (Home, Search, "My Booking", Theme Toggle).
2. [x] Build the booking lookup page: guests enter a reservation ID and view their reservation without logging in.
3. [x] Test empty states: no hotels match, no rooms available, reservation not found.
4. [x] Validate responsive design for mobile, tablet, and desktop; run contrast checks against the Forest Earth palette in both themes.
5. [x] End-to-end verification: guest search → details → booking → confirmation; staff login → dashboard → status change → guest sees updated reservation; dark mode toggle persists across pages.

### Exit Criteria
- All primary guest and staff paths work end to end.
- The app is responsive and accessible with both light and dark themes.
- No payment hooks or payment processing UI exist anywhere in the app.
- Existing working behavior from earlier phases is preserved and no unrelated regressions are introduced.

## Phase 7: Complete the Hotel Details and Staff Reservations Pages

**Goal**: Replace the remaining stand-in behaviour on the two flagged pages with fully reactive, store-driven pages — live data from the store, working interactions, and no placeholder-flavoured copy anywhere.

### Tasks
1. [x] Make `HotelDetailsPage` reactive to the data store so hotel details, room inventory, and per-date availability re-render immediately when store data changes (staff inventory edits or newly confirmed bookings).
2. [x] Verify the hotel details page renders real store content end to end: gallery art, description, amenities, room list with capacity/price/amenities, per-room availability for the chosen dates, and Book links that carry hotel/room/dates/guests into `/booking`.
3. [x] Verify the staff reservations page is driven by live store data: enriched reservation table (guest, stay, hotel/room, total), status tab filters with counts, and per-row status updates with success/error notices.
4. [x] Remove the placeholder-flavoured empty-state copy on `StaffReservationsPage` ("...will appear here...") and replace it with concrete, useful guidance.
5. [x] Confirm both pages type-check, build, and render without console errors in light and dark modes.

### Exit Criteria
- Both pages show real content from the store with working interactions and no placeholder copy.
- A new booking or staff inventory edit is reflected on the hotel details page without a reload.
- Staff can filter and update reservation statuses and see the changes reflected instantly.
