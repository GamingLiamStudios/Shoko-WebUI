/* eslint-disable no-param-reassign */
import { each, isObject, unset } from 'lodash';
import { FilterFn, SortingFn, sortingFns } from '@tanstack/react-table';
import { compareItems, RankingInfo, rankItem } from '@tanstack/match-sorter-utils';
import formatThousands from 'format-thousands';

const { DEV, VITE_GITHASH, VITE_APPVERSION } = import.meta.env;

export function uiVersion() {
  return DEV ? VITE_GITHASH : VITE_APPVERSION;
}

export function isDebug() {
  return DEV;
}

export function mergeDeep(...objects) {
  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = Array.from(new Set(pVal.concat(...oVal)));
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });

    return prev;
  }, {});
}

// Needed to compare layout properties.
// Stolen from https://stackoverflow.com/questions/37246775/
export function omitDeepBy(value: any, iteratee: Function) {
  each(value, (v, k) => {
    if (iteratee(v, k)) {
      unset(value, k);
    } else if (isObject(v)) {
      omitDeepBy(v, iteratee);
    }
  });

  return value;
}

// tanstack table helpers

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

export const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0;
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]?.itemRank!,
      rowB.columnFiltersMeta[columnId]?.itemRank!,
    );
  }
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

export const formatThousand = (n: number) => formatThousands(n, ',');

export default {};
