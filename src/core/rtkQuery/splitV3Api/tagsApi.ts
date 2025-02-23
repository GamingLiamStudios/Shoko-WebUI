import type { ListResultType, PaginationType } from '@/core/types/api';
import type { TagType } from '@/core/types/api/tags';
import { splitV3Api } from '../splitV3Api';

const tagsApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    // Get a list of all known anidb tags, optionally with a filter applied.
    getAniDBTags: build.query<Array<TagType>, PaginationType & { excludeDescriptions?: boolean }>({
      query: params => ({ url: 'Tag/AniDB', params }),
      transformResponse: (response: ListResultType<Array<TagType>>) => response.List,
    }),
  }),
});

export const {
  useGetAniDBTagsQuery,
} = tagsApi;
