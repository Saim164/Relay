import "./globals.css";

export const metadata = {
  title: "Relay",
  description: "Good conversations, flowing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
