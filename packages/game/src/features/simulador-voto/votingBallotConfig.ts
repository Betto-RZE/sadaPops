/**
 * Configuración del Simulador de Votación (Capítulo 3).
 * Incluye los 10 recuadros para marcar el voto en la boleta oficial y los avisos de revisión.
 */

export interface BallotVotingBox {
  id: string;
  name: string;
  nameNah: string;
  left: string;
  top: string;
  width: string;
  height: string;
}

/**
 * 10 recuadros para marcar el voto distribuidos en 2 columnas y 5 filas,
 * calibrados con precisión milimétrica sobre la boleta oficial (1122 x 1402 px).
 */
export const BALLOT_VOTING_BOXES: BallotVotingBox[] = [
  // Fila 1
  {
    id: "alianza_ciudadana",
    name: "Alianza Ciudadana",
    nameNah: "Alianza Ciudadana",
    left: "42.16%",
    top: "30.31%",
    width: "5.88%",
    height: "4.78%",
  },
  {
    id: "movimiento_verde",
    name: "Movimiento Verde",
    nameNah: "Movimiento Verde",
    left: "85.56%",
    top: "30.31%",
    width: "5.88%",
    height: "4.78%",
  },
  // Fila 2
  {
    id: "frente_social",
    name: "Frente Social",
    nameNah: "Frente Social",
    left: "42.16%",
    top: "43.08%",
    width: "5.88%",
    height: "4.78%",
  },
  {
    id: "partido_del_desarrollo",
    name: "Partido del Desarrollo",
    nameNah: "Partido del Desarrollo",
    left: "85.56%",
    top: "43.08%",
    width: "5.88%",
    height: "4.78%",
  },
  // Fila 3
  {
    id: "movimiento_progresista",
    name: "Movimiento Progresista",
    nameNah: "Movimiento Progresista",
    left: "42.16%",
    top: "55.85%",
    width: "5.88%",
    height: "4.78%",
  },
  {
    id: "fuerza_comunitaria",
    name: "Fuerza Comunitaria",
    nameNah: "Fuerza Comunitaria",
    left: "85.56%",
    top: "55.85%",
    width: "5.88%",
    height: "4.78%",
  },
  // Fila 4
  {
    id: "partido_de_la_gente",
    name: "Partido de la Gente",
    nameNah: "Partido de la Gente",
    left: "42.16%",
    top: "68.62%",
    width: "5.88%",
    height: "4.78%",
  },
  {
    id: "union_vecinal",
    name: "Unión Vecinal",
    nameNah: "Unión Vecinal",
    left: "85.56%",
    top: "68.62%",
    width: "5.88%",
    height: "4.78%",
  },
  // Fila 5
  {
    id: "raices",
    name: "Raíces",
    nameNah: "Raíces",
    left: "42.16%",
    top: "81.38%",
    width: "5.88%",
    height: "4.78%",
  },
  {
    id: "candidatura_independiente",
    name: "Candidatura Independiente",
    nameNah: "Candidatura Independiente",
    left: "85.56%",
    top: "81.38%",
    width: "5.88%",
    height: "4.78%",
  },
];

export type VotingReviewCase = "unmarked" | "multiple" | "valid";

export interface VotingReviewNotice {
  caseType: VotingReviewCase;
  titleEs: string;
  titleNah: string;
  messageEs: string;
  messageNah: string;
}

export const VOTING_REVIEW_NOTICES: Record<VotingReviewCase, VotingReviewNotice> = {
  unmarked: {
    caseType: "unmarked",
    titleEs: "Boleta sin marcar",
    titleNah: "Amo machiyotili boleta",
    messageEs: "Una boleta sin marcar se considera voto nulo en el escrutinio.",
    messageNah:
      "Se boleta tlen amo kipia machiyotl mochihua tlen amo ipati ipan tlapohualistli.",
  },
  multiple: {
    caseType: "multiple",
    titleEs: "Varias opciones marcadas",
    titleNah: "Miak opciones omomachiyotijkeh",
    messageEs:
      "Has marcado varias opciones. Si corresponden a candidaturas diferentes, el voto sería nulo. En elecciones reales, algunas marcas múltiples pueden ser válidas cuando los partidos forman una coalición.",
    messageNah:
      "Otikmachiyotili miak opciones. Tla inin tlatlamantli candidaturas, in voto amo ipatis. Ipan melahuak elecciones, seki miak machiyomeh huelis kualtiyeh tla in partidos mosentlaliah.",
  },
  valid: {
    caseType: "valid",
    titleEs: "Voto válido para una opción",
    titleNah: "Kuali voto pampa se opción",
    messageEs:
      "Has señalado claramente una sola opción. En esta simulación, tu voto sería válido.",
    messageNah:
      "Kualtsin otiknexiti san se opción. Ipan inin simulador, mo voto kuali ipatis.",
  },
};

/** Evalúa la condición de la boleta según el número de opciones marcadas */
export function evaluateBallotReview(markedCount: number): VotingReviewNotice {
  if (markedCount === 0) return VOTING_REVIEW_NOTICES.unmarked;
  if (markedCount > 1) return VOTING_REVIEW_NOTICES.multiple;
  return VOTING_REVIEW_NOTICES.valid;
}
