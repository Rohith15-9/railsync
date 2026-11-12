# RailSync — Intelligent Railway Reservation Prototype

A Next.js + TypeScript + CSS frontend prototype inspired by the supplied RailSync reference website.

## Included
- Landing page and train search
- Sample train timetable and class availability
- Passenger details flow (up to six passengers)
- Demo booking confirmation and generated PNR
- PNR enquiry
- Booking history and individual passenger cancellation
- Simplified CNF → RAC-like → WL promotion demonstration
- Admin dashboard with sample train CRUD
- Browser localStorage persistence
- Responsive desktop and mobile layout
- API integration points to replace with a Java Spring Boot backend

## Run locally
1. Install Node.js 20 or newer.
2. Extract this project.
3. In the project folder run:
   ```bash
   npm install
   npm run dev
   ```
4. Open http://localhost:3000

## Deploy to Vercel
1. Push this folder to a GitHub repository.
2. In Vercel choose **Add New → Project** and import the repository.
3. Framework preset: Next.js (auto-detected).
4. Deploy.

## Important prototype limitations
- All bookings are simulated and stored in the current browser's localStorage.
- Demo login is not real authentication.
- Payment is simulated; no card or payment data is collected.
- Sample train data and seat counts are illustrative.
- The in-browser promotion routine is a demonstration only. It is not safe for concurrent real-world reservations.
- The next development step is to connect the UI to a Java Spring Boot REST API and a transactional database. Seat allocation, PNR uniqueness, queue ordering, and cancellation promotion must be enforced by the backend in database transactions.
- This project is not affiliated with Indian Railways or IRCTC. Tickets generated here are not valid for travel.

## Suggested Java API contract
- `GET /api/trains/search?from=&to=&date=&class=`
- `GET /api/trains/{trainId}/availability?date=&class=`
- `POST /api/bookings`
- `GET /api/bookings/{pnr}`
- `GET /api/users/me/bookings`
- `POST /api/bookings/{pnr}/passengers/{passengerId}/cancel`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/admin/dashboard`
- `POST /api/admin/trains`
- `PUT /api/admin/trains/{trainId}`
- `DELETE /api/admin/trains/{trainId}`

Keep API calls in a dedicated service layer when backend integration begins. Never put production secrets in frontend environment variables.
