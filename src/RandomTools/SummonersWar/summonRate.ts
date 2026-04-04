import rates from "./rate.json";

export function calcSummonRate(
  vm: number,
  vl: number,
  ld: number,
  tta: number,
): string {
  const rate4StarElem = (
    vm * rates.mystical_scroll["4_star_elem"] +
    vl * rates.legendary_scroll["4_star_elem"] +
    tta * rates.All_attributes_scroll["4_star_elem"]
  ).toPrecision(3);
  const rate5starElem = (
    vm * rates.mystical_scroll["5_star_elem"] +
    vl * rates.legendary_scroll["5_star_elem"] +
    tta * rates.All_attributes_scroll["5_star_elem"]
  ).toPrecision(3);
  const rate4starLD = (
    ld * rates.light_dark_scroll["4_star_ld"] +
    tta * rates.All_attributes_scroll["4_star_ld"]
  ).toPrecision(3);
  const rate5starLD = (
    ld * rates.light_dark_scroll["5_star_ld"] +
    tta * rates.All_attributes_scroll["5_star_ld"]
  ).toPrecision(3);
  return `Nombre de 4 star élémentaire: ${rate4StarElem}\nNombre de 5 star élémentaire: ${rate5starElem}\nNombre de 4 star LD: ${rate4starLD}\nNombre de 5 star LD: ${rate5starLD}`;
}
