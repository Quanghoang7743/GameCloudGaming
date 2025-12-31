import type { Metadata } from "next";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { darkTheme } from "./theme";
import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";
import CursorTrail from "@/components/cursorEffect/cursoreffect";

export const metadata: Metadata = {
  title: "VixeX - Game Streaming",
  description: "Stream your PC games to the browser",
  manifest: "/manifest.json",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    title: "VixeX",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <CursorTrail />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
