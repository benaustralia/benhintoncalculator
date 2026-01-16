import { Dashboard } from "@/components/Dashboard";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Dashboard />
      <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-12">
        <p>TutorTerm 2026 Calculator &copy; 2026</p>
        <p className="text-xs mt-1 opacity-70">
          Source: Victorian Government Schools Calendar • Build: {__COMMIT_HASH__}
        </p>
      </footer>
    </div>
  );
}

export default App;
