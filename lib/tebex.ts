// lib/tebex.ts
import { toast } from "react-hot-toast"

interface TebexConfig {
  ident: string;
  theme?: 'light' | 'dark';
  colors?: Array<{
    name: string;
    color: string;
  }>;
  endpoint?: string;
}

interface CreateBasketResponse {
  ident: string;
  error?: string;
  details?: string;
}

// Add Tebex window type
declare global {
  interface Window {
    Tebex?: {
      checkout: {
        init: (config: TebexConfig) => void;
        launch: () => void;
      };
    };
  }
}

export async function createTebexBasket(packageIds: string[], user_name: string, user_id: string, discordId: string): Promise<string> {

  try {
    const response = await fetch('/api/create-basket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        packageIds,
        user_name,
        user_id,
        discordId
      }),
    });

    let data: CreateBasketResponse;
    try {
      data = await response.json();
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new Error('Invalid server response');
    }

    if (!response.ok) {
      throw new Error(data.details || data.error || 'Failed to create basket');
    }

    if (!data.ident) {
      throw new Error('No basket identifier received');
    }

    return data.ident;
  } catch (error) {
    console.error('Error creating Tebex basket:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to create basket');
    throw error;
  }
}

export function initTebexCheckout(config: TebexConfig): void {
  if (typeof window === 'undefined') {
    throw new Error('Tebex checkout can only be initialized in browser environment');
  }

  // Check if Tebex script is loaded
  if (!window.Tebex) {
    throw new Error('Tebex script not loaded. Make sure to include the Tebex script in your page.');
  }

  try {
    window.Tebex.checkout.init(config);
    window.Tebex.checkout.launch();
  } catch (error) {
    console.error('Error launching Tebex checkout:', error);
    toast.error('Failed to launch checkout. Please try again.');
    throw error;
  }
}
