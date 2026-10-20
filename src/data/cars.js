/**
 * cars.js
 * Exclusive Hero Car:
 * LAMBORGHINI GALLARDO LP570-4 / LP570-5 SUPERLEGGERA
 * (Rosso Mars Racing Red with Carbon Fiber Aero Splitters & GT Wing)
 */
export const CARS_DATABASE = [
  {
    id: 'lamborghini_gallardo',
    name: 'LAMBORGHINI GALLARDO LP570-5',
    brand: 'Lamborghini',
    fullName: 'LAMBORGHINI GALLARDO LP570-4 SUPERLEGGERA',
    class: 'S+',
    rating: 'GT 980',
    price: 0, // Hero Car - Free & Ready to race for all players!
    color: 0xdf1020, // Rosso Mars Racing Red
    accentColor: 0x121316, // Carbon fiber / Matte black aerodynamic accents
    rimColor: 0x27272a, // Gunmetal / Titanium lightweight 5-spoke wheels
    caliperColor: 0x18181b, // Carbon ceramic gloss black calipers
    bodyType: 'gallardo',
    description: 'V10 5.2L Superleggera producing 570 HP. Permanent all-wheel drive, carbon fiber GT wing, razor wedge aerodynamics, and lightweight titanium construction.',
    specs: {
      speed: 98,
      grip: 95,
      break: 96,
      handling: 97
    },
    physics: {
      topSpeedKmh: 345,
      acceleration: 45.0,
      brakingForce: 52.0,
      gripFactor: 1.15,
      soundPitch: 1.05
    }
  }
];

const WALLET_KEY = 'apex_player_gold_coins_v2';
const OWNED_CARS_KEY = 'apex_owned_cars_v2';
const SELECTED_CAR_KEY = 'apex_selected_car_v2';

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
  return ['lamborghini_gallardo'];
}

export function addOwnedCarId(id) {
  // Only the single hero car exists
}

export function getSelectedCarId() {
  return 'lamborghini_gallardo';
}

export function setSelectedCarId(id) {
  localStorage.setItem(SELECTED_CAR_KEY, 'lamborghini_gallardo');
}
