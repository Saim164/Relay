import "./globals.css";
import Navbar from "../components/Navbar.jsx";

export const metadata = {
  title: "Relay",
  description:
    "Relay is an evolving portfolio and learning project for building a modern messaging app.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
