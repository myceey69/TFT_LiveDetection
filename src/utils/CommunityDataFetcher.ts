// Community data sources for TFT meta information
// This avoids using Riot API by leveraging community sites and static data

interface MetaDataSource {
  name: string;
  url: string;
  type: 'json' | 'scrape' | 'api';
  description: string;
}

interface CommunityMetaComp {
  name: string;
  tier: string;
  winRate?: number;
  playRate?: number;
  avgPlace?: number;
  champions: Array<{
    name: string;
    cost: number;
    stars: number;
    items: string[];
  }>;
  traits: Array<{
    name: string;
    style: number;
  }>;
  positioning?: string;
  guide?: string;
  lastUpdated: string;
}

interface CommunityChampionData {
  name: string;
  cost: number;
  traits: string[];
  stats: {
    health: number;
    attack: number;
    dps: number;
    armor: number;
    magicResist: number;
  };
  ability: {
    name: string;
    description: string;
    damage: number[];
    manaCost: number;
  };
  bestItems: string[];
  popularity?: number;
  winRateWithItems?: { [item: string]: number };
}

class CommunityDataFetcher {
  private dataSources: MetaDataSource[] = [
    {
      name: 'TFT Meta Trends',
      url: 'https://tftmetatrends.com/api/comps',
      type: 'api',
      description: 'Community-driven meta composition data'
    },
    {
      name: 'TFTactics',
      url: 'https://tftactics.gg/tierlist/meta-comps',
      type: 'scrape',
      description: 'Popular team composition data'
    },
    {
      name: 'MetaTFT',
      url: 'https://metatft.com/comps',
      type: 'scrape', 
      description: 'High-level meta analysis'
    }
  ];

  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 30 * 60 * 1000; // 30 minutes

