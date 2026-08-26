import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import HotelDetailsPage from './pages/HotelDetailsPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import BookingLookupPage from './pages/BookingLookupPage';
import StaffLoginPage from './pages/StaffLoginPage';
import StaffLayout from './pages/staff/StaffLayout';
import StaffReservationsPage from './pages/staff/StaffReservationsPage';
import StaffHotelsPage from './pages/staff/StaffHotelsPage';
import StaffRoomsPage from './pages/staff/StaffRoomsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/hotels/:hotelId" element={<HotelDetailsPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/booking/confirmation/:reservationId" element={<BookingConfirmationPage />} />
            <Route path="/lookup" element={<BookingLookupPage />} />
            <Route path="/staff/login" element={<StaffLoginPage />} />
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<Navigate to="/staff/reservations" replace />} />
              <Route path="reservations" element={<StaffReservationsPage />} />
              <Route path="hotels" element={<StaffHotelsPage />} />
              <Route path="rooms" element={<StaffRoomsPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
