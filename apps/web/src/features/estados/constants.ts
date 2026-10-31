export type StateMetrics = { voted: number; notVoted: number; unspecified: number; nominal: number };
export type StateSample = { id: string; name: string; short: string; data: Record<number, StateMetrics>; character: string };

export const STATE_YEARS = [2009, 2012, 2015, 2018, 2021, 2024] as const;

/** Color coding stays stable across state selections: P1 = magenta, P2 = deep teal. */
export const DUEL_COLORS = { p1: "#E3007E", p2: "#1F8F8C" } as const;
export const DUEL_TINTS = { p1: "#FFE4F1", p2: "#DDF3F2" } as const;

// INE CCPC totals aggregated by entity from the official 2009–2024 open data files.
export const STATE_SAMPLES: StateSample[] = [
  {
    id: "01",
    name: "Aguascalientes",
    short: "01",
    data: { 2009: { voted: 291485, notVoted: 404607, unspecified: 77338, nominal: 773430 }, 2012: { voted: 460524, notVoted: 321239, unspecified: 29, nominal: 781792 }, 2015: { voted: 302614, notVoted: 528453, unspecified: 36289, nominal: 867356 }, 2018: { voted: 538993, notVoted: 391032, unspecified: 13434, nominal: 943459 }, 2021: { voted: 489469, notVoted: 499413, unspecified: 28538, nominal: 1017420 }, 2024: { voted: 626084, notVoted: 441222, unspecified: 29865, nominal: 1097171 } },
    character: "/estados/aguascalientes-fighter-16bit.png",
  },
  {
    id: "02",
    name: "Baja California",
    short: "02",
    data: { 2009: { voted: 661834, notVoted: 1516824, unspecified: 94522, nominal: 2273180 }, 2012: { voted: 1184578, notVoted: 1082188, unspecified: 2746, nominal: 2269512 }, 2015: { voted: 731591, notVoted: 1710732, unspecified: 35563, nominal: 2477886 }, 2018: { voted: 1376956, notVoted: 1302969, unspecified: 51644, nominal: 2731569 }, 2021: { voted: 1025203, notVoted: 1701486, unspecified: 192519, nominal: 2919208 }, 2024: { voted: 1396335, notVoted: 1571676, unspecified: 229806, nominal: 3197817 } },
    character: "/estados/baja-california-fighter-16bit.png",
  },
  {
    id: "03",
    name: "Baja California Sur",
    short: "03",
    data: { 2009: { voted: 125675, notVoted: 254908, unspecified: 11674, nominal: 392257 }, 2012: { voted: 236606, notVoted: 178146, unspecified: 26, nominal: 414778 }, 2015: { voted: 195716, notVoted: 185348, unspecified: 84312, nominal: 465376 }, 2018: { voted: 273586, notVoted: 213158, unspecified: 29408, nominal: 516152 }, 2021: { voted: 256325, notVoted: 278562, unspecified: 26780, nominal: 561667 }, 2024: { voted: 310713, notVoted: 274921, unspecified: 27979, nominal: 613613 } },
    character: "/estados/baja-california-sur-fighter-16bit.png",
  },
  {
    id: "04",
    name: "Campeche",
    short: "04",
    data: { 2009: { voted: 327297, notVoted: 200205, unspecified: 6311, nominal: 533813 }, 2012: { voted: 359413, notVoted: 184072, unspecified: 7, nominal: 543492 }, 2015: { voted: 313469, notVoted: 209877, unspecified: 80265, nominal: 603611 }, 2018: { voted: 397912, notVoted: 181761, unspecified: 62385, nominal: 642058 }, 2021: { voted: 380908, notVoted: 233582, unspecified: 54265, nominal: 668755 }, 2024: { voted: 372086, notVoted: 219303, unspecified: 103211, nominal: 694600 } },
    character: "/estados/campeche-fighter-16bit.png",
  },
  {
    id: "05",
    name: "Coahuila",
    short: "05",
    data: { 2009: { voted: 805065, notVoted: 1023516, unspecified: 21482, nominal: 1850063 }, 2012: { voted: 1099546, notVoted: 695102, unspecified: 11007, nominal: 1805655 }, 2015: { voted: 856908, notVoted: 1073307, unspecified: 61825, nominal: 1992040 }, 2018: { voted: 1281125, notVoted: 774570, unspecified: 98407, nominal: 2154102 }, 2021: { voted: 1251459, notVoted: 944211, unspecified: 66406, nominal: 2262076 }, 2024: { voted: 1332644, notVoted: 728554, unspecified: 349472, nominal: 2410670 } },
    character: "/estados/coahuila-fighter-16bit.png",
  },
  {
    id: "06",
    name: "Colima",
    short: "06",
    data: { 2009: { voted: 259514, notVoted: 189881, unspecified: 3485, nominal: 452880 }, 2012: { voted: 262384, notVoted: 160386, unspecified: 548, nominal: 423318 }, 2015: { voted: 270427, notVoted: 185868, unspecified: 42237, nominal: 498532 }, 2018: { voted: 321518, notVoted: 199436, unspecified: 9767, nominal: 530721 }, 2021: { voted: 284539, notVoted: 264167, unspecified: 7615, nominal: 556321 }, 2024: { voted: 321763, notVoted: 248259, unspecified: 14899, nominal: 584921 } },
    character: "/estados/colima-fighter-16bit.png",
  },
  {
    id: "07",
    name: "Chiapas",
    short: "07",
    data: { 2009: { voted: 1082582, notVoted: 1694971, unspecified: 77400, nominal: 2854953 }, 2012: { voted: 1926140, notVoted: 985922, unspecified: 5000, nominal: 2917062 }, 2015: { voted: 1417957, notVoted: 1665118, unspecified: 203150, nominal: 3286225 }, 2018: { voted: 2165008, notVoted: 1003433, unspecified: 380977, nominal: 3549418 }, 2021: { voted: 2078287, notVoted: 1317852, unspecified: 385828, nominal: 3781967 }, 2024: { voted: 2180203, notVoted: 1349180, unspecified: 473993, nominal: 4003376 } },
    character: "/estados/chiapas-fighter-16bit.png",
  },
  {
    id: "08",
    name: "Chihuahua",
    short: "08",
    data: { 2009: { voted: 772178, notVoted: 1665271, unspecified: 136278, nominal: 2573727 }, 2012: { voted: 1173445, notVoted: 1097704, unspecified: 4460, nominal: 2275609 }, 2015: { voted: 776736, notVoted: 1679381, unspecified: 111620, nominal: 2567737 }, 2018: { voted: 1290601, notVoted: 1136840, unspecified: 315831, nominal: 2743272 }, 2021: { voted: 1156752, notVoted: 1368788, unspecified: 368950, nominal: 2894490 }, 2024: { voted: 1360070, notVoted: 1262547, unspecified: 459746, nominal: 3082363 } },
    character: "/estados/chihuahua-fighter-16bit.png",
  },
  {
    id: "09",
    name: "Ciudad de México",
    short: "09",
    data: { 2009: { voted: 2954313, notVoted: 4304608, unspecified: 61243, nominal: 7320164 }, 2012: { voted: 4699505, notVoted: 2401995, unspecified: 7323, nominal: 7108823 }, 2015: { voted: 3091764, notVoted: 4001601, unspecified: 273419, nominal: 7366784 }, 2018: { voted: 5186417, notVoted: 2215649, unspecified: 226349, nominal: 7628415 }, 2021: { voted: 3964777, notVoted: 3688823, unspecified: 118918, nominal: 7772518 }, 2024: { voted: 5383288, notVoted: 2383980, unspecified: 151322, nominal: 7918590 } },
    character: "/estados/ciudad-de-mexico-fighter-16bit.png",
  },
  {
    id: "10",
    name: "Durango",
    short: "10",
    data: { 2009: { voted: 467624, notVoted: 669090, unspecified: 8458, nominal: 1145172 }, 2012: { voted: 658380, notVoted: 472867, unspecified: 71, nominal: 1131318 }, 2015: { voted: 458200, notVoted: 649215, unspecified: 92829, nominal: 1200244 }, 2018: { voted: 671514, notVoted: 528267, unspecified: 79903, nominal: 1279684 }, 2021: { voted: 546301, notVoted: 752105, unspecified: 35458, nominal: 1333864 }, 2024: { voted: 735959, notVoted: 633637, unspecified: 27953, nominal: 1397549 } },
    character: "/estados/durango-fighter-16bit.png",
  },
  {
    id: "11",
    name: "Guanajuato",
    short: "11",
    data: { 2009: { voted: 1672589, notVoted: 1886766, unspecified: 187309, nominal: 3746664 }, 2012: { voted: 2184470, notVoted: 1531035, unspecified: 916, nominal: 3716421 }, 2015: { voted: 1698101, notVoted: 2067579, unspecified: 327952, nominal: 4093632 }, 2018: { voted: 2117801, notVoted: 1928631, unspecified: 313111, nominal: 4359543 }, 2021: { voted: 1948742, notVoted: 2525104, unspecified: 109872, nominal: 4583718 }, 2024: { voted: 2592525, notVoted: 2051034, unspecified: 187600, nominal: 4831159 } },
    character: "/estados/guanajuato-fighter-16bit.png",
  },
  {
    id: "12",
    name: "Guerrero",
    short: "12",
    data: { 2009: { voted: 715995, notVoted: 1527144, unspecified: 66459, nominal: 2309598 }, 2012: { voted: 1288370, notVoted: 896091, unspecified: 24908, nominal: 2209369 }, 2015: { voted: 1121700, notVoted: 861932, unspecified: 421337, nominal: 2404969 }, 2018: { voted: 1455177, notVoted: 874896, unspecified: 176884, nominal: 2506957 }, 2021: { voted: 1405231, notVoted: 1088952, unspecified: 68878, nominal: 2563061 }, 2024: { voted: 1424264, notVoted: 1085641, unspecified: 133351, nominal: 2643256 } },
    character: "/estados/guerrero-fighter-16bit.png",
  },
  {
    id: "13",
    name: "Hidalgo",
    short: "13",
    data: { 2009: { voted: 739622, notVoted: 993538, unspecified: 54662, nominal: 1787822 }, 2012: { voted: 1159416, notVoted: 628884, unspecified: 775, nominal: 1789075 }, 2015: { voted: 852369, notVoted: 1052000, unspecified: 65075, nominal: 1969444 }, 2018: { voted: 1186248, notVoted: 627732, unspecified: 304509, nominal: 2118489 }, 2021: { voted: 1001176, notVoted: 1174720, unspecified: 64430, nominal: 2240326 }, 2024: { voted: 1427044, notVoted: 816507, unspecified: 142755, nominal: 2386306 } },
    character: "/estados/hidalgo-fighter-16bit.png",
  },
  {
    id: "14",
    name: "Jalisco",
    short: "14",
    data: { 2009: { voted: 2570273, notVoted: 2450936, unspecified: 112661, nominal: 5133870 }, 2012: { voted: 3207536, notVoted: 1813052, unspecified: 6679, nominal: 5027267 }, 2015: { voted: 2770019, notVoted: 2551453, unspecified: 191561, nominal: 5513033 }, 2018: { voted: 3209827, notVoted: 2308286, unspecified: 386113, nominal: 5904226 }, 2021: { voted: 2844834, notVoted: 3160033, unspecified: 209897, nominal: 6214764 }, 2024: { voted: 3555352, notVoted: 2675653, unspecified: 388374, nominal: 6619379 } },
    character: "/estados/jalisco-fighter-16bit.png",
  },
  {
    id: "15",
    name: "Estado de México",
    short: "15",
    data: { 2009: { voted: 4969091, notVoted: 4805304, unspecified: 245937, nominal: 10020332 }, 2012: { voted: 6607681, notVoted: 3491876, unspecified: 5327, nominal: 10104884 }, 2015: { voted: 5108927, notVoted: 5105234, unspecified: 809494, nominal: 11023655 }, 2018: { voted: 7492239, notVoted: 3666301, unspecified: 673664, nominal: 11832204 }, 2021: { voted: 6456957, notVoted: 5608286, unspecified: 311357, nominal: 12376600 }, 2024: { voted: 7959555, notVoted: 4506099, unspecified: 561118, nominal: 13026772 } },
    character: "/estados/estado-de-mexico-fighter-16bit.png",
  },
  {
    id: "16",
    name: "Michoacán",
    short: "16",
    data: { 2009: { voted: 1012270, notVoted: 2086574, unspecified: 109608, nominal: 3208452 }, 2012: { voted: 1520123, notVoted: 1432932, unspecified: 651, nominal: 2953706 }, 2015: { voted: 1617416, notVoted: 1381670, unspecified: 241150, nominal: 3240236 }, 2018: { voted: 1831908, notVoted: 1376416, unspecified: 200950, nominal: 3409274 }, 2021: { voted: 1619355, notVoted: 1737229, unspecified: 218240, nominal: 3574824 }, 2024: { voted: 1856524, notVoted: 1584446, unspecified: 308015, nominal: 3748985 } },
    character: "/estados/michoacan-fighter-16bit.png",
  },
  {
    id: "17",
    name: "Morelos",
    short: "17",
    data: { 2009: { voted: 624132, notVoted: 650690, unspecified: 11388, nominal: 1286210 }, 2012: { voted: 812919, notVoted: 455814, unspecified: 18216, nominal: 1286949 }, 2015: { voted: 716804, notVoted: 599264, unspecified: 52568, nominal: 1368636 }, 2018: { voted: 902649, notVoted: 477236, unspecified: 59498, nominal: 1439383 }, 2021: { voted: 745103, notVoted: 691368, unspecified: 59611, nominal: 1496082 }, 2024: { voted: 891464, notVoted: 559413, unspecified: 98729, nominal: 1549606 } },
    character: "/estados/morelos-fighter-16bit.png",
  },
  {
    id: "18",
    name: "Nayarit",
    short: "18",
    data: { 2009: { voted: 296941, notVoted: 417486, unspecified: 19260, nominal: 733687 }, 2012: { voted: 410306, notVoted: 263054, unspecified: 634, nominal: 673994 }, 2015: { voted: 310866, notVoted: 452080, unspecified: 30598, nominal: 793544 }, 2018: { voted: 461910, notVoted: 369166, unspecified: 15737, nominal: 846813 }, 2021: { voted: 443659, notVoted: 402586, unspecified: 45260, nominal: 891505 }, 2024: { voted: 491815, notVoted: 389953, unspecified: 68885, nominal: 950653 } },
    character: "/estados/nayarit-fighter-16bit.png",
  },
  {
    id: "19",
    name: "Nuevo León",
    short: "19",
    data: { 2009: { voted: 1651406, notVoted: 1451247, unspecified: 108534, nominal: 3211187 }, 2012: { voted: 1910409, notVoted: 1283457, unspecified: 868, nominal: 3194734 }, 2015: { voted: 1962612, notVoted: 1424522, unspecified: 173328, nominal: 3560462 }, 2018: { voted: 1941574, notVoted: 1600329, unspecified: 358653, nominal: 3900556 }, 2021: { voted: 1941149, notVoted: 1905114, unspecified: 343459, nominal: 4189722 }, 2024: { voted: 2303911, notVoted: 1832065, unspecified: 330295, nominal: 4466271 } },
    character: "/estados/nuevo-leon-fighter-16bit.png",
  },
  {
    id: "20",
    name: "Oaxaca",
    short: "20",
    data: { 2009: { voted: 1017987, notVoted: 1473998, unspecified: 17664, nominal: 2509649 }, 2012: { voted: 1536456, notVoted: 1003503, unspecified: 8810, nominal: 2548769 }, 2015: { voted: 930277, notVoted: 1355581, unspecified: 432918, nominal: 2718776 }, 2018: { voted: 1765686, notVoted: 921416, unspecified: 176166, nominal: 2863268 }, 2021: { voted: 1635909, notVoted: 1295698, unspecified: 81696, nominal: 3013303 }, 2024: { voted: 1703640, notVoted: 1200572, unspecified: 212459, nominal: 3116671 } },
    character: "/estados/oaxaca-fighter-16bit.png",
  },
  {
    id: "21",
    name: "Puebla",
    short: "21",
    data: { 2009: { voted: 1397426, notVoted: 2327319, unspecified: 27677, nominal: 3752422 }, 2012: { voted: 2385891, notVoted: 1467540, unspecified: 9550, nominal: 3862981 }, 2015: { voted: 1680435, notVoted: 2418071, unspecified: 73846, nominal: 4172352 }, 2018: { voted: 2814553, notVoted: 1358990, unspecified: 327085, nominal: 4500628 }, 2021: { voted: 2549998, notVoted: 2055379, unspecified: 134593, nominal: 4739970 }, 2024: { voted: 2963223, notVoted: 1647122, unspecified: 368328, nominal: 4978673 } },
    character: "/estados/puebla-fighter-16bit.png",
  },
  {
    id: "22",
    name: "Querétaro",
    short: "22",
    data: { 2009: { voted: 671180, notVoted: 477056, unspecified: 6357, nominal: 1154593 }, 2012: { voted: 810653, notVoted: 420801, unspecified: 34, nominal: 1231488 }, 2015: { voted: 763374, notVoted: 587403, unspecified: 63021, nominal: 1413798 }, 2018: { voted: 962418, notVoted: 580330, unspecified: 40210, nominal: 1582958 }, 2021: { voted: 865774, notVoted: 829904, unspecified: 40710, nominal: 1736388 }, 2024: { voted: 1131708, notVoted: 724097, unspecified: 43248, nominal: 1899053 } },
    character: "/estados/queretaro-fighter-16bit.png",
  },
  {
    id: "23",
    name: "Quintana Roo",
    short: "23",
    data: { 2009: { voted: 291252, notVoted: 509757, unspecified: 10640, nominal: 811649 }, 2012: { voted: 512469, notVoted: 397708, unspecified: 23, nominal: 910200 }, 2015: { voted: 337101, notVoted: 508939, unspecified: 192734, nominal: 1038774 }, 2018: { voted: 682880, notVoted: 487665, unspecified: 38125, nominal: 1208670 }, 2021: { voted: 546496, notVoted: 714924, unspecified: 61181, nominal: 1322601 }, 2024: { voted: 773940, notVoted: 640198, unspecified: 45933, nominal: 1460071 } },
    character: "/estados/quintana-roo-fighter-16bit.png",
  },
  {
    id: "24",
    name: "San Luis Potosí",
    short: "24",
    data: { 2009: { voted: 932656, notVoted: 776862, unspecified: 19749, nominal: 1729267 }, 2012: { voted: 1072140, notVoted: 631823, unspecified: 709, nominal: 1704672 }, 2015: { voted: 975762, notVoted: 751341, unspecified: 132530, nominal: 1859633 }, 2018: { voted: 1180567, notVoted: 702249, unspecified: 91518, nominal: 1974334 }, 2021: { voted: 1149197, notVoted: 829181, unspecified: 89929, nominal: 2068307 }, 2024: { voted: 1239523, notVoted: 784885, unspecified: 161062, nominal: 2185470 } },
    character: "/estados/san-luis-potosi-fighter-16bit.png",
  },
  {
    id: "25",
    name: "Sinaloa",
    short: "25",
    data: { 2009: { voted: 722122, notVoted: 1046910, unspecified: 90778, nominal: 1859810 }, 2012: { voted: 1056853, notVoted: 700856, unspecified: 2859, nominal: 1760568 }, 2015: { voted: 725737, notVoted: 1203500, unspecified: 79089, nominal: 2008326 }, 2018: { voted: 1051232, notVoted: 723409, unspecified: 360622, nominal: 2135263 }, 2021: { voted: 993504, notVoted: 1029936, unspecified: 228692, nominal: 2252132 }, 2024: { voted: 1162020, notVoted: 969260, unspecified: 229339, nominal: 2360619 } },
    character: "/estados/sinaloa-fighter-16bit.png",
  },
  {
    id: "26",
    name: "Sonora",
    short: "26",
    data: { 2009: { voted: 908889, notVoted: 899166, unspecified: 18118, nominal: 1826173 }, 2012: { voted: 984981, notVoted: 730704, unspecified: 2952, nominal: 1718637 }, 2015: { voted: 850704, notVoted: 825469, unspecified: 291456, nominal: 1967629 }, 2018: { voted: 908495, notVoted: 894834, unspecified: 298397, nominal: 2101726 }, 2021: { voted: 862710, notVoted: 1165572, unspecified: 159384, nominal: 2187666 }, 2024: { voted: 1018161, notVoted: 1035322, unspecified: 237530, nominal: 2291013 } },
    character: "/estados/sonora-fighter-16bit.png",
  },
  {
    id: "27",
    name: "Tabasco",
    short: "27",
    data: { 2009: { voted: 552736, notVoted: 804737, unspecified: 99810, nominal: 1457283 }, 2012: { voted: 1020390, notVoted: 434876, unspecified: 632, nominal: 1455898 }, 2015: { voted: 784562, notVoted: 589650, unspecified: 239345, nominal: 1613557 }, 2018: { voted: 1020270, notVoted: 440353, unspecified: 227005, nominal: 1687628 }, 2021: { voted: 895703, notVoted: 808437, unspecified: 48628, nominal: 1752768 }, 2024: { voted: 996395, notVoted: 667359, unspecified: 147756, nominal: 1811510 } },
    character: "/estados/tabasco-fighter-16bit.png",
  },
  {
    id: "28",
    name: "Tamaulipas",
    short: "28",
    data: { 2009: { voted: 978451, notVoted: 1426883, unspecified: 24068, nominal: 2429402 }, 2012: { voted: 1290018, notVoted: 959703, unspecified: 3694, nominal: 2253415 }, 2015: { voted: 1075063, notVoted: 1365838, unspecified: 57084, nominal: 2497985 }, 2018: { voted: 1477627, notVoted: 972669, unspecified: 178459, nominal: 2628755 }, 2021: { voted: 1346581, notVoted: 1260749, unspecified: 128621, nominal: 2735951 }, 2024: { voted: 1430666, notVoted: 1150369, unspecified: 267947, nominal: 2848982 } },
    character: "/estados/tamaulipas-fighter-16bit.png",
  },
  {
    id: "29",
    name: "Tlaxcala",
    short: "29",
    data: { 2009: { voted: 276272, notVoted: 490907, unspecified: 4773, nominal: 771952 }, 2012: { voted: 506661, notVoted: 296664, unspecified: 3303, nominal: 806628 }, 2015: { voted: 328651, notVoted: 518505, unspecified: 9001, nominal: 856157 }, 2018: { voted: 573366, notVoted: 304083, unspecified: 44568, nominal: 922017 }, 2021: { voted: 605532, notVoted: 315142, unspecified: 52726, nominal: 973400 }, 2024: { voted: 684285, notVoted: 291993, unspecified: 66418, nominal: 1042696 } },
    character: "/estados/tlaxcala-fighter-16bit.png",
  },
  {
    id: "30",
    name: "Veracruz",
    short: "30",
    data: { 2009: { voted: 2390340, notVoted: 2706908, unspecified: 112962, nominal: 5210210 }, 2012: { voted: 3398627, notVoted: 1784916, unspecified: 18463, nominal: 5202006 }, 2015: { voted: 2469332, notVoted: 3009926, unspecified: 103484, nominal: 5582742 }, 2018: { voted: 3461610, notVoted: 1915641, unspecified: 398679, nominal: 5775930 }, 2021: { voted: 3452793, notVoted: 2361724, unspecified: 165132, nominal: 5979649 }, 2024: { voted: 3392712, notVoted: 2415520, unspecified: 272285, nominal: 6080517 } },
    character: "/estados/veracruz-fighter-16bit.png",
  },
  {
    id: "31",
    name: "Yucatán",
    short: "31",
    data: { 2009: { voted: 708573, notVoted: 562771, unspecified: 7747, nominal: 1279091 }, 2012: { voted: 1010504, notVoted: 305066, unspecified: 26798, nominal: 1342368 }, 2015: { voted: 944704, notVoted: 394326, unspecified: 97586, nominal: 1436616 }, 2018: { voted: 1056284, notVoted: 361942, unspecified: 125837, nominal: 1544063 }, 2021: { voted: 987141, notVoted: 578110, unspecified: 94821, nominal: 1660072 }, 2024: { voted: 1165576, notVoted: 465769, unspecified: 134732, nominal: 1766077 } },
    character: "/estados/yucatan-fighter-16bit.png",
  },
  {
    id: "32",
    name: "Zacatecas",
    short: "32",
    data: { 2009: { voted: 469204, notVoted: 602123, unspecified: 11542, nominal: 1082869 }, 2012: { voted: 635760, notVoted: 429183, unspecified: 631, nominal: 1065574 }, 2015: { voted: 486714, notVoted: 604691, unspecified: 12310, nominal: 1103715 }, 2018: { voted: 726448, notVoted: 410167, unspecified: 25847, nominal: 1162462 }, 2021: { voted: 657625, notVoted: 512487, unspecified: 40926, nominal: 1211038 }, 2024: { voted: 715780, notVoted: 498910, unspecified: 51249, nominal: 1265939 } },
    character: "/estados/zacatecas-fighter-16bit.png",
  },
];

export const participation = (metrics: StateMetrics) => (metrics.voted / (metrics.voted + metrics.notVoted)) * 100;
export const formatCount = (value: number) => value.toLocaleString("es-MX");
