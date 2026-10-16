import "./globals.css";
import Navbar from "../components/Navbar.js";

export const metadata = {
  title: "Relay",
  description: "Good conversations, flowing.",
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
