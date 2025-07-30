import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Home from "@/pages/home";
import Settings from "@/pages/settings";
import Dashboard from "@/pages/dashboard";
import Services from "@/pages/dashboard/services";
import Company from "@/pages/dashboard/company";
import Invoices from "@/pages/dashboard/invoices";
import PaymentMethods from "@/pages/dashboard/payment-methods";
import Templates from "@/pages/dashboard/templates";
import CreateInvoice from "@/pages/dashboard/create-invoice";
import Team from "@/pages/dashboard/team";
import Login from "@/pages/auth/login";
import SignUp from "@/pages/auth/signup";
import ForgotPassword from "@/pages/auth/forgot-password";
import ResetPassword from "@/pages/auth/reset-password";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/services">
        <ProtectedRoute>
          <Services />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/company">
        <ProtectedRoute>
          <Company />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/invoices">
        <ProtectedRoute>
          <Invoices />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/payment-methods">
        <ProtectedRoute>
          <PaymentMethods />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/templates">
        <ProtectedRoute>
          <Templates />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/create-invoice">
        <ProtectedRoute>
          <CreateInvoice />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/team">
        <ProtectedRoute>
          <Team />
        </ProtectedRoute>
      </Route>
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/signup" component={SignUp} />
      <Route path="/auth/forgot-password" component={ForgotPassword} />
      <Route path="/auth/reset-password" component={ResetPassword} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
