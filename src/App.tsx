import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Startups from "./pages/Startups";
import StartupDetail from "./pages/StartupDetail";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
import Team from "./pages/Team";
import Marketplace from "./pages/Marketplace";
import PitchDeck from "./pages/PitchDeck";
import PitchVideo from "./pages/PitchVideo";
import AISuggestions from "./pages/AISuggestions";
import CreateStartup from "./pages/CreateStartup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Founder onboarding - create startup after registration */}
            <Route path="/create-startup" element={<CreateStartup />} />
            
            {/* Protected routes - all authenticated users */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/startups" element={<ProtectedRoute><Startups /></ProtectedRoute>} />
            <Route path="/startups/:id" element={<ProtectedRoute><StartupDetail /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            
            {/* Team/Talent - founders, investors, mentors */}
            <Route path="/team" element={
              <ProtectedRoute allowedRoles={["founder", "investor", "mentor"]}>
                <Team />
              </ProtectedRoute>
            } />
            
            {/* Marketplace - customers, founders */}
            <Route path="/marketplace" element={
              <ProtectedRoute allowedRoles={["customer", "founder"]}>
                <Marketplace />
              </ProtectedRoute>
            } />
            
            {/* Pitch tools - founders only */}
            <Route path="/startups/:startupId/pitch-deck/:deckId" element={
              <ProtectedRoute allowedRoles={["founder"]}>
                <PitchDeck />
              </ProtectedRoute>
            } />
            <Route path="/startups/:startupId/pitch-video/:videoId" element={
              <ProtectedRoute allowedRoles={["founder"]}>
                <PitchVideo />
              </ProtectedRoute>
            } />
            
            {/* AI Suggestions - founders only */}
            <Route path="/ai-suggestions" element={
              <ProtectedRoute allowedRoles={["founder"]}>
                <AISuggestions />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
