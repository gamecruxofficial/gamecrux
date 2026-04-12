'use client';

import { useRouter } from 'next/navigation';

// Function to refresh the current route
export function useRouteRefresh() {
  const router = useRouter();
  
  return () => {
    router.refresh();
  };
}

// Function specifically for refreshing after payment
export function usePaymentSuccessRedirect() {
  const router = useRouter();
  
  return () => {
    // Force a refresh and redirect to games page
    router.refresh();
    router.push('/games');
  };
}

interface Game {
  players: string;
}

// Helper function to get random player count between 80K and 200K
const getRandomPlayers = () => `${(Math.floor(Math.random() * (200 - 80 + 1)) + 80)}`

const games: Game[] = [];

// Update player counts every minute
setInterval(() => {
  games.forEach((game: Game) => {
    game.players = getRandomPlayers()
  })
}, 60000)