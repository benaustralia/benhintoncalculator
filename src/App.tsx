import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import DemoPage from "@/DemoPage";

function App() {
  const [showDemo, setShowDemo] = useState(false);

  if (showDemo) {
    return (
      <div>
        <button 
          onClick={() => setShowDemo(false)}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-lg hover:bg-primary/90 transition-colors"
        >
          ← Back to Calculator
        </button>
        <DemoPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Dashboard />
      <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-12">
        <button 
          onClick={() => setShowDemo(true)}
          className="px-3 py-1 text-xs border rounded hover:bg-accent transition-colors"
        >
          View GSAP/Tailwind Demo
        </button>
      </footer>
    </div>
  );
}

export default App;
