import { CURRENCY_MAP } from '@/lib/constants/currencies';
import { BASE_UOM_OPTIONS } from '@/lib/constants/units';
import { getRandomInt, pickOne } from '@/lib/utils';

export default function createRandomRule() {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const currencyKey = pickOne(Object.keys(CURRENCY_MAP));
  const uom = pickOne(Object.keys(BASE_UOM_OPTIONS));
  const priceModel = pickOne(['fixed', 'per_unit', 'tiered', 'index_formula', 'bundled', 'waived']);

  const rule = {
    description: `Rule Description ${randomNumber}`,
    priceModel: priceModel,
    rate: getRandomInt(100, 1000),
    uom: uom,
    currency: currencyKey,
    formula: {},
    applicability: {},
    activeFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    activeTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  };
  return rule;
}
