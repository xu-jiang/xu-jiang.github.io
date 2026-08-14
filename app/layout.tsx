import "./globals.css";
import Header from "./components/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black font-sans selection:bg-none antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}