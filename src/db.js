import Dexie from 'dexie';
import { defaultDrills } from './data/drills';

export const db = new Dexie('YoungStarSoccer');

db.version(1).stores({
  player: 'id',
  drills: 'id, category, isCustom',
  weeklyPlans: 'id, weekStart',
  plannedDrills: 'id, planId, dayOfWeek, drillId',
  activityLogs: 'id, plannedDrillId, date, drillId',
  achievements: 'id, type, earnedDate'
});

export async function initializeDb() {
  const count = await db.drills.count();
  if (count === 0) {
    await db.drills.bulkAdd(defaultDrills);
  }
  const playerCount = await db.player.count();
  if (playerCount === 0) {
    await db.player.add({
      id: 'default',
      name: '',
      age: '',
      position: '',
      goals: [],
      createdAt: new Date().toISOString()
    });
  }
}
