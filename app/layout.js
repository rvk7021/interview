import "./globals.css"; // Import global styles
import { MediaProvider } from "./context/MediaContext";

export const metadata = {
  title: "Interview App",
  description: "A modern interview app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MediaProvider>{children}</MediaProvider>
      </body>
    </html>
  );
}
