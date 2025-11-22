import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PatientDashboard from "./pages/PatientDashboard";
import RespondAssessmentImproved from "./pages/RespondAssessmentImproved";
import AssessmentResults from "./pages/AssessmentResults";
import AssessmentSuccess from "./pages/AssessmentSuccess";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/patient-dashboard"} component={PatientDashboard} />
      <Route path={"/respond-assessment"} component={RespondAssessmentImproved} />
      <Route path={"/assessment-results"} component={AssessmentResults} />
      <Route path={"/assessment-success"} component={AssessmentSuccess} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
