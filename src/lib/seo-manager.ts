import { Group } from '@/src/types';
import { ContentSettings } from '@/src/lib/content-settings';

export const SEOManager = {
  resolveDetail: (group: Group, settings: ContentSettings) => {
    const resolve = (template: string) => {
      const fallbackDesc = `Join ${group.title} on ${group.platform.toUpperCase()}. Connect with active members and discuss shared topics.`;
      return template
        .replace(/\(Group Title\)/g, group.title)
        .replace(/\(Group Category\)/g, group.category || 'General')
        .replace(/\(Group Tags\)/g, (group.customTags || []).join(', '))
        .replace(/\(Site Title\)/g, settings.siteTitle)
        .replace(/\(Group Platform\)/g, group.platform.toUpperCase())
        .replace(/\(Group Description\)/g, group.description || fallbackDesc);
    };

    return {
      title: resolve(settings.detailTitleTemplate),
      description: resolve(settings.detailDescriptionTemplate)
    };
  }
};
