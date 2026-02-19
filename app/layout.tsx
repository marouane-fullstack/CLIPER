import { Toaster } from "sonner";
import "./globals.css";
import RootLayoutProvider from "@/components/RootLayoutProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootLayoutProvider>{children}</RootLayoutProvider>
         <Toaster richColors />
      </body>
    </html>
  );
}