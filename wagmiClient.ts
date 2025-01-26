import { createClient, configureChains, Chain } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, sepolia], // Aggiungi le reti che vuoi supportare
  [alchemyProvider({ apiKey: 'your-alchemy-api-key' })]
);

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
});

export { client, chains };
