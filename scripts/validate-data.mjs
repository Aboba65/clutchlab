import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");

const FILES = {
  players: "src/data/players.ts",
  teams: "src/data/teams.ts",
  maps: "src/config/maps.ts",
};

const VALID_ROLES = new Set([
  "AWPer",
  "Entry",
  "Star Rifler",
  "Lurker",
  "Anchor",
  "Support",
  "IGL",
  "Flex",
]);

const PLAYER_SCORE_FIELDS = ["impact", "clutch", "opening", "awp", "rifle", "consistency"];
const TEAM_SCORE_FIELDS = ["firepower", "structure", "mapPool", "clutch", "form"];
const MAP_SCORE_FIELDS = [
  "ctSideStrength",
  "tSideDifficulty",
  "awpValue",
  "entryValue",
  "anchorPressure",
];

const PRICE_MIN = 1;
const PRICE_MAX = 10;

const errors = [];
const warnings = [];

function main() {
  const playersSource = readProjectFile(FILES.players);
  const teamsSource = readProjectFile(FILES.teams);
  const mapsSource = readProjectFile(FILES.maps);

  const playerObjects = splitTopLevelObjects(getExportedArray(playersSource, "players"));
  const teamObjects = splitTopLevelObjects(getExportedArray(teamsSource, "teams"));
  const mapObjects = splitTopLevelObjects(getExportedArray(mapsSource, "maps"));

  const players = playerObjects.map(parsePlayer);
  const teams = teamObjects.map(parseTeam);
  const maps = mapObjects.map(parseMap);

  validateRequiredCounts(players, teams, maps);
  validateUnique(players.map((player) => player.id), "player id");
  validateUnique(teams.map((team) => team.id), "team id");
  validateUnique(maps.map((map) => map.id), "map id");
  validateUnique(maps.map((map) => map.name), "map name");

  validatePlayers(players, teams);
  validateTeams(teams, players, maps);
  validateMaps(maps);
  validateBidirectionalTeamLinks(players, teams);

  printResult(players, teams, maps);
}

function readProjectFile(relativePath) {
  const absolutePath = path.join(ROOT_DIR, relativePath);

  if (!fs.existsSync(absolutePath)) {
    fail(`Missing file: ${relativePath}`);
    return "";
  }

  return fs.readFileSync(absolutePath, "utf8");
}

function getExportedArray(source, constName) {
  const marker = `export const ${constName}`;
  const markerIndex = source.indexOf(marker);

  if (markerIndex === -1) {
    fail(`Cannot find exported array: ${constName}`);
    return "";
  }

  const equalsIndex = source.indexOf("=", markerIndex);

  if (equalsIndex === -1) {
    fail(`Cannot find assignment for exported array: ${constName}`);
    return "";
  }

  const bracketStart = source.indexOf("[", equalsIndex);

  if (bracketStart === -1) {
    fail(`Cannot find array start for: ${constName}`);
    return "";
  }

  const bracketEnd = findMatching(source, bracketStart, "[", "]");

  if (bracketEnd === -1) {
    fail(`Cannot find array end for: ${constName}`);
    return "";
  }

  return source.slice(bracketStart + 1, bracketEnd);
}

function findMatching(source, startIndex, openChar, closeChar) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === openChar) {
      depth += 1;
    }

    if (char === closeChar) {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function splitTopLevelObjects(arraySource) {
  const objects = [];
  let depth = 0;
  let startIndex = -1;
  let quote = null;
  let escaped = false;

  for (let index = 0; index < arraySource.length; index += 1) {
    const char = arraySource[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") {
      if (depth === 0) {
        startIndex = index;
      }

      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0 && startIndex !== -1) {
        objects.push(arraySource.slice(startIndex, index + 1));
        startIndex = -1;
      }
    }
  }

  return objects;
}

function parsePlayer(source) {
  const id = getStringField(source, "id");
  const nickname = getStringField(source, "nickname");
  const teamId = getStringField(source, "teamId");
  const role = getStringField(source, "role");
  const country = getStringField(source, "country");
  const price = getNumberField(source, "price");
  const stats = Object.fromEntries(
    PLAYER_SCORE_FIELDS.map((field) => [field, getNumberField(source, field)]),
  );

  return {
    source,
    id,
    nickname,
    teamId,
    role,
    country,
    price,
    stats,
  };
}

function parseTeam(source) {
  const id = getStringField(source, "id");
  const name = getStringField(source, "name");
  const region = getStringField(source, "region");
  const playerIds = getStringArrayField(source, "players");
  const bestMaps = getStringArrayField(source, "bestMaps");
  const scores = Object.fromEntries(
    TEAM_SCORE_FIELDS.map((field) => [field, getNumberField(source, field)]),
  );

  return {
    source,
    id,
    name,
    region,
    playerIds,
    bestMaps,
    scores,
  };
}

function parseMap(source) {
  const id = getStringField(source, "id");
  const name = getStringField(source, "name");
  const scores = Object.fromEntries(
    MAP_SCORE_FIELDS.map((field) => [field, getNumberField(source, field)]),
  );

  return {
    source,
    id,
    name,
    scores,
  };
}

function getStringField(source, fieldName) {
  const match = source.match(new RegExp(`${fieldName}\\s*:\\s*["']([^"']+)["']`));
  return match?.[1] ?? "";
}

function getNumberField(source, fieldName) {
  const match = source.match(new RegExp(`${fieldName}\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`));
  return match ? Number(match[1]) : Number.NaN;
}

