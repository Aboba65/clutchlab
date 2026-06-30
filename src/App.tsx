import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AboutPage } from "./pages/AboutPage";
import { ComparePage } from "./pages/ComparePage";
import { HomePage } from "./pages/HomePage";
import { MapsPage } from "./pages/MapsPage";
import { MapDetailPage } from "./pages/MapDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PlayerDetailPage } from "./pages/PlayerDetailPage";
import { PlayersPage } from "./pages/PlayersPage";
import { RolesPage } from "./pages/RolesPage";
import { RoleDetailPage } from "./pages/RoleDetailPage";
import { RosterBuilderPage } from "./pages/RosterBuilderPage";
import { SampleDataPage } from "./pages/SampleDataPage";
import { SavedRostersPage } from "./pages/SavedRostersPage";
import { TeamComparePage } from "./pages/TeamComparePage";
import { TeamDetailPage } from "./pages/TeamDetailPage";
import { TeamsPage } from "./pages/TeamsPage";
import { TraitsPage } from "./pages/TraitsPage";

export default function App() {
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
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/roles/:roleId" element={<RoleDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/team-compare" element={<TeamComparePage />} />
          <Route path="/roster-builder" element={<RosterBuilderPage />} />
          <Route path="/saved-rosters" element={<SavedRostersPage />} />
          <Route path="/sample-data" element={<SampleDataPage />} />
          <Route path="/traits" element={<TraitsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/builder" element={<Navigate to="/roster-builder" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
