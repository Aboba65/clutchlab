import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type RouteMeta = {
  title: string;
  description: string;
};

const defaultMeta: RouteMeta = {
  title: "ClutchLab — CS2 Analytics",
  description:
    "Explore CS2 players, teams, maps, roles and roster logic in the ClutchLab analytics workspace.",
};

export function usePageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = metaFromPath(pathname);

    document.title = meta.title;

    upsertMeta("name", "description", meta.description);
    upsertMeta("property", "og:title", meta.title);
    upsertMeta("property", "og:description", meta.description);
    upsertMeta("name", "twitter:title", meta.title);
    upsertMeta("name", "twitter:description", meta.description);
  }, [pathname]);
}

function metaFromPath(pathname: string): RouteMeta {
  if (pathname === "/") {
    return {
      title: "ClutchLab — CS2 Analytics Dashboard",
      description:
        "Open the ClutchLab CS2 analytics dashboard for players, teams, maps, roles, roster building and comparison tools.",
    };
  }

  if (pathname === "/players") {
    return {
      title: "Players — ClutchLab",
      description:
        "Browse ClutchLab CS2 player profiles with role, region, price, value and rating filters.",
    };
  }

  if (pathname.startsWith("/players/")) {
    return {
      title: "Player Profile — ClutchLab",
      description:
        "Review an individual CS2 player profile with role identity, strengths, weaknesses and roster fit context.",
    };
  }

  if (pathname === "/teams") {
    return {
      title: "Teams — ClutchLab",
      description:
        "Browse ClutchLab CS2 team profiles with region, style, firepower, structure and map pool context.",
    };
  }

  if (pathname.startsWith("/teams/")) {
    return {
      title: "Team Profile — ClutchLab",
      description:
        "Review an individual CS2 team profile with identity, map tendencies and roster context.",
    };
  }

  if (pathname === "/maps") {
    return {
      title: "Maps — ClutchLab",
      description:
        "Explore CS2 map profiles, tactical identities, role fit and map pool tendencies in ClutchLab.",
    };
  }

  if (pathname.startsWith("/maps/")) {
    return {
      title: "Map Detail — ClutchLab",
      description:
        "Review a CS2 map detail page with tactical tendencies, role demands and roster fit notes.",
    };
  }

  if (pathname === "/roles") {
    return {
      title: "Roles — ClutchLab",
      description:
        "Browse CS2 role profiles and understand how roles affect player selection and roster construction.",
    };
  }

  if (pathname.startsWith("/roles/")) {
    return {
      title: "Role Detail — ClutchLab",
      description:
        "Review a CS2 role detail page with core duties, map fit and roster-building notes.",
    };
  }

  if (pathname === "/compare") {
    return {
      title: "Player Compare — ClutchLab",
      description:
        "Compare CS2 players by rating, value, roles, traits and roster-building fit.",
    };
  }

  if (pathname === "/team-compare") {
    return {
      title: "Team Compare — ClutchLab",
      description:
        "Compare CS2 teams by firepower, structure, form, map pool and tactical identity.",
    };
  }

  if (pathname === "/roster-builder") {
    return {
      title: "Roster Builder — ClutchLab",
      description:
        "Build a CS2 roster with budget checks, role coverage, value scoring and map fit context.",
    };
  }

  if (pathname === "/saved-rosters") {
    return {
      title: "Saved Rosters — ClutchLab",
      description:
        "Review CS2 roster builds saved locally in your browser through ClutchLab.",
    };
  }

  if (pathname === "/sample-data") {
    return {
      title: "Sample Data Preview — ClutchLab",
      description:
        "Preview ClutchLab sample raw stats and sample derived scores for the future real-stat data migration.",
    };
  }

  if (pathname === "/traits") {
    return {
      title: "Traits — ClutchLab",
      description:
        "Explore ClutchLab trait labels that describe CS2 player tendencies and roster value.",
    };
  }

  if (pathname === "/about") {
    return {
      title: "About — ClutchLab",
      description:
        "Read the ClutchLab methodology, current demo/manual data limits and future real-stat roadmap.",
    };
  }

  return defaultMeta;
}

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}
