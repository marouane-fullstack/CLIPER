"use client"
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider as NextThemesProvider,useTheme,type ThemeProviderProps } from 'next-themes'
import { useEffect } from "react";
import { dark } from '@clerk/themes'
import { Geist, Geist_Mono } from "next/font/google";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayoutProvider ({ children, ...props }: Readonly<ThemeProviderProps>)  {
    
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    /* 
     * If you have changed your storageKey in your <ThemeProvider storageKey="" />,
     * make sure you change it in the localStorage.getItem too.
     * default key is "theme"
     */
    const actualTheme = localStorage.getItem('your-storage-key-theme')
    setTheme(actualTheme || 'system')
  }, [setTheme])
  return (
    <NextThemesProvider {...props} attribute="class" defaultTheme="dark" enableSystem
          disableTransitionOnChange >
    <ClerkProvider appearance={{
        baseTheme: resolvedTheme === 'dark' ? dark : undefined
      }}>
    <html lang="en"  suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
    </ClerkProvider>
    </NextThemesProvider>
  );
};
