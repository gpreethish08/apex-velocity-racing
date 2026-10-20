/**
 * cars.js
 * Official real-world car brand lineup:
 * 1. Mercedes-Benz (Purple - Free 1st Starter Car for all users!)
 * 2. Ford Mustang GT
 * 3. BMW M4 Competition
 * 4. Ferrari F8 Tributo
 * 5. Porsche 911 GT3 RS
 * 6. Lamborghini Aventador SVJ
 */
export const CARS_DATABASE = [
  {
    id: 'benz_z4',
    name: 'MERCEDES-BENZ AMG Z4',
    brand: 'Mercedes-Benz',
    fullName: 'MERCEDES-BENZ AMG GT ROADSTER',
    class: 'S',
    rating: 'GT 940',
    price: 0, // Free starter for all users!
    color: 0x8b5cf6, // Vibrant Royal Purple
    accentColor: 0x1f1f2e,
    rimColor: 0xe2e8f0, // Polished Chrome / Silver
    caliperColor: 0xfacc15, // AMG Gold
    bodyType: 'benz',
    description: 'Twin-turbo 4.0L V8 roadster in stunning Royal Purple. Perfect balance of German luxury and raw power.',
    specs: {
      speed: 85,
      grip: 88,
      break: 84,
      handling: 89
    },
    physics: {
      topSpeedKmh: 320,
      acceleration: 38.0,
      brakingForce: 45.0,
      gripFactor: 1.05,
      soundPitch: 1.0
    }
  },
  {
    id: 'mustang_gt',
    name: 'FORD MUSTANG GT',
    brand: 'Ford',
    fullName: 'FORD MUSTANG 5.0 V8 GT',
    class: 'A',
    rating: 'GT 920',
    price: 60,
    color: 0x0284c7, // Grabber Blue with Black Stripes
    accentColor: 0x0a0a0a,
    rimColor: 0x27272a, // Satin Charcoal
    caliperColor: 0xdc2626, // Red
    bodyType: 'mustang',
    description: 'Iconic 5.0L Coyote V8 American muscle icon with roaring exhaust and aggressive rear-wheel drive.',
    specs: {
      speed: 82,
      grip: 78,
      break: 80,
      handling: 82
    },
    physics: {
      topSpeedKmh: 310,
      acceleration: 36.0,
      brakingForce: 42.0,
      gripFactor: 0.98,
      soundPitch: 0.95
    }
  },
  {
    id: 'bmw_m4',
    name: 'BMW M4 COMPETITION',
    brand: 'BMW',
    fullName: 'BMW M4 COMPETITION TWIN-TURBO',
    class: 'S',
    rating: 'GT 945',
    price: 120,
    color: 0x10b981, // Isle of Man Green
    accentColor: 0x18181b,
    rimColor: 0x0f172a, // Shadowline Black
    caliperColor: 0x3b82f6, // M Sport Blue
    bodyType: 'bmw',
    description: 'Precision German engineered twin-turbo inline-6 weapon. Track-tuned suspension and laser agility.',
    specs: {
      speed: 88,
      grip: 92,
      break: 88,
      handling: 92
    },
    physics: {
      topSpeedKmh: 330,
      acceleration: 42.0,
      brakingForce: 48.0,
      gripFactor: 1.10,
      soundPitch: 1.10
    }
  },
  {
    id: 'ferrari_f8',
    name: 'FERRARI F8 TRIBUTO',
    brand: 'Ferrari',
    fullName: 'FERRARI F8 TRIBUTO V8',
    class: 'GT',
    rating: 'GT 970',
    price: 200,
    color: 0xd90429, // Rosso Corsa Racing Red
    accentColor: 0x111111,
    rimColor: 0xd4af37, // Corse Gold
    caliperColor: 0xfacc15, // Giallo Modena Yellow
    bodyType: 'ferrari',
    description: 'Italian mid-engine masterpiece with 710 HP twin-turbo V8 and F1-derived aerodynamic vortex ducts.',
    specs: {
      speed: 94,
      grip: 95,
      break: 92,
      handling: 96
    },
    physics: {
      topSpeedKmh: 350,
      acceleration: 46.0,
      brakingForce: 52.0,
      gripFactor: 1.15,
      soundPitch: 1.25
    }
  },
  {
    id: 'porsche_911',
    name: 'PORSCHE 911 GT3 RS',
    brand: 'Porsche',
    fullName: 'PORSCHE 911 GT3 RS TRACK',
    class: 'GT',
    rating: 'GT 975',
    price: 300,
    color: 0xffffff, // Pure White with Shark Blue Decals
    accentColor: 0x0284c7,
    rimColor: 0xef4444, // Pyro Red Rims
    caliperColor: 0xef4444, // Red
    bodyType: 'porsche',
    description: 'Naturally aspirated 9000 RPM track predator with active DRS rear wing and massive downforce.',
    specs: {
      speed: 93,
      grip: 98,
      break: 96,
      handling: 98
    },
    physics: {
      topSpeedKmh: 345,
      acceleration: 45.0,
      brakingForce: 54.0,
      gripFactor: 1.20,
      soundPitch: 1.30
    }
  },
  {
    id: 'lamborghini_svj',
    name: 'LAMBORGHINI AVENTADOR SVJ',
    brand: 'Lamborghini',
    fullName: 'LAMBORGHINI AVENTADOR SVJ V12',
    class: 'GT',
    rating: 'GT 990',
    price: 450,
    color: 0xeab308, // Giallo Orion Pearl Yellow
    accentColor: 0x18181b,
    rimColor: 0x18181b, // Forged Leirion Black
    caliperColor: 0x000000, // Black
    bodyType: 'lamborghini',
    description: 'V12 all-wheel-drive flagship hypercar. Screaming exhaust notes and ALA active aerodynamic vectoring.',
    specs: {
      speed: 98,
      grip: 97,
      break: 95,
      handling: 97
    },
    physics: {
      topSpeedKmh: 365,
      acceleration: 50.0,
      brakingForce: 55.0,
      gripFactor: 1.22,
      soundPitch: 1.35
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
      if (Array.isArray(arr) && arr.includes('benz_z4')) return arr;
    }
  } catch (e) {}
  // Default: player owns the Mercedes-Benz Z4
  const def = ['benz_z4'];
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
  const id = localStorage.getItem(SELECTED_CAR_KEY);
  if (id && CARS_DATABASE.some(c => c.id === id)) return id;
  return 'benz_z4'; // Default starting car: Mercedes-Benz Z4
}

export function setSelectedCarId(id) {
  localStorage.setItem(SELECTED_CAR_KEY, id);
}
