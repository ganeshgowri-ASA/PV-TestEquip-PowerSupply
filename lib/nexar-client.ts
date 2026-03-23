import { GraphQLClient, gql } from 'graphql-request';

const NEXAR_API_URL = 'https://api.nexar.com/graphql';

export interface NexarPart {
  mpn: string;
  name: string;
  manufacturer: { name: string; homepageUrl?: string };
  medianPrice1000?: { price: number; currency: string; quantity: number };
  category?: { id: string; name: string };
  sellers: {
    company: { name: string };
    offers: {
      inventoryLevel: number;
      prices: { quantity: number; price: number; currency: string }[];
      moq: number;
    }[];
  }[];
  specs: { attribute: { name: string; shortname: string }; displayValue: string }[];
  similarParts?: { mpn: string; name: string }[];
}

export interface NexarSearchResult {
  hits: number;
  results: { part: NexarPart }[];
}

export function createNexarClient(token: string) {
  const client = new GraphQLClient(NEXAR_API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return {
    async searchByMPN(mpn: string, limit = 10): Promise<NexarSearchResult> {
      const query = gql`
        query searchMPN($q: String!, $limit: Int!) {
          supSearchMpn(q: $q, limit: $limit) {
            hits
            results {
              part {
                mpn
                name
                manufacturer { name homepageUrl }
                medianPrice1000 { price currency quantity }
                category { id name }
                sellers {
                  company { name }
                  offers {
                    inventoryLevel
                    moq
                    prices { quantity price currency }
                  }
                }
                specs {
                  attribute { name shortname }
                  displayValue
                }
              }
            }
          }
        }
      `;
      const data = await client.request<{ supSearchMpn: NexarSearchResult }>(query, { q: mpn, limit });
      return data.supSearchMpn;
    },

    async searchParts(query_str: string, limit = 10): Promise<NexarSearchResult> {
      const query = gql`
        query searchParts($q: String!, $limit: Int!) {
          supSearch(q: $q, limit: $limit) {
            hits
            results {
              part {
                mpn
                name
                manufacturer { name homepageUrl }
                medianPrice1000 { price currency quantity }
                category { id name }
                sellers {
                  company { name }
                  offers {
                    inventoryLevel
                    moq
                    prices { quantity price currency }
                  }
                }
                specs {
                  attribute { name shortname }
                  displayValue
                }
                similarParts { mpn name }
              }
            }
          }
        }
      `;
      const data = await client.request<{ supSearch: NexarSearchResult }>(query, { q: query_str, limit });
      return data.supSearch;
    },

    async getAlternatives(mpn: string, limit = 5): Promise<NexarSearchResult> {
      const query = gql`
        query findAlts($q: String!, $limit: Int!) {
          supSearchMpn(q: $q, limit: $limit) {
            hits
            results {
              part {
                mpn
                name
                similarParts { mpn name }
                sellers {
                  company { name }
                  offers { prices { quantity price currency } }
                }
              }
            }
          }
        }
      `;
      const data = await client.request<{ supSearchMpn: NexarSearchResult }>(query, { q: mpn, limit });
      return data.supSearchMpn;
    },
  };
}
