"use client"

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import {Navigation}  from "@/components/navigation"
import { useRouter } from "next/router"
import JsonEditorExamplePage from "./json-editor-example/page"
import { usePathname } from "next/navigation"
const inter = Inter({ subsets: ["latin"] })



// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={inter.className} suppressHydrationWarning>
//          <>
//           <Navigation />

//         <AuthProvider>{children}</AuthProvider>
//         </>
//       </body>
//     </html>
//   )
// }

export default function RootLayout({ children }: { children: React.ReactNode }) {
   const pathname = usePathname()

  if (pathname === '/json-editor-example') {
    return (
         <html lang="en" suppressHydrationWarning>
     <body className={inter.className} suppressHydrationWarning>
      
      <AuthProvider>
        <JsonEditorExamplePage />
      </AuthProvider>
      </body>
    </html>
    );
  }
    if (pathname === '/second-page') {
        return (
               <html lang="en" suppressHydrationWarning>
     <body className={inter.className} suppressHydrationWarning>
      
          <AuthProvider>
            <JsonEditorExamplePage />
          </AuthProvider>
                </body>
    </html>
        );
      }
  return (
        <html lang="en" suppressHydrationWarning>
     <body className={inter.className} suppressHydrationWarning>
      
    <AuthProvider>
      {children}
    </AuthProvider>
                    </body>
    </html>
  );
}