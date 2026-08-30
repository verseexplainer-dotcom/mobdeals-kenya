import type { Product, ProductSpec } from './types';

const allowedSpecificationLabels = new Set([
  'Processor',
  'Generation',
  'Memory',
  'RAM',
  'Storage',
  'Display',
  'Graphics',
  'Touchscreen',
  'Condition'
]);

const unusableValue = /^(?:-|n\/?a|none|null|undefined|not specified|unknown)$/i;

export function getProductDisplaySpecs(product: Product): ProductSpec[] {
  const specifications = product.specs
    .filter((spec) => allowedSpecificationLabels.has(spec.label))
    .map((spec) => ({
      label: spec.label === 'Memory' ? 'RAM' : spec.label,
      value: spec.value.trim()
    }))
    .filter((spec) => spec.value.length > 0 && !unusableValue.test(spec.value));

  if (!specifications.some((spec) => spec.label === 'Condition') && product.condition) {
    specifications.push({ label: 'Condition', value: product.condition });
  }

  return specifications.filter((spec, index, all) => all.findIndex((item) => item.label === spec.label) === index);
}

export function getProductDisplaySummary(product: Product): string {
  const details = getProductDisplaySpecs(product)
    .filter((spec) => spec.label !== 'Condition')
    .slice(0, 6)
    .map((spec) => `${spec.label}: ${spec.value}`);

  return details.length > 0
    ? `Key details include ${details.join(', ')}.`
    : 'See the listed price, condition and warranty information, then contact our team to confirm availability.';
}
