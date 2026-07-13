import { RiotApi, LolApi, Constants } from "twisted";

const riotApi = new RiotApi({ key: process.env.LEAGUE_API_KEY });
const lolApi = new LolApi({ key: process.env.LEAGUE_API_KEY });

async function getPuuid(gameName: string, tagLine: string) {
  const account = await riotApi.Account.getByRiotId(
    gameName,
    tagLine,
    Constants.RegionGroups.EUROPE, // routing régional : EUROPE, AMERICAS, ASIA
  );
  return account.response.puuid;
}

async function getRankedInfo(puuid: string) {
  const entries = await lolApi.League.byPUUID(puuid, Constants.Regions.EU_WEST);
  console.log(entries.response);
  return entries.response;
}

export async function getSoloQueueLP(gameName: string, tagLine: string) {
  const puuid = await getPuuid(gameName, tagLine);
  const entries = await getRankedInfo(puuid);

  const solo = entries.find((e) => e.queueType === "RANKED_SOLO_5x5");

  if (!solo) return null;

  return {
    tier: solo.tier,
    rank: solo.rank,
    lp: solo.leaguePoints,
    wins: solo.wins,
    losses: solo.losses,
  };
}
