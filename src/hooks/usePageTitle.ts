import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type RouteMeta = {
  title: string;
  description: string;
};

const defaultMeta: RouteMeta = {
  title: "ClutchLab — CS2 Analytics",
  description:
    "ClutchLab is a CS2 analytics MVP for exploring players, teams, maps, roles, roster construction and matchup comparison.",
};

function metaFromPath(pathname: string): RouteMeta {
  if (pathname === "/") {
    return defaultMeta;
  }

  if (pathname === "/players") {
    return {
      title: "ClutchLab — Players",
      description:
        "Explore the ClutchLab CS2 player catalog with roles, ratings, prices, map fit and roster-building context.",
    };
  }

  if (pathname.startsWith("/players/")) {
    return {
      title: "ClutchLab — Player Profile",
      description:
        "Review an individual CS2 player profile with role identity, impact metrics, map fit and roster-building value.",
    };
  }

  if (pathname === "/teams") {
    return {
      title: "ClutchLab — Teams",
      description:
        "Explore CS2 team profiles with firepower, structure, clutch value, form and map pool identity.",
    };
  }

  if (pathname.startsWith("/teams/")) {
    return {
      title: "ClutchLab — Team Profile",
      description:
        "Review a CS2 team profile with roster identity, score breakdown, preferred maps and matchup context.",
    };
  }

  if (pathname === "/maps") {
    return {
      title: "ClutchLab — Maps",
      description:
        "Explore the ClutchLab CS2 map catalog with side profiles, tactical identity and player fit context.",
    };
  }

  if (pathname.startsWith("/maps/")) {
    return {
      title: "ClutchLab — Map Detail",
      description:
        "Review a CS2 map detail page with tactical profile, side tendencies, role pressure and roster fit notes.",
    };
  }

  if (pathname === "/roles") {
    return {
      title: "ClutchLab — Roles",
      description:
        "Explore CS2 role profiles including AWP, IGL, entry, lurk, anchor and support responsibilities.",
    };
  }

  if (pathname.startsWith("/roles/")) {
    return {
      title: "ClutchLab — Role Detail",
      description:
        "Review a CS2 role detail page with responsibilities, strengths, weaknesses and roster-building context.",
    };
  }

  if (pathname === "/compare") {
    return {
      title: "ClutchLab — Player Compare",
      description:
        "Compare CS2 players across impact, role value, clutch ability, map fit and roster-building metrics.",
    };
  }

  if (pathname === "/team-compare") {
    return {
      title: "ClutchLab — Team Compare",
      description:
        "Compare CS2 teams across firepower, structure, map pool, clutch value, form and roster identity.",
    };
  }

  if (pathname === "/roster-builder" || pathname === "/builder") {
    return {
      title: "ClutchLab — Roster Builder",
      description:
        "Build a CS2 roster with budget checks, role coverage, player value, map fit and roster warnings.",
    };
  }

  if (pathname === "/saved-rosters") {
    return {
      title: "ClutchLab — Saved Rosters",
      description:
        "Review saved ClutchLab CS2 rosters stored in the browser with budget, value and role coverage summaries.",
    };
  }

  if (pathname === "/traits") {
    return {
      title: "ClutchLab — Traits",
      description:
        "Explore ClutchLab CS2 player and team traits used to describe playstyle, strengths and roster identity.",
    };
  }

  if (pathname === "/about") {
    return {
      title: "ClutchLab — About",
      description:
        "Learn how ClutchLab works, what its demo/manual data means and how its MVP analytics methodology is structured.",
    };
  }

  return {
    title: "ClutchLab — Not Found",
    description:
      "The requested ClutchLab page could not be found. Use the main navigation to return to CS2 analytics tools.",
  };
}

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}

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
