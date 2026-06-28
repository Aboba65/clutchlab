import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { PlayersPage } from "./pages/PlayersPage";
import { TeamsPage } from "./pages/TeamsPage";
import { MapsPage } from "./pages/MapsPage";
import { TraitsPage } from "./pages/TraitsPage";
import { SavedRostersPage } from "./pages/SavedRostersPage";
import { TeamComparePage } from "./pages/TeamComparePage";
import { ComparePage } from "./pages/ComparePage";
import { RosterBuilderPage } from "./pages/RosterBuilderPage";
import { RolesPage } from "./pages/RolesPage";
import { RoleDetailPage } from "./pages/RoleDetailPage";
import { MapDetailPage } from "./pages/MapDetailPage";
import { PlayerDetailPage } from "./pages/PlayerDetailPage";
import { TeamDetailPage } from "./pages/TeamDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AppShell } from "./components/AppShell";

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/players/:playerId" element={<PlayerDetailPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/:teamId" element={<TeamDetailPage />} />
          <Route path="/maps" element={<MapsPage />} />
          <Route path="/maps/:mapId" element={<MapDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/team-compare" element={<TeamComparePage />} />
          <Route path="/roster-builder" element={<RosterBuilderPage />} />
          <Route path="/saved-rosters" element={<SavedRostersPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/roles/:roleId" element={<RoleDetailPage />} />
          <Route path="/builder" element={<Navigate to="/roster-builder" replace />} />
          <Route path="/traits" element={<TraitsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
