import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Skeleton from "./components/Skeleton.jsx";

const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const StatusExplorer = lazy(() => import("./pages/StatusExplorer.jsx"));
const ApiTester = lazy(() => import("./pages/ApiTester.jsx"));
const Favorites = lazy(() => import("./pages/Favorites.jsx"));

function PageFallback() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Skeleton className="skeleton title" width="40%" />
      <Skeleton className="skeleton text" width="70%" />
      <div className="grid-cards">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div className="code-card" key={idx}>
            <Skeleton className="skeleton title" width="35%" />
            <Skeleton className="skeleton text" width="80%" />
            <Skeleton className="skeleton text" width="100%" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/explorer" element={<StatusExplorer />} />
            <Route path="/tester" element={<ApiTester />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
