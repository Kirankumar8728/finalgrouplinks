import { getGroups } from './src/lib/groups-dal.ts';

async function testImageLinks() {
  const groups = await getGroups({ limit: 10 });
  console.log(JSON.stringify(groups.groups.map(g => ({ id: g.id, title: g.title, imageUrl: g.imageUrl })), null, 2));
}

testImageLinks();
