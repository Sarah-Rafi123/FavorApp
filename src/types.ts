export interface User {
  id: string;
  firstName: string;
  email: string;
}

// Routes
export type AppRoutes = {
  // Tabs
  'home': any;
  // ...

  // Root Stack
  'splash-screen': any;
  'auth-screen': any;

  // Home Stack
  'home-screen': any;

};