function getStringArrayField(source, fieldName) {
  const fieldIndex = source.indexOf(`${fieldName}:`);
  if (fieldIndex === -1) return [];

  const bracketStart = source.indexOf("[", fieldIndex);
  if (bracketStart === -1) return [];

  const bracketEnd = findMatching(source, bracketStart, "[", "]");
  if (bracketEnd === -1) return [];

  const arraySource = source.slice(bracketStart + 1, bracketEnd);

  return [...arraySource.matchAll(/["']([^"']+)["']/g)].map((item) => item[1]);
}

function validateRequiredCounts(players, teams, maps) {
  if (players.length === 0) fail("No players parsed from src/data/players.ts");
  if (teams.length === 0) fail("No teams parsed from src/data/teams.ts");
  if (maps.length === 0) fail("No maps parsed from src/config/maps.ts");
}

function validateUnique(values, label) {
  const seen = new Set();

  for (const value of values) {
    if (!value) {
      fail(`Missing ${label}`);
      continue;
    }

    if (seen.has(value)) {
      fail(`Duplicate ${label}: ${value}`);
    }

    seen.add(value);
  }
}

function validatePlayers(players, teams) {
  const teamIds = new Set(teams.map((team) => team.id));

  for (const player of players) {
    const label = player.id || player.nickname || "Unknown player";

    requireString(player.id, `${label}.id`);
    requireString(player.nickname, `${label}.nickname`);
    requireString(player.country, `${label}.country`);
    requireString(player.teamId, `${label}.teamId`);
    requireString(player.role, `${label}.role`);

    if (!VALID_ROLES.has(player.role)) {
      fail(`${label}: invalid role "${player.role}"`);
    }

    if (!teamIds.has(player.teamId)) {
      fail(`${label}: teamId "${player.teamId}" does not exist in teams`);
    }

    requireNumberInRange(player.price, PRICE_MIN, PRICE_MAX, `${label}.price`);

    for (const field of PLAYER_SCORE_FIELDS) {
      requireNumberInRange(player.stats[field], 0, 100, `${label}.stats.${field}`);
    }
  }
}

function validateTeams(teams, players, maps) {
  const playerIds = new Set(players.map((player) => player.id));
  const mapNames = new Set(maps.map((map) => map.name));

  for (const team of teams) {
    const label = team.id || team.name || "Unknown team";

    requireString(team.id, `${label}.id`);
    requireString(team.name, `${label}.name`);
    requireString(team.region, `${label}.region`);

    if (team.playerIds.length === 0) {
      fail(`${label}: players array is empty`);
    }

    validateUniqueInArray(team.playerIds, `${label}.players`);

    for (const playerId of team.playerIds) {
      if (!playerIds.has(playerId)) {
        fail(`${label}: player id "${playerId}" does not exist in players`);
      }
    }

    if (team.bestMaps.length === 0) {
      warn(`${label}: bestMaps array is empty`);
    }

    validateUniqueInArray(team.bestMaps, `${label}.bestMaps`);

    for (const mapName of team.bestMaps) {
      if (!mapNames.has(mapName)) {
        fail(`${label}: best map "${mapName}" does not exist in map profiles`);
      }
    }

    for (const field of TEAM_SCORE_FIELDS) {
      requireNumberInRange(team.scores[field], 0, 100, `${label}.scores.${field}`);
    }
  }
}

function validateMaps(maps) {
  for (const map of maps) {
    const label = map.id || map.name || "Unknown map";

    requireString(map.id, `${label}.id`);
    requireString(map.name, `${label}.name`);

    for (const field of MAP_SCORE_FIELDS) {
      requireNumberInRange(map.scores[field], 0, 100, `${label}.${field}`);
    }
  }
}

function validateBidirectionalTeamLinks(players, teams) {
  const teamById = new Map(teams.map((team) => [team.id, team]));

  for (const player of players) {
    const team = teamById.get(player.teamId);

    if (!team) continue;

    if (!team.playerIds.includes(player.id)) {
      warn(`${player.id}: teamId points to "${player.teamId}", but team.players does not include this player`);
    }
  }

  const playerById = new Map(players.map((player) => [player.id, player]));

  for (const team of teams) {
    for (const playerId of team.playerIds) {
      const player = playerById.get(playerId);

      if (player && player.teamId !== team.id) {
        warn(`${team.id}: includes "${playerId}", but player.teamId is "${player.teamId}"`);
      }
    }
  }
}

function validateUniqueInArray(values, label) {
  const seen = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      fail(`${label}: duplicate value "${value}"`);
    }

    seen.add(value);
  }
}

function requireString(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`${label}: missing string value`);
  }
}

function requireNumberInRange(value, min, max, label) {
  if (Number.isNaN(value)) {
    fail(`${label}: missing number`);
    return;
  }

  if (value < min || value > max) {
    fail(`${label}: value ${value} is outside ${min}-${max}`);
  }
}

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function printResult(players, teams, maps) {
  console.log("ClutchLab data validation");
  console.log("-------------------------");
  console.log(`Players parsed: ${players.length}`);
  console.log(`Teams parsed:   ${teams.length}`);
  console.log(`Maps parsed:    ${maps.length}`);
  console.log("");

  if (warnings.length > 0) {
    console.log(`Warnings (${warnings.length}):`);
    for (const warning of warnings) {
      console.log(`  - ${warning}`);
    }
    console.log("");
  }

  if (errors.length > 0) {
    console.error(`Validation failed: ${errors.length} error(s)`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  console.log("Validation passed.");
}

main();
