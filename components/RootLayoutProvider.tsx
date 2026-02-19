"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { dark } from "@clerk/themes";
import { Poppins,Orbitron} from "next/font/google";

const orbitron = Orbitron({
    subsets: ["latin"],
  variable: "--font-orbitron",
  weight: "900",
})

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "700"],
});


function ClerkThemeWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
      }}
    >
      {children}
    </ClerkProvider>
  );
}

export default function RootLayoutProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <ClerkThemeWrapper>
        <div  className={`${poppins.variable} ${orbitron.variable}`}>
          {children}
        </div>
      </ClerkThemeWrapper>
    </NextThemesProvider>
  );
}