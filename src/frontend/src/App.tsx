import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Route as rootRoute } from "./routes/__root";
import { Route as adminRoute } from "./routes/admin";
import { Route as cartRoute } from "./routes/cart";
import { Route as checkoutRoute } from "./routes/checkout";
import { Route as homeRoute } from "./routes/index";
import { Route as ordersRoute } from "./routes/orders";
import { Route as productRoute } from "./routes/product.$id";
import { Route as thankYouRoute } from "./routes/thank-you";

const routeTree = rootRoute.addChildren([
  homeRoute,
  productRoute,
  cartRoute,
  checkoutRoute,
  thankYouRoute,
  ordersRoute,
  adminRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
