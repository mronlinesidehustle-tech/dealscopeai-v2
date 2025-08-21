import type { MockupLevel, RepairLevel } from './types';

export const FINISH_LEVELS: { id: MockupLevel; name: string }[] = [
    { id: 'Basic', name: 'Basic (Investor/Rental Grade)' },
    { id: 'Intermediate', name: 'Intermediate (Market Standard)' },
    { id: 'Luxury', name: 'Luxury (High-End Finishes)' },
];

export const REPAIR_LEVEL_INFO: Record<RepairLevel, { color: string; description: string }> = {
    'Light Cosmetic': { color: 'bg-green-100 text-green-800', description: 'Minor repairs like paint, fixtures, and deep cleaning.' },
    'Medium': { color: 'bg-yellow-100 text-yellow-800', description: 'Moderate repairs including flooring, countertops, and some system updates.' },
    'Heavy': { color: 'bg-orange-100 text-orange-800', description: 'Significant work involving kitchens, baths, and potentially major systems.' },
    'Gut': { color: 'bg-red-100 text-red-800', description: 'Complete teardown of the interior to the studs.' },
    'Unknown': { color: 'bg-slate-100 text-slate-800', description: 'The level of repair could not be determined.' },
};

export const DIFFICULTY_DESCRIPTIONS: { [key: number]: string } = {
    1: 'Very Easy',
    2: 'Easy',
    3: 'Medium',
    4: 'Hard',
    5: 'Very Hard'
};

export const DIFFICULTY_COLORS: { [key: number]: string } = {
    1: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
    2: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    4: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    5: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
};
