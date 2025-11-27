// import "./globals.css";
// import Sidebar from "./component/sidebar";
// import Navbar from "./component/Navbar";
// import { usePathname, useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

// export default function RootLayout({ children }) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [loggedIn, setLoggedIn] = useState(false);

//   useEffect(() => {
//     const auth = localStorage.getItem("auth");
//     setLoggedIn(auth === "true");

//     // If not logged in → redirect to login (except login page)
//     if (!auth && pathname !== "/login") {
//       router.push("/login");
//     }

//     // If logged in and user tries to go to /login → redirect to dashboard
//     if (auth === "true" && pathname === "/login") {
//       router.push("/dashboard");
//     }
//   }, [pathname, router]);

//   // If login page → show only login content
//   if (pathname === "/login") {
//     return (
//       <html lang="en">
//         <body className="bg-gray-100">{children}</body>
//       </html>
//     );
//   }

//   // Show full layout only if logged in
//   if (!loggedIn) {
//     return null; // Prevent flash
//   }

//   return (
//     <html lang="en">
//       <body className="flex bg-gray-100 overflow-hidden">
//         <Sidebar />

//         <div className="flex-1 flex flex-col h-screen overflow-hidden">
//           <Navbar />

//           <main className="flex-1 overflow-y-auto animate-slideInRight">
//             {children}
//           </main>
//         </div>
//       </body>
//     </html>
//   );
// }

import "./globals.css";
import AuthWrapper from "./component/AuthWrapper";

export const metadata = {
  title: "Butt & Malik Traders",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <body suppressHydrationWarning={true}>
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}