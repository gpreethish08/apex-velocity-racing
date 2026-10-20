/**
 * cars.js
 * Definitions and specifications for the 8 playable vehicles inspired by the
 * game inventory and garage design.
 */
export const CARS_DATABASE = [
  {
    id: 'hideo',
    name: 'HIDEO',
    fullName: 'HIDEO TWIN TURBO',
    class: 'A',
    rating: 'GT 924',
    price: 0, // Free starter
    color: 0xf3f4f6, // Pure Alpine White
    accentColor: 0x111827,
    rimColor: 0x9ca3af, // Silver Alloy
    caliperColor: 0xef4444, // Red
    bodyType: 'supra',
    description: 'Iconic Japanese straight-six turbo legend. Smooth power delivery and razor-sharp balance.',
    specs: {
      speed: 78,
      grip: 75,
      break: 72,
      handling: 80
    },
    physics: {
      topSpeedKmh: 310,
      acceleration: 18.0,
      brakingForce: 33.0,
      gripFactor: 1.0,
      soundPitch: 1.0
    }
  },
  {
    id: 'gr35',
    name: 'GR35',
    fullName: 'GR35 NISMO TRACK',
    class: 'S',
    rating: 'GT 917',
    price: 50,
    color: 0xffffff, // White with Red Accents
    accentColor: 0xd90429,
    rimColor: 0x18181b, // Satin Black
    caliperColor: 0xfacc15, // Gold
    bodyType: 'gtr',
    description: 'All-wheel drive track weapon with twin-turbo V6 power and aggressive aerodynamic downforce.',
    specs: {
      speed: 84,
      grip: 88,
      break: 80,
      handling: 84
    },
    physics: {
      topSpeedKmh: 325,
      acceleration: 20.0,
      brakingForce: 34.0,
      gripFactor: 1.08,
      soundPitch: 1.05
    }
  },
  {
    id: 'driveza',
    name: 'DRIVEZA',
    fullName: 'DRIVEZA HYPER GT',
    class: 'GT',
    rating: 'GT 922',
    price: 75,
    color: 0x1d4ed8, // Royal Sapphire Blue
    accentColor: 0x0f172a,
    rimColor: 0xd4af37, // Metallic Gold
    caliperColor: 0x10b981, // Cyan Green
    bodyType: 'pagani',
    description: 'Bespoke carbon-titanium hypercar with active quad airbrakes and screaming V12 melody.',
    specs: {
      speed: 90,
      grip: 85,
      break: 86,
      handling: 88
    },
    physics: {
      topSpeedKmh: 340,
      acceleration: 21.5,
      brakingForce: 35.5,
      gripFactor: 1.10,
      soundPitch: 1.18
    }
  },
  {
    id: 'omen_drs',
    name: 'OMEN DRS',
    fullName: 'OMEN DRS HELLHOUND',
    class: 'B',
    rating: 'GT 967',
    price: 90,
    color: 0xea580c, // Sunset Flame Orange
    accentColor: 0x09090b,
    rimColor: 0x27272a, // Dark Matte
    caliperColor: 0xdc2626, // Red
    bodyType: 'muscle',
    description: 'Supercharged 6.2L V8 muscle monster producing earth-shaking torque and effortless power slides.',
    specs: {
      speed: 86,
      grip: 70,
      break: 75,
      handling: 74
    },
    physics: {
      topSpeedKmh: 320,
      acceleration: 22.0,
      brakingForce: 32.0,
      gripFactor: 0.94,
      soundPitch: 0.92
    }
  },
  {
    id: 'drivon',
    name: 'DRIVON',
    fullName: 'DRIVON NOIR W16',
    class: 'GT',
    rating: 'GT 922',
    price: 150,
    color: 0x111317, // Jet Obsidian Black
    accentColor: 0x1f2937,
    rimColor: 0x3b82f6, // Diamond Cut Blue Accents
    caliperColor: 0x3b82f6, // Blue
    bodyType: 'bugatti',
    description: 'Quad-turbocharged 16-cylinder pinnacle of speed. Cruises effortlessly past 360 KM/H.',
    specs: {
      speed: 98,
      grip: 89,
      break: 92,
      handling: 86
    },
    physics: {
      topSpeedKmh: 365,
      acceleration: 24.0,
      brakingForce: 37.0,
      gripFactor: 1.12,
      soundPitch: 1.12
    }
  },
  {
    id: 'f90',
    name: 'F90',
    fullName: 'F90 SPYDER HYBRID',
    class: 'S',
    rating: 'GT 938',
    price: 180,
    color: 0xd1d5db, // Liquid Silver Metallic
    accentColor: 0x374151,
    rimColor: 0xf3f4f6, // Polished Silver
    caliperColor: 0x84cc16, // Acid Green
    bodyType: 'spyder',
    description: 'Open-top hybrid prototype with top-exit exhausts and instant electric torque off the line.',
    specs: {
      speed: 92,
      grip: 94,
      break: 90,
      handling: 93
    },
    physics: {
      topSpeedKmh: 345,
      acceleration: 22.8,
      brakingForce: 36.0,
      gripFactor: 1.14,
      soundPitch: 1.22
    }
  },
  {
    id: 'lm900',
    name: 'LM900',
    fullName: 'LM900 CORSA STRADALE',
    class: 'GT',
    rating: 'GT 943',
    price: 220,
    color: 0xd90429, // Italian Racing Red
    accentColor: 0x18181b,
    rimColor: 0x18181b, // Gloss Black
    caliperColor: 0xfacc15, // Yellow
    bodyType: 'ferrari',
    description: 'V8 hybrid flagship with aerodynamic vortex generators, massive front downforce, and F1 tech.',
    specs: {
      speed: 96,
      grip: 95,
      break: 94,
      handling: 96
    },
    physics: {
      topSpeedKmh: 355,
      acceleration: 23.5,
      brakingForce: 38.0,
      gripFactor: 1.18,
      soundPitch: 1.25
    }
  },
  {
    id: 'ssx',
    name: 'SSX',
    fullName: 'SSX TWIN TURBO SHARK',
    class: 'S',
    rating: 'GT 933',
    price: 250,
    color: 0xbe123c, // Deep Ruby Red
    accentColor: 0x0f172a,
    rimColor: 0x64748b, // Gunmetal Gray
    caliperColor: 0xf97316, // Orange
    bodyType: 'nsx',
    description: 'Sharply creased mid-engine supercar engineered with torque vectoring AWD for extreme cornering.',
    specs: {
      speed: 93,
      grip: 96,
      break: 92,
      handling: 95
    },
    physics: {
      topSpeedKmh: 348,
      acceleration: 22.5,
      brakingForce: 36.5,
      gripFactor: 1.16,
      soundPitch: 1.15
    }
  }
];

export const WALLET_KEY = 'apex_player_coins';
export const OWNED_CARS_KEY = 'apex_owned_cars';
export const SELECTED_CAR_KEY = 'apex_selected_car_id';

export function getPlayerCoins() {
  const saved = localStorage.getItem(WALLET_KEY);
  if (saved !== null) {
    const val = parseInt(saved, 10);
    return isNaN(val) ? 50 : val;
  }
  // Default starting bonus: 50 coins so user has spending power right away!
  localStorage.setItem(WALLET_KEY, '50');
  return 50;
}

export function savePlayerCoins(amount) {
  localStorage.setItem(WALLET_KEY, Math.max(0, Math.floor(amount)).toString());
}

export function getOwnedCarIds() {
  try {
    const saved = localStorage.getItem(OWNED_CARS_KEY);
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr) && arr.includes('hideo')) return arr;
    }
  } catch (e) {}
  // Default: player owns the starter car 'hideo'
  const def = ['hideo'];
  localStorage.setItem(OWNED_CARS_KEY, JSON.stringify(def));
  return def;
}

export function addOwnedCarId(id) {
  const owned = getOwnedCarIds();
  if (!owned.includes(id)) {
    owned.push(id);
    localStorage.setItem(OWNED_CARS_KEY, JSON.stringify(owned));
  }
}

export function getSelectedCarId() {
  return localStorage.getItem(SELECTED_CAR_KEY) || 'hideo';
}

export function setSelectedCarId(id) {
  localStorage.setItem(SELECTED_CAR_KEY, id);
}
