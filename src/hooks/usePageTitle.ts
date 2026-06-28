import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const defaultTitle = "ClutchLab — CS2 Analytics";

function titleFromPath(pathname: string) {
  if (pathname === "/") {
    return defaultTitle;
  }

  if (pathname === "/players") {
    return "ClutchLab — Players";
  }

  if (pathname.startsWith("/players/")) {
    return "ClutchLab — Player Profile";
  }

  if (pathname === "/teams") {
    return "ClutchLab — Teams";
  }

  if (pathname.startsWith("/teams/")) {
    return "ClutchLab — Team Profile";
  }

  if (pathname === "/maps") {
    return "ClutchLab — Maps";
  }

  if (pathname.startsWith("/maps/")) {
    return "ClutchLab — Map Detail";
  }

  if (pathname === "/roles") {
    return "ClutchLab — Roles";
  }

  if (pathname.startsWith("/roles/")) {
    return "ClutchLab — Role Detail";
  }

  if (pathname === "/compare") {
    return "ClutchLab — Player Compare";
  }

  if (pathname === "/team-compare") {
    return "ClutchLab — Team Compare";
  }

  if (pathname === "/roster-builder" || pathname === "/builder") {
    return "ClutchLab — Roster Builder";
  }

  if (pathname === "/saved-rosters") {
    return "ClutchLab — Saved Rosters";
  }

  if (pathname === "/traits") {
    return "ClutchLab — Traits";
  }

  if (pathname === "/about") {
    return "ClutchLab — About";
  }

  return "ClutchLab — Not Found";
}

export function usePageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = titleFromPath(pathname);
  }, [pathname]);
}
