import { getGroups } from './src/lib/groups-dal.ts';

async function inspectImageLinks() {
  const result = await getGroups({ limit: 5 });
  result.groups.forEach(g => {
    console.log(`ID: ${g.id}, Title: ${g.title}, URL: ${g.url}, Image: ${g.imageUrl}`);
  });
}

inspectImageLinks().catch(console.error);