  // Alternative 1: Use Data Dragon (Riot's static data - no API key needed)
  async fetchDataDragonChampions(version: string = '14.24.1'): Promise<CommunityChampionData[]> {
    try {
      const cacheKey = `data-dragon-${version}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      // Data Dragon is Riot's CDN for static game data (no API key required)
      const championsUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/tft-champion.json`;
      const traitsUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/tft-trait.json`;
      
      const [championsResponse, traitsResponse] = await Promise.all([
        fetch(championsUrl).catch(() => null),
        fetch(traitsUrl).catch(() => null)
      ]);

      if (!championsResponse?.ok) {
        throw new Error('Failed to fetch Data Dragon champions');
      }

      const championsData = await championsResponse.json();
      const traitsData = traitsResponse?.ok ? await traitsResponse.json() : null;

      const champions = this.parseDataDragonChampions(championsData, traitsData);
      
      this.cache.set(cacheKey, { data: champions, timestamp: Date.now() });
      return champions;
    } catch (error) {
      console.warn('Data Dragon fetch failed:', error);
      return this.getFallbackChampionData();
    }
  }

  // Alternative 2: Fetch from community aggregated data
  async fetchCommunityMetaComps(): Promise<CommunityMetaComp[]> {
    const comps: CommunityMetaComp[] = [];

    // Try multiple community sources
    for (const source of this.dataSources) {
      try {
        if (source.type === 'api') {
          const data = await this.fetchFromCommunityAPI(source.url);
          comps.push(...data);
        }
        // For scraping, we'd need a CORS proxy or server-side solution
        // For now, we'll focus on public APIs and static data
      } catch (error) {
        console.warn(`Failed to fetch from ${source.name}:`, error);
      }
    }

    return comps.length > 0 ? comps : this.getFallbackMetaComps();
  }

  // Alternative 3: Build our own meta database from community insights
  async fetchCrowdsourcedData(): Promise<{ champions: CommunityChampionData[]; comps: CommunityMetaComp[] }> {
    // This would aggregate data from multiple community sources
    // and provide our own meta analysis
    
    try {
      const [champions, comps] = await Promise.all([
        this.fetchDataDragonChampions(),
        this.fetchCommunityMetaComps()
      ]);

      return { champions, comps };
    } catch (error) {
      console.error('All data sources failed:', error);
      return {
        champions: this.getFallbackChampionData(),
        comps: this.getFallbackMetaComps()
      };
    }
  }

  private async fetchFromCommunityAPI(url: string): Promise<CommunityMetaComp[]> {
    // This would need to be adapted based on the actual API format
    // Many community sites don't have public APIs, so this is conceptual
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  }

  private parseDataDragonChampions(championsData: any, _traitsData: any): CommunityChampionData[] {
    const champions: CommunityChampionData[] = [];
    
    for (const [key, champion] of Object.entries(championsData.data || {})) {
      const champ = champion as any;
      
      champions.push({
        name: champ.name || key,
        cost: champ.cost || 1,
        traits: champ.traits || [],
        stats: {
          health: champ.stats?.hp || 0,
          attack: champ.stats?.damage || 0,
          dps: champ.stats?.dps || 0,
          armor: champ.stats?.armor || 0,
          magicResist: champ.stats?.magicResist || 0,
        },
        ability: {
          name: champ.ability?.name || '',
          description: champ.ability?.desc || '',
          damage: champ.ability?.variables?.map((v: any) => v.value) || [],
          manaCost: champ.stats?.initialMana || 0,
        },
        bestItems: this.inferBestItems(champ),
      });
    }

    return champions;
  }

  private inferBestItems(champion: any): string[] {
    // Basic heuristics to suggest items based on champion type
    const traits = champion.traits || [];
    const isAD = traits.some((t: string) => ['Duelist', 'Marksman', 'Warrior'].includes(t));
    const isAP = traits.some((t: string) => ['Mage', 'Sorcerer', 'Invoker'].includes(t));
    const isTank = traits.some((t: string) => ['Protector', 'Vanguard', 'Bastion'].includes(t));

    if (isAD) {
      return ['Infinity Edge', 'Last Whisper', 'Guinsoo\'s Rageblade'];
    } else if (isAP) {
      return ['Archangel\'s Staff', 'Rabadon\'s Deathcap', 'Hextech Gunblade'];
    } else if (isTank) {
      return ['Warmog\'s Armor', 'Bramble Vest', 'Dragon\'s Claw'];
    }

    return ['Guinsoo\'s Rageblade', 'Hextech Gunblade', 'Guardian Angel'];
  }

  private getFallbackChampionData(): CommunityChampionData[] {
    // Return our current champion data enhanced with community insights
    return [
      {
        name: 'Kalista',
        cost: 1,
        traits: ['Spirit', 'Duelist'],
        stats: { health: 550, attack: 50, dps: 41.7, armor: 25, magicResist: 25 },
        ability: { name: 'Pierce', description: 'Throws spear through enemies', damage: [70, 105, 158], manaCost: 40 },
        bestItems: ['Guinsoo\'s Rageblade', 'Infinity Edge', 'Last Whisper'],
        popularity: 0.15,
        winRateWithItems: { 'Guinsoo\'s Rageblade': 0.67, 'Infinity Edge': 0.71 }
      },
      // ... more champions would go here
    ];
  }

  private getFallbackMetaComps(): CommunityMetaComp[] {
    // Enhanced version of our current meta comps with community data
    return [
      {
        name: 'Spirit Warriors',
        tier: 'S',
        winRate: 0.65,
        playRate: 0.12,
        avgPlace: 3.2,
        champions: [
          { name: 'Kalista', cost: 1, stars: 3, items: ['Guinsoo\'s Rageblade', 'Infinity Edge'] },
          { name: 'Yasuo', cost: 3, stars: 2, items: ['Archangel\'s Staff'] }
        ],
        traits: [
          { name: 'Spirit', style: 4 },
          { name: 'Duelist', style: 2 },
          { name: 'Warrior', style: 2 }
        ],
        positioning: 'Front line Garen and Shen, Kalista corner carry',
        guide: 'Strong early game with 1-cost carries. Transition to Kalista carry at level 7.',
        lastUpdated: new Date().toISOString()
      }
    ];
  }

  // Method to check for updates without API limits
  async checkForUpdates(): Promise<{ hasUpdates: boolean; lastCheck: Date }> {
    const lastCheck = new Date();
    
    // Could check community sites for new patch notes or meta shifts
    // This is much more relaxed than Riot API rate limits
    
    return {
      hasUpdates: Math.random() > 0.7, // Simulated for now
      lastCheck
    };
  }

  // Clear cache if needed
  clearCache(): void {
    this.cache.clear();
  }
}

export default new CommunityDataFetcher();
export type { CommunityMetaComp, CommunityChampionData };