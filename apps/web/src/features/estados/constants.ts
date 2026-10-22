export type StateMetrics = { voted: number; notVoted: number; unspecified: number; nominal: number };
export type StateSample = { id: string; name: string; short: string; data: Record<number, StateMetrics>; character: string };

export const STATE_YEARS = [2021, 2024] as const;

/** Color coding stays stable across state selections: P1 = magenta, P2 = deep teal. */
export const DUEL_COLORS = { p1: "#E3007E", p2: "#1F8F8C" } as const;
export const DUEL_TINTS = { p1: "#FFE4F1", p2: "#DDF3F2" } as const;

// INE CCPC totals aggregated by entity from the official 2021 and 2024 open data files.
export const STATE_SAMPLES: StateSample[] = [
  {
    id: "01",
    name: "Aguascalientes",
    short: "01",
    data: { 2021: { voted: 489469, notVoted: 499413, unspecified: 28538, nominal: 1017420 }, 2024: { voted: 626084, notVoted: 441222, unspecified: 29865, nominal: 1097171 } },
    character: "/estados/aguascalientes-fighter-16bit.png",
  },
  {
    id: "02",
    name: "Baja California",
    short: "02",
    data: { 2021: { voted: 1025203, notVoted: 1701486, unspecified: 192519, nominal: 2919208 }, 2024: { voted: 1396335, notVoted: 1571676, unspecified: 229806, nominal: 3197817 } },
    character: "/estados/baja-california-fighter-16bit.png",
  },
  {
    id: "03",
    name: "Baja California Sur",
    short: "03",
    data: { 2021: { voted: 256325, notVoted: 278562, unspecified: 26780, nominal: 561667 }, 2024: { voted: 310713, notVoted: 274921, unspecified: 27979, nominal: 613613 } },
    character: "/estados/baja-california-sur-fighter-16bit.png",
  },
  {
    id: "04",
    name: "Campeche",
    short: "04",
    data: { 2021: { voted: 380908, notVoted: 233582, unspecified: 54265, nominal: 668755 }, 2024: { voted: 372086, notVoted: 219303, unspecified: 103211, nominal: 694600 } },
    character: "/estados/campeche-fighter-16bit.png",
  },
  {
    id: "05",
    name: "Coahuila",
    short: "05",
    data: { 2021: { voted: 1251459, notVoted: 944211, unspecified: 66406, nominal: 2262076 }, 2024: { voted: 1332644, notVoted: 728554, unspecified: 349472, nominal: 2410670 } },
    character: "/estados/coahuila-fighter-16bit.png",
  },
  {
    id: "06",
    name: "Colima",
    short: "06",
    data: { 2021: { voted: 284539, notVoted: 264167, unspecified: 7615, nominal: 556321 }, 2024: { voted: 321763, notVoted: 248259, unspecified: 14899, nominal: 584921 } },
    character: "/estados/colima-fighter-16bit.png",
  },
  {
    id: "07",
    name: "Chiapas",
    short: "07",
    data: { 2021: { voted: 2078287, notVoted: 1317852, unspecified: 385828, nominal: 3781967 }, 2024: { voted: 2180203, notVoted: 1349180, unspecified: 473993, nominal: 4003376 } },
    character: "/estados/chiapas-fighter-16bit.png",
  },
  {
    id: "08",
    name: "Chihuahua",
    short: "08",
    data: { 2021: { voted: 1156752, notVoted: 1368788, unspecified: 368950, nominal: 2894490 }, 2024: { voted: 1360070, notVoted: 1262547, unspecified: 459746, nominal: 3082363 } },
    character: "/estados/chihuahua-fighter-16bit.png",
  },
  {
    id: "09",
    name: "Ciudad de México",
    short: "09",
    data: { 2021: { voted: 3964777, notVoted: 3688823, unspecified: 118918, nominal: 7772518 }, 2024: { voted: 5383288, notVoted: 2383980, unspecified: 151322, nominal: 7918590 } },
    character: "/estados/ciudad-de-mexico-fighter-16bit.png",
  },
  {
    id: "10",
    name: "Durango",
    short: "10",
    data: { 2021: { voted: 546301, notVoted: 752105, unspecified: 35458, nominal: 1333864 }, 2024: { voted: 735959, notVoted: 633637, unspecified: 27953, nominal: 1397549 } },
    character: "/estados/durango-fighter-16bit.png",
  },
  {
    id: "11",
    name: "Guanajuato",
    short: "11",
    data: { 2021: { voted: 1948742, notVoted: 2525104, unspecified: 109872, nominal: 4583718 }, 2024: { voted: 2592525, notVoted: 2051034, unspecified: 187600, nominal: 4831159 } },
    character: "/estados/guanajuato-fighter-16bit.png",
  },
  {
    id: "12",
    name: "Guerrero",
    short: "12",
    data: { 2021: { voted: 1405231, notVoted: 1088952, unspecified: 68878, nominal: 2563061 }, 2024: { voted: 1424264, notVoted: 1085641, unspecified: 133351, nominal: 2643256 } },
    character: "/estados/guerrero-fighter-16bit.png",
  },
  {
    id: "13",
    name: "Hidalgo",
    short: "13",
    data: { 2021: { voted: 1001176, notVoted: 1174720, unspecified: 64430, nominal: 2240326 }, 2024: { voted: 1427044, notVoted: 816507, unspecified: 142755, nominal: 2386306 } },
    character: "/estados/hidalgo-fighter-16bit.png",
  },
  {
    id: "14",
    name: "Jalisco",
    short: "14",
    data: { 2021: { voted: 2844834, notVoted: 3160033, unspecified: 209897, nominal: 6214764 }, 2024: { voted: 3555352, notVoted: 2675653, unspecified: 388374, nominal: 6619379 } },
    character: "/estados/jalisco-fighter-16bit.png",
  },
  {
    id: "15",
    name: "Estado de México",
    short: "15",
    data: { 2021: { voted: 6456957, notVoted: 5608286, unspecified: 311357, nominal: 12376600 }, 2024: { voted: 7959555, notVoted: 4506099, unspecified: 561118, nominal: 13026772 } },
    character: "/estados/estado-de-mexico-fighter-16bit.png",
  },
  {
    id: "16",
    name: "Michoacán",
    short: "16",
    data: { 2021: { voted: 1619355, notVoted: 1737229, unspecified: 218240, nominal: 3574824 }, 2024: { voted: 1856524, notVoted: 1584446, unspecified: 308015, nominal: 3748985 } },
    character: "/estados/michoacan-fighter-16bit.png",
  },
  {
    id: "17",
    name: "Morelos",
    short: "17",
    data: { 2021: { voted: 745103, notVoted: 691368, unspecified: 59611, nominal: 1496082 }, 2024: { voted: 891464, notVoted: 559413, unspecified: 98729, nominal: 1549606 } },
    character: "/estados/morelos-fighter-16bit.png",
  },
  {
    id: "18",
    name: "Nayarit",
    short: "18",
    data: { 2021: { voted: 443659, notVoted: 402586, unspecified: 45260, nominal: 891505 }, 2024: { voted: 491815, notVoted: 389953, unspecified: 68885, nominal: 950653 } },
    character: "/estados/nayarit-fighter-16bit.png",
  },
  {
    id: "19",
    name: "Nuevo León",
    short: "19",
    data: { 2021: { voted: 1941149, notVoted: 1905114, unspecified: 343459, nominal: 4189722 }, 2024: { voted: 2303911, notVoted: 1832065, unspecified: 330295, nominal: 4466271 } },
    character: "/estados/nuevo-leon-fighter-16bit.png",
  },
  {
    id: "20",
    name: "Oaxaca",
    short: "20",
    data: { 2021: { voted: 1635909, notVoted: 1295698, unspecified: 81696, nominal: 3013303 }, 2024: { voted: 1703640, notVoted: 1200572, unspecified: 212459, nominal: 3116671 } },
    character: "/estados/oaxaca-fighter-16bit.png",
  },
  {
    id: "21",
    name: "Puebla",
    short: "21",
    data: { 2021: { voted: 2549998, notVoted: 2055379, unspecified: 134593, nominal: 4739970 }, 2024: { voted: 2963223, notVoted: 1647122, unspecified: 368328, nominal: 4978673 } },
    character: "/estados/puebla-fighter-16bit.png",
  },
  {
    id: "22",
    name: "Querétaro",
    short: "22",
    data: { 2021: { voted: 865774, notVoted: 829904, unspecified: 40710, nominal: 1736388 }, 2024: { voted: 1131708, notVoted: 724097, unspecified: 43248, nominal: 1899053 } },
    character: "/estados/queretaro-fighter-16bit.png",
  },
  {
    id: "23",
    name: "Quintana Roo",
    short: "23",
    data: { 2021: { voted: 546496, notVoted: 714924, unspecified: 61181, nominal: 1322601 }, 2024: { voted: 773940, notVoted: 640198, unspecified: 45933, nominal: 1460071 } },
    character: "/estados/quintana-roo-fighter-16bit.png",
  },
  {
    id: "24",
    name: "San Luis Potosí",
    short: "24",
    data: { 2021: { voted: 1149197, notVoted: 829181, unspecified: 89929, nominal: 2068307 }, 2024: { voted: 1239523, notVoted: 784885, unspecified: 161062, nominal: 2185470 } },
    character: "/estados/san-luis-potosi-fighter-16bit.png",
  },
  {
    id: "25",
    name: "Sinaloa",
    short: "25",
    data: { 2021: { voted: 993504, notVoted: 1029936, unspecified: 228692, nominal: 2252132 }, 2024: { voted: 1162020, notVoted: 969260, unspecified: 229339, nominal: 2360619 } },
    character: "/estados/sinaloa-fighter-16bit.png",
  },
  {
    id: "26",
    name: "Sonora",
    short: "26",
    data: { 2021: { voted: 862710, notVoted: 1165572, unspecified: 159384, nominal: 2187666 }, 2024: { voted: 1018161, notVoted: 1035322, unspecified: 237530, nominal: 2291013 } },
    character: "/estados/sonora-fighter-16bit.png",
  },
  {
    id: "27",
    name: "Tabasco",
    short: "27",
    data: { 2021: { voted: 895703, notVoted: 808437, unspecified: 48628, nominal: 1752768 }, 2024: { voted: 996395, notVoted: 667359, unspecified: 147756, nominal: 1811510 } },
    character: "/estados/tabasco-fighter-16bit.png",
  },
  {
    id: "28",
    name: "Tamaulipas",
    short: "28",
    data: { 2021: { voted: 1346581, notVoted: 1260749, unspecified: 128621, nominal: 2735951 }, 2024: { voted: 1430666, notVoted: 1150369, unspecified: 267947, nominal: 2848982 } },
    character: "/estados/tamaulipas-fighter-16bit.png",
  },
  {
    id: "29",
    name: "Tlaxcala",
    short: "29",
    data: { 2021: { voted: 605532, notVoted: 315142, unspecified: 52726, nominal: 973400 }, 2024: { voted: 684285, notVoted: 291993, unspecified: 66418, nominal: 1042696 } },
    character: "/estados/tlaxcala-fighter-16bit.png",
  },
  {
    id: "30",
    name: "Veracruz",
    short: "30",
    data: { 2021: { voted: 3452793, notVoted: 2361724, unspecified: 165132, nominal: 5979649 }, 2024: { voted: 3392712, notVoted: 2415520, unspecified: 272285, nominal: 6080517 } },
    character: "/estados/veracruz-fighter-16bit.png",
  },
  {
    id: "31",
    name: "Yucatán",
    short: "31",
    data: { 2021: { voted: 987141, notVoted: 578110, unspecified: 94821, nominal: 1660072 }, 2024: { voted: 1165576, notVoted: 465769, unspecified: 134732, nominal: 1766077 } },
    character: "/estados/yucatan-fighter-16bit.png",
  },
  {
    id: "32",
    name: "Zacatecas",
    short: "32",
    data: { 2021: { voted: 657625, notVoted: 512487, unspecified: 40926, nominal: 1211038 }, 2024: { voted: 715780, notVoted: 498910, unspecified: 51249, nominal: 1265939 } },
    character: "/estados/zacatecas-fighter-16bit.png",
  },
];

export const participation = (metrics: StateMetrics) => (metrics.voted / (metrics.voted + metrics.notVoted)) * 100;
export const formatCount = (value: number) => value.toLocaleString("es-MX");
