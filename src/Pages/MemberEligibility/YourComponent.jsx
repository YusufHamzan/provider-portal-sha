// import React, { useEffect } from "react";

// const YourComponent = (token) => {
//   const parts = token.split('.');

//   if (parts.length !== 3) {
//     console.error('Invalid JWT format');
//     return null;
//   }

//   const base64Url = parts[1];

//   try {
//     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//     const jsonPayload = decodeURIComponent(
//       atob(base64)
//         .split('')
//         .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
//         .join('')
//     );

//     return JSON.parse(jsonPayload);
//   } catch (error) {
//     console.error('Error decoding JWT:', error);
//     return null;
//   }
// };
