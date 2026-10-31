// Generado automáticamente desde uw-sf/delictivos/* y uw-sf/sentinel_prioritarios.geojson
export interface FenomenoResumen {
  familia: string;
  categoria: string;
  carpetas: number;
}

export interface PresenciaGrupoAlcaldia {
  alcaldia: string;
  lat: number;
  lon: number;
  grupos_locales: string[];
  grupos_locales_raw: string;
  fuente_1: string;
  carteles_medios: string[];
  carteles_medios_raw: string;
  fuente_2: string;
  confianza: string;
  extorsion_cobro_carpetas_2024: number;
  narcomenudeo_venta_carpetas_2024: number;
}

export interface SenalColonia {
  alcaldia: string;
  colonia: string;
  narco_venta: number;
  extorsion_cobro: number;
  armas_violencia: number;
  secuestro_despojo: number;
  total_senales: number;
  familias_presentes: number;
  lat: number;
  lon: number;
  prioridad: 'Alta' | 'Media' | 'Baja' | string;
}

export const RESUMEN_FENOMENOS: FenomenoResumen[] = [
  {
    "familia": "1 Extorsión",
    "categoria": "Cobranza ilegítima",
    "carpetas": 975
  },
  {
    "familia": "1 Extorsión",
    "categoria": "Extorsión (otro)",
    "carpetas": 12
  },
  {
    "familia": "1 Extorsión",
    "categoria": "Extorsión consumada",
    "carpetas": 264
  },
  {
    "familia": "1 Extorsión",
    "categoria": "Extorsión en tentativa",
    "carpetas": 1123
  },
  {
    "familia": "2 Robo a negocio",
    "categoria": "Robo a negocio: con violencia",
    "carpetas": 960
  },
  {
    "familia": "2 Robo a negocio",
    "categoria": "Robo a negocio: hurto en tienda (fardero)",
    "carpetas": 4168
  },
  {
    "familia": "2 Robo a negocio",
    "categoria": "Robo a negocio: sin violencia",
    "carpetas": 1907
  },
  {
    "familia": "2 Robo a negocio",
    "categoria": "Robo a transportista y mercancía",
    "carpetas": 33
  },
  {
    "familia": "3 Delincuencia común",
    "categoria": "Robo a casa habitación",
    "carpetas": 2262
  },
  {
    "familia": "3 Delincuencia común",
    "categoria": "Robo a repartidor",
    "carpetas": 368
  },
  {
    "familia": "3 Delincuencia común",
    "categoria": "Robo a transeúnte y pasajero",
    "carpetas": 13662
  },
  {
    "familia": "3 Delincuencia común",
    "categoria": "Robo de vehículo y autopartes",
    "carpetas": 14311
  },
  {
    "familia": "4 Despojo y allanamiento",
    "categoria": "Despojo, allanamiento e invasión",
    "carpetas": 2479
  },
  {
    "familia": "5 Violencia y armas",
    "categoria": "Secuestro y privación de la libertad",
    "carpetas": 239
  },
  {
    "familia": "5 Violencia y armas",
    "categoria": "Violencia letal y armas",
    "carpetas": 1750
  },
  {
    "familia": "6 Mercado ilegal (narcomenudeo)",
    "categoria": "Narcomenudeo",
    "carpetas": 2852
  },
  {
    "familia": "7 Fraude y cumplimiento",
    "categoria": "Corrupción y abuso de autoridad",
    "carpetas": 3694
  },
  {
    "familia": "7 Fraude y cumplimiento",
    "categoria": "Fraude, identidad y documentos",
    "carpetas": 16341
  },
  {
    "familia": "8 Otros",
    "categoria": "Daño a propiedad",
    "carpetas": 2494
  },
  {
    "familia": "8 Otros",
    "categoria": "Robo otro (fluidos, animales, etc.)",
    "carpetas": 80
  }
];

export const PRESENCIA_GRUPOS_ALCALDIA: PresenciaGrupoAlcaldia[] = [
  {
    "alcaldia": "ALVARO OBREGON",
    "lat": 19.36268,
    "lon": -99.20961,
    "grupos_locales": [
      "Los Canchola/Malcriados 3AD"
    ],
    "grupos_locales_raw": "Los Canchola/Malcriados 3AD",
    "fuente_1": "Infobae 21-may-2024 (grupos reconocidos por FGJ vía transparencia; ubicación por alcaldía atribuida a Infobae)",
    "carteles_medios": [
      "CJNG",
      "Cártel de Sinaloa"
    ],
    "carteles_medios_raw": "CJNG; Cártel de Sinaloa",
    "fuente_2": "Milenio/PolíticoMX 22-may-2025 (Sedena, Semar, CNI, DEA según el medio; sin fuente por alcaldía)",
    "confianza": "Media: grupos oficiales, ubicación atribuida por medios; no verificada por colonia",
    "extorsion_cobro_carpetas_2024": 145,
    "narcomenudeo_venta_carpetas_2024": 26
  },
  {
    "alcaldia": "AZCAPOTZALCO",
    "lat": 19.48046,
    "lon": -99.18336,
    "grupos_locales": [
      "Unión Tepito",
      "Anti Unión"
    ],
    "grupos_locales_raw": "Unión Tepito; Anti Unión",
    "fuente_1": "Infobae 21-may-2024 (grupos reconocidos por FGJ vía transparencia; ubicación por alcaldía atribuida a Infobae)",
    "carteles_medios": [
      "CJNG",
      "Cártel de Sinaloa"
    ],
    "carteles_medios_raw": "CJNG; Cártel de Sinaloa",
    "fuente_2": "Milenio/PolíticoMX 22-may-2025 (Sedena, Semar, CNI, DEA según el medio; sin fuente por alcaldía)",
    "confianza": "Media: grupos oficiales, ubicación atribuida por medios; no verificada por colonia",
    "extorsion_cobro_carpetas_2024": 95,
    "narcomenudeo_venta_carpetas_2024": 19
  },
  {
    "alcaldia": "BENITO JUAREZ",
    "lat": 19.38127,
    "lon": -99.16247,
    "grupos_locales": [
      "Unión Tepito",
      "Anti Unión",
      "La Ronda 88"
    ],
    "grupos_locales_raw": "Unión Tepito; Anti Unión; La Ronda 88",
    "fuente_1": "Infobae 21-may-2024 (grupos reconocidos por FGJ vía transparencia; ubicación por alcaldía atribuida a Infobae)",
    "carteles_medios": [
      "CJNG",
      "Cártel de Sinaloa"
    ],
    "carteles_medios_raw": "CJNG; Cártel de Sinaloa",
    "fuente_2": "Milenio/PolíticoMX 22-may-2025 (Sedena, Semar, CNI, DEA según el medio; sin fuente por alcaldía)",
    "confianza": "Media: grupos oficiales, ubicación atribuida por medios; no verificada por colonia",
    "extorsion_cobro_carpetas_2024": 121,
    "narcomenudeo_venta_carpetas_2024": 12
  },
  {
    "alcaldia": "COYOACAN",
    "lat": 19.32837,
    "lon": -99.15175,
    "grupos_locales": [
      "Anti Unión",
      "Los Molina"
    ],
    "grupos_locales_raw": "Anti Unión; Los Molina",
    "fuente_1": "Infobae 21-may-2024 (grupos reconocidos por FGJ vía transparencia; ubicación por alcaldía atribuida a Infobae)",
    "carteles_medios": [
      "CJNG",
      "Cártel de Sinaloa"
    ],
    "carteles_medios_raw": "CJNG; Cártel de Sinaloa",
    "fuente_2": "Milenio/PolíticoMX 22-may-2025 (Sedena, Semar, CNI, DEA según el medio; sin fuente por alcaldía)",
    "confianza": "Media: grupos oficiales, ubicación atribuida por medios; no verificada por colonia",
    "extorsion_cobro_carpetas_2024": 152,
    "narcomenudeo_venta_carpetas_2024": 21
  },
  {
    "alcaldia": "CUAJIMALPA DE MORELOS",
    "lat": 19.3593,
    "lon": -99.28667,
    "grupos_locales": [
      "Los Canchola/Malcriados 3AD"
    ],
    "grupos_locales_raw": "Los Canchola/Malcriados 3AD",
    "fuente_1": "Infobae 21-may-2024 (grupos reconocidos por FGJ vía transparencia; ubicación por alcaldía atribuida a Infobae)",
    "carteles_medios": [
      "Cártel de Sinaloa"
    ],
    "carteles_medios_raw": "Cártel de Sinaloa",
    "fuente_2": "Milenio/PolíticoMX 22-may-2025 (Sedena, Semar, CNI, DEA según el medio; sin fuente por alcaldía)",
    "confianza": "Media: grupos oficiales, ubicación atribuida por medios; no verificada por colonia",
    "extorsion_cobro_carpetas_2024": 35,
    "narcomenudeo_venta_carpetas_2024": 12
  },
  {
    "alcaldia": "CUAUHTEMOC",
    "lat": 19.42925,
    "lon": -99.14824,
    "grupos_locales": [
      "Unión Tepito",
      "Anti Unión",
      "La Ronda 88"
    ],
    "grupos_locales_raw": "Unión Tepito; Anti Unión; La Ronda 88",
    "fuente_1": "Infobae 21-may-2024 (grupos reconocidos por FGJ vía transparencia; ubicación por alcaldía atribuida a Infobae)",
    "carteles_medios": [
      "CJNG (alianza con Anti Unión, sin fuente oficial)"
    ],
    "carteles_medios_raw": "CJNG (alianza con Anti Unión, sin fuente oficial)",
    "fuente_2": "Milenio/PolíticoMX 22-may-2025 (Sedena, Semar, CNI, DEA según el medio; sin fuente por alcaldía)",
    "confianza": "Media: grupos oficiales, ubicación atribuida por medios; no verificada por colonia",
    "extorsion_cobro_carpetas_2024": 256,
    "narcomenudeo_venta_carpetas_2024": 372
  },
  {
    "alcaldia": "GUSTAVO A. MADERO",
    "lat": 19.48323,
    "lon": -99.11906,
    "grupos_locales": [
      "Unión Tepito",
      "Anti Unión",
      "La Ronda 88"
    ],
    "grupos_locales_raw": "Unión Tepito; Anti Unión; La Ronda 88",
    "fuente_1": "Infobae 21-may-2024 (grupos reconocidos por FGJ vía transparencia; ubicación por alcaldía atribuida a Infobae)",
    "carteles_medios": [
      "CJNG",
      "Cártel de Sinaloa"
    ],
    "carteles_medios_raw": "CJNG; Cártel de Sinaloa",
    "fuente_2": "Milenio/PolíticoMX 22-may-2025 (Sedena, Semar, CNI, DEA según el medio; sin fuente por alcaldía)",
    "confianza": "Media: grupos oficiales, ubicación atribuida por medios; no verificada por colonia",
    "extorsion_cobro_carpetas_2024": 257,
    "narcomenudeo_venta_carpetas_2024": 95
  },
  {
    "alcaldia": "IZTACALCO",
    "lat": 19.39648,
    "lon": -99.09737,
    "grupos_locales": [
      "Unión Tepito",
      "Anti Unión",
      "La Ronda 88"
    ],
    "grupos_locales_raw": "Unión Tepito; Anti Unión; La Ronda 88",
    "fuente_1": "Infobae 21-may-2024 (grupos reconocidos por FGJ vía transparencia; ubicación por alcaldía atribuida a Infobae)",
    "carteles_medios": [
      "CJNG"
    ],
    "carteles_medios_raw": "CJNG",
    "fuente_2": "Milenio/PolíticoMX 22-may-2025 (Sedena, Semar, CNI, DEA según el medio; sin fuente por alcaldía)",
    "confianza": "Media: grupos oficiales, ubicación atribuida por medios; no verificada por colonia",
    "extorsion_cobro_carpetas_2024": 144,
    "narcomenudeo_venta_carpetas_2024": 18
  },
  {
    "alcaldia": "IZTAPALAPA",
    "lat": 19.35402,
    "lon": -99.06181,
    "grupos_locales": [
      "Unión Tepito",
      "Los Rodolfos",
      "Los Molina",
      "La Ronda 88",
      "Cártel de Tláhuac"
    ],
    "grupos_locales_raw": "Unión Tepito; Los Rodolfos; Los Molina; La Ronda 88; Cártel de Tláhuac",
    "fuente_1": "Infobae 21-may-2024 (grupos reconocidos por FGJ vía transparencia; ubicación por alcaldía atribuida a Infobae)",
    "carteles_medios": [
      "CJNG",
      "Cártel de Sinaloa (reclutamiento en Ejército de Oriente y U. Vicente Guerrero, informe Semar sin fecha)"
    ],
    "carteles_medios_raw": "CJNG; Cártel de Sinaloa (reclutamiento en Ejército de Oriente y U. Vicente Guerrero, informe Semar sin fecha)",
    "fuente_2": "Milenio/PolíticoMX 22-may-2025 (Sedena, Semar, CNI, DEA según el medio; sin fuente por alcaldía)",
    "confianza": "Media: grupos oficiales, ubicación atribuida por medios; no verificada por colonia",
    "extorsion_cobro_carpetas_2024": 377,
    "narcomenudeo_venta_carpetas_2024": 539
  },
  {
    "alcaldia": "LA MAGDALENA CONTRERAS",
    "lat": 19.31226,
    "lon": -99.24355,
    "grupos_locales": [
      "Los Canchola/Malcriados 3AD"
    ],
    "grupos_locales_raw": "Los Canchola/Malcriados 3AD",
    "fuente_1": "Infobae 21-may-2024 (grupos reconocidos por FGJ vía transparencia; ubicación por alcaldía atribuida a Infobae)",
    "carteles_medios": [
      "CJNG"
    ],
    "carteles_medios_raw": "CJNG",
    "fuente_2": "Milenio/PolíticoMX 22-may-2025 (Sedena, Semar, CNI, DEA según el medio; sin fuente por alcaldía)",
    "confianza": "Media: grupos oficiales, ubicación atribuida por medios; no verificada por colonia",
    "extorsion_cobro_carpetas_2024": 58,
    "narcomenudeo_venta_carpetas_2024": 1
  },
  {
    "alcaldia": "MIGUEL HIDALGO",
    "lat": 19.43756,
    "lon": -99.19097,
    "grupos_locales": [
      "Unión Tepito",
      "Anti Unión",
      "La Ronda 88"
    ],
    "grupos_locales_raw": "Unión Tepito; Anti Unión; La Ronda 88",
    "fuente_1": "Infobae 21-may-2024 (grupos reconocidos por FGJ vía transparencia; ubicación por alcaldía atribuida a Infobae)",
    "carteles_medios": [
      "Cártel de Sinaloa"
    ],
    "carteles_medios_raw": "Cártel de Sinaloa",
    "fuente_2": "Milenio/PolíticoMX 22-may-2025 (Sedena, Semar, CNI, DEA según el medio; sin fuente por alcaldía)",
    "confianza": "Media: grupos oficiales, ubicación atribuida por medios; no verificada por colonia",
    "extorsion_cobro_carpetas_2024": 135,
    "narcomenudeo_venta_carpetas_2024": 16
  },
  {
    "alcaldia": "MILPA ALTA",
    "lat": 19.19531,
    "lon": -99.02214,
    "grupos_locales": [
      "Los Molina",
      "Cártel de Tláhuac"
    ],
    "grupos_locales_raw": "Los Molina; Cártel de Tláhuac",
    "fuente_1": "Infobae 21-may-2024 (grupos reconocidos por FGJ vía transparencia; ubicación por alcaldía atribuida a Infobae)",
    "carteles_medios": [
      "Cártel de Sinaloa",
      "CJNG (desde 2017, Sedena)"
    ],
    "carteles_medios_raw": "Cártel de Sinaloa; CJNG (desde 2017, Sedena)",
    "fuente_2": "Milenio/PolíticoMX 22-may-2025 (Sedena, Semar, CNI, DEA según el medio; sin fuente por alcaldía)",
    "confianza": "Media: grupos oficiales, ubicación atribuida por medios; no verificada por colonia",
    "extorsion_cobro_carpetas_2024": 16,
    "narcomenudeo_venta_carpetas_2024": 6
  },
  {
    "alcaldia": "TLAHUAC",
    "lat": 19.28975,
    "lon": -99.02949,
    "grupos_locales": [
      "Los Rodolfos",
      "Los Molina",
      "Cártel de Tláhuac"
    ],
    "grupos_locales_raw": "Los Rodolfos; Los Molina; Cártel de Tláhuac",
    "fuente_1": "Infobae 21-may-2024 (grupos reconocidos por FGJ vía transparencia; ubicación por alcaldía atribuida a Infobae)",
    "carteles_medios": [
      "CJNG",
      "Cártel de Tláhuac (Familia Michoacana: sin fuente)"
    ],
    "carteles_medios_raw": "CJNG; Cártel de Tláhuac (Familia Michoacana: sin fuente)",
    "fuente_2": "Milenio/PolíticoMX 22-may-2025 (Sedena, Semar, CNI, DEA según el medio; sin fuente por alcaldía)",
    "confianza": "Media: grupos oficiales, ubicación atribuida por medios; no verificada por colonia",
    "extorsion_cobro_carpetas_2024": 70,
    "narcomenudeo_venta_carpetas_2024": 27
  },
  {
    "alcaldia": "TLALPAN",
    "lat": 19.28452,
    "lon": -99.17013,
    "grupos_locales": [
      "Los Rodolfos"
    ],
    "grupos_locales_raw": "Los Rodolfos",
    "fuente_1": "Infobae 21-may-2024 (grupos reconocidos por FGJ vía transparencia; ubicación por alcaldía atribuida a Infobae)",
    "carteles_medios": [
      "CJNG",
      "Cártel de Sinaloa"
    ],
    "carteles_medios_raw": "CJNG; Cártel de Sinaloa",
    "fuente_2": "Milenio/PolíticoMX 22-may-2025 (Sedena, Semar, CNI, DEA según el medio; sin fuente por alcaldía)",
    "confianza": "Media: grupos oficiales, ubicación atribuida por medios; no verificada por colonia",
    "extorsion_cobro_carpetas_2024": 159,
    "narcomenudeo_venta_carpetas_2024": 8
  },
  {
    "alcaldia": "VENUSTIANO CARRANZA",
    "lat": 19.42656,
    "lon": -99.10548,
    "grupos_locales": [
      "Unión Tepito",
      "Anti Unión",
      "La Ronda 88"
    ],
    "grupos_locales_raw": "Unión Tepito; Anti Unión; La Ronda 88",
    "fuente_1": "Infobae 21-may-2024 (grupos reconocidos por FGJ vía transparencia; ubicación por alcaldía atribuida a Infobae)",
    "carteles_medios": [
      "CJNG"
    ],
    "carteles_medios_raw": "CJNG",
    "fuente_2": "Milenio/PolíticoMX 22-may-2025 (Sedena, Semar, CNI, DEA según el medio; sin fuente por alcaldía)",
    "confianza": "Media: grupos oficiales, ubicación atribuida por medios; no verificada por colonia",
    "extorsion_cobro_carpetas_2024": 177,
    "narcomenudeo_venta_carpetas_2024": 69
  },
  {
    "alcaldia": "XOCHIMILCO",
    "lat": 19.25789,
    "lon": -99.1075,
    "grupos_locales": [
      "Los Rodolfos",
      "Los Molina",
      "Cártel de Tláhuac"
    ],
    "grupos_locales_raw": "Los Rodolfos; Los Molina; Cártel de Tláhuac",
    "fuente_1": "Infobae 21-may-2024 (grupos reconocidos por FGJ vía transparencia; ubicación por alcaldía atribuida a Infobae)",
    "carteles_medios": [
      "CJNG (desde 2017, Sedena)"
    ],
    "carteles_medios_raw": "CJNG (desde 2017, Sedena)",
    "fuente_2": "Milenio/PolíticoMX 22-may-2025 (Sedena, Semar, CNI, DEA según el medio; sin fuente por alcaldía)",
    "confianza": "Media: grupos oficiales, ubicación atribuida por medios; no verificada por colonia",
    "extorsion_cobro_carpetas_2024": 113,
    "narcomenudeo_venta_carpetas_2024": 26
  }
];

export const TOP_COLONIAS_SENALES: SenalColonia[] = [
  {
    "alcaldia": "CUAUHTEMOC",
    "colonia": "Morelos",
    "narco_venta": 167,
    "extorsion_cobro": 3,
    "armas_violencia": 14,
    "secuestro_despojo": 7,
    "total_senales": 191,
    "familias_presentes": 4,
    "lat": 19.44683,
    "lon": -99.13045,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "CUAUHTEMOC",
    "colonia": "Centro",
    "narco_venta": 52,
    "extorsion_cobro": 25,
    "armas_violencia": 17,
    "secuestro_despojo": 55,
    "total_senales": 149,
    "familias_presentes": 4,
    "lat": 19.43299,
    "lon": -99.13798,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "CUAUHTEMOC",
    "colonia": "Guerrero",
    "narco_venta": 39,
    "extorsion_cobro": 12,
    "armas_violencia": 6,
    "secuestro_despojo": 20,
    "total_senales": 77,
    "familias_presentes": 4,
    "lat": 19.44432,
    "lon": -99.14351,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTACALCO",
    "colonia": "Agricola Oriental",
    "narco_venta": 4,
    "extorsion_cobro": 18,
    "armas_violencia": 6,
    "secuestro_despojo": 35,
    "total_senales": 63,
    "familias_presentes": 4,
    "lat": 19.39538,
    "lon": -99.07111,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTAPALAPA",
    "colonia": "Unidad Santa Cruz Meyehualco",
    "narco_venta": 49,
    "extorsion_cobro": 3,
    "armas_violencia": 2,
    "secuestro_despojo": 6,
    "total_senales": 60,
    "familias_presentes": 4,
    "lat": 19.34913,
    "lon": -99.04347,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "CUAUHTEMOC",
    "colonia": "Doctores",
    "narco_venta": 17,
    "extorsion_cobro": 9,
    "armas_violencia": 2,
    "secuestro_despojo": 30,
    "total_senales": 58,
    "familias_presentes": 4,
    "lat": 19.42001,
    "lon": -99.14845,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTAPALAPA",
    "colonia": "Desarrollo Urbano Quetzalcoatl",
    "narco_venta": 34,
    "extorsion_cobro": 5,
    "armas_violencia": 12,
    "secuestro_despojo": 6,
    "total_senales": 57,
    "familias_presentes": 4,
    "lat": 19.32825,
    "lon": -99.04163,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTAPALAPA",
    "colonia": "Miguel De La Madrid Hurtado",
    "narco_venta": 45,
    "extorsion_cobro": 2,
    "armas_violencia": 1,
    "secuestro_despojo": 4,
    "total_senales": 52,
    "familias_presentes": 4,
    "lat": 19.34383,
    "lon": -99.0017,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "CUAUHTEMOC",
    "colonia": "Buenavista",
    "narco_venta": 22,
    "extorsion_cobro": 7,
    "armas_violencia": 2,
    "secuestro_despojo": 14,
    "total_senales": 45,
    "familias_presentes": 4,
    "lat": 19.44436,
    "lon": -99.15144,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "COYOACAN",
    "colonia": "Pedregal De Santo Domingo",
    "narco_venta": 1,
    "extorsion_cobro": 12,
    "armas_violencia": 3,
    "secuestro_despojo": 26,
    "total_senales": 42,
    "familias_presentes": 4,
    "lat": 19.32826,
    "lon": -99.16763,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "VENUSTIANO CARRANZA",
    "colonia": "Moctezuma 2a. Seccion",
    "narco_venta": 6,
    "extorsion_cobro": 12,
    "armas_violencia": 4,
    "secuestro_despojo": 20,
    "total_senales": 42,
    "familias_presentes": 4,
    "lat": 19.43276,
    "lon": -99.0965,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "CUAUHTEMOC",
    "colonia": "Santa Maria La Ribera",
    "narco_venta": 6,
    "extorsion_cobro": 7,
    "armas_violencia": 5,
    "secuestro_despojo": 23,
    "total_senales": 41,
    "familias_presentes": 4,
    "lat": 19.44762,
    "lon": -99.15801,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTAPALAPA",
    "colonia": "Ejercito De Oriente Zona Peñon",
    "narco_venta": 24,
    "extorsion_cobro": 5,
    "armas_violencia": 8,
    "secuestro_despojo": 1,
    "total_senales": 38,
    "familias_presentes": 4,
    "lat": 19.36906,
    "lon": -99.02821,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTACALCO",
    "colonia": "Agricola Pantitlan",
    "narco_venta": 3,
    "extorsion_cobro": 10,
    "armas_violencia": 2,
    "secuestro_despojo": 22,
    "total_senales": 37,
    "familias_presentes": 4,
    "lat": 19.40973,
    "lon": -99.064,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "VENUSTIANO CARRANZA",
    "colonia": "Morelos",
    "narco_venta": 17,
    "extorsion_cobro": 4,
    "armas_violencia": 6,
    "secuestro_despojo": 10,
    "total_senales": 37,
    "familias_presentes": 4,
    "lat": 19.4433,
    "lon": -99.12044,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTAPALAPA",
    "colonia": "Chinampac De Juarez",
    "narco_venta": 17,
    "extorsion_cobro": 6,
    "armas_violencia": 3,
    "secuestro_despojo": 9,
    "total_senales": 35,
    "familias_presentes": 4,
    "lat": 19.37863,
    "lon": -99.04949,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "TLALPAN",
    "colonia": "Pueblo San Miguel Topilejo",
    "narco_venta": 1,
    "extorsion_cobro": 7,
    "armas_violencia": 7,
    "secuestro_despojo": 19,
    "total_senales": 34,
    "familias_presentes": 4,
    "lat": 19.19901,
    "lon": -99.14434,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "CUAUHTEMOC",
    "colonia": "Juarez",
    "narco_venta": 10,
    "extorsion_cobro": 7,
    "armas_violencia": 0,
    "secuestro_despojo": 17,
    "total_senales": 34,
    "familias_presentes": 3,
    "lat": 19.42676,
    "lon": -99.16322,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "CUAUHTEMOC",
    "colonia": "Roma Norte",
    "narco_venta": 4,
    "extorsion_cobro": 5,
    "armas_violencia": 1,
    "secuestro_despojo": 22,
    "total_senales": 32,
    "familias_presentes": 4,
    "lat": 19.41852,
    "lon": -99.16289,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "CUAUHTEMOC",
    "colonia": "Obrera",
    "narco_venta": 6,
    "extorsion_cobro": 6,
    "armas_violencia": 0,
    "secuestro_despojo": 19,
    "total_senales": 31,
    "familias_presentes": 3,
    "lat": 19.41474,
    "lon": -99.13939,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "VENUSTIANO CARRANZA",
    "colonia": "Zona Centro",
    "narco_venta": 13,
    "extorsion_cobro": 7,
    "armas_violencia": 4,
    "secuestro_despojo": 6,
    "total_senales": 30,
    "familias_presentes": 4,
    "lat": 19.42942,
    "lon": -99.12357,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTAPALAPA",
    "colonia": "Barrio San Miguel",
    "narco_venta": 21,
    "extorsion_cobro": 3,
    "armas_violencia": 0,
    "secuestro_despojo": 5,
    "total_senales": 29,
    "familias_presentes": 3,
    "lat": 19.35564,
    "lon": -99.07789,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTAPALAPA",
    "colonia": "Central De Abasto",
    "narco_venta": 18,
    "extorsion_cobro": 7,
    "armas_violencia": 0,
    "secuestro_despojo": 4,
    "total_senales": 29,
    "familias_presentes": 3,
    "lat": 19.37583,
    "lon": -99.09025,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTAPALAPA",
    "colonia": "Unidad Vicente Guerrero",
    "narco_venta": 10,
    "extorsion_cobro": 5,
    "armas_violencia": 12,
    "secuestro_despojo": 1,
    "total_senales": 28,
    "familias_presentes": 4,
    "lat": 19.35803,
    "lon": -99.056,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTAPALAPA",
    "colonia": "Ermita Zaragoza",
    "narco_venta": 10,
    "extorsion_cobro": 5,
    "armas_violencia": 7,
    "secuestro_despojo": 5,
    "total_senales": 27,
    "familias_presentes": 4,
    "lat": 19.36494,
    "lon": -98.99762,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTAPALAPA",
    "colonia": "Consejo Agrarista Mexicano",
    "narco_venta": 14,
    "extorsion_cobro": 2,
    "armas_violencia": 2,
    "secuestro_despojo": 8,
    "total_senales": 26,
    "familias_presentes": 4,
    "lat": 19.32516,
    "lon": -99.05672,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTAPALAPA",
    "colonia": "Pueblo Santa Martha Acatitla",
    "narco_venta": 18,
    "extorsion_cobro": 0,
    "armas_violencia": 0,
    "secuestro_despojo": 6,
    "total_senales": 24,
    "familias_presentes": 2,
    "lat": 19.35874,
    "lon": -99.00776,
    "prioridad": "Media"
  },
  {
    "alcaldia": "CUAUHTEMOC",
    "colonia": "Peralvillo",
    "narco_venta": 6,
    "extorsion_cobro": 1,
    "armas_violencia": 3,
    "secuestro_despojo": 14,
    "total_senales": 24,
    "familias_presentes": 4,
    "lat": 19.46166,
    "lon": -99.13426,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "VENUSTIANO CARRANZA",
    "colonia": "Jardin Balbuena",
    "narco_venta": 1,
    "extorsion_cobro": 8,
    "armas_violencia": 2,
    "secuestro_despojo": 12,
    "total_senales": 23,
    "familias_presentes": 4,
    "lat": 19.41712,
    "lon": -99.10783,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "GUSTAVO A. MADERO",
    "colonia": "San Felipe De Jesus",
    "narco_venta": 1,
    "extorsion_cobro": 9,
    "armas_violencia": 2,
    "secuestro_despojo": 11,
    "total_senales": 23,
    "familias_presentes": 4,
    "lat": 19.49491,
    "lon": -99.07472,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "GUSTAVO A. MADERO",
    "colonia": "Nueva Atzacoalco",
    "narco_venta": 6,
    "extorsion_cobro": 5,
    "armas_violencia": 5,
    "secuestro_despojo": 6,
    "total_senales": 22,
    "familias_presentes": 4,
    "lat": 19.49961,
    "lon": -99.08555,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTAPALAPA",
    "colonia": "Santa Maria Aztahuacan",
    "narco_venta": 5,
    "extorsion_cobro": 1,
    "armas_violencia": 5,
    "secuestro_despojo": 11,
    "total_senales": 22,
    "familias_presentes": 4,
    "lat": 19.35665,
    "lon": -99.03364,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTAPALAPA",
    "colonia": "Lomas De San Lorenzo",
    "narco_venta": 8,
    "extorsion_cobro": 3,
    "armas_violencia": 6,
    "secuestro_despojo": 5,
    "total_senales": 22,
    "familias_presentes": 4,
    "lat": 19.3195,
    "lon": -99.067,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "VENUSTIANO CARRANZA",
    "colonia": "General Ignacio Zaragoza",
    "narco_venta": 2,
    "extorsion_cobro": 3,
    "armas_violencia": 1,
    "secuestro_despojo": 16,
    "total_senales": 22,
    "familias_presentes": 4,
    "lat": 19.41186,
    "lon": -99.09175,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTAPALAPA",
    "colonia": "Juan Escutia",
    "narco_venta": 12,
    "extorsion_cobro": 3,
    "armas_violencia": 1,
    "secuestro_despojo": 5,
    "total_senales": 21,
    "familias_presentes": 4,
    "lat": 19.3909,
    "lon": -99.04219,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTACALCO",
    "colonia": "Granjas Mexico",
    "narco_venta": 0,
    "extorsion_cobro": 5,
    "armas_violencia": 1,
    "secuestro_despojo": 15,
    "total_senales": 21,
    "familias_presentes": 3,
    "lat": 19.40238,
    "lon": -99.09878,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "CUAUHTEMOC",
    "colonia": "Cuauhtemoc",
    "narco_venta": 3,
    "extorsion_cobro": 5,
    "armas_violencia": 0,
    "secuestro_despojo": 12,
    "total_senales": 20,
    "familias_presentes": 3,
    "lat": 19.42935,
    "lon": -99.16877,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "AZCAPOTZALCO",
    "colonia": "Ampliacion San Pedro Xalpa",
    "narco_venta": 4,
    "extorsion_cobro": 4,
    "armas_violencia": 1,
    "secuestro_despojo": 11,
    "total_senales": 20,
    "familias_presentes": 4,
    "lat": 19.47925,
    "lon": -99.2172,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "BENITO JUAREZ",
    "colonia": "Narvarte Poniente",
    "narco_venta": 2,
    "extorsion_cobro": 2,
    "armas_violencia": 2,
    "secuestro_despojo": 14,
    "total_senales": 20,
    "familias_presentes": 4,
    "lat": 19.39401,
    "lon": -99.15713,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "MIGUEL HIDALGO",
    "colonia": "Anahuac Ii Seccion",
    "narco_venta": 0,
    "extorsion_cobro": 4,
    "armas_violencia": 2,
    "secuestro_despojo": 14,
    "total_senales": 20,
    "familias_presentes": 3,
    "lat": 19.44414,
    "lon": -99.17336,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "LA MAGDALENA CONTRERAS",
    "colonia": "Pueblo San Nicolas Totolapan",
    "narco_venta": 0,
    "extorsion_cobro": 3,
    "armas_violencia": 3,
    "secuestro_despojo": 14,
    "total_senales": 20,
    "familias_presentes": 3,
    "lat": 19.29575,
    "lon": -99.24452,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "TLAHUAC",
    "colonia": "La Conchita Zapotitlan",
    "narco_venta": 3,
    "extorsion_cobro": 4,
    "armas_violencia": 1,
    "secuestro_despojo": 12,
    "total_senales": 20,
    "familias_presentes": 4,
    "lat": 19.28513,
    "lon": -99.03548,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "BENITO JUAREZ",
    "colonia": "Del Valle Centro",
    "narco_venta": 1,
    "extorsion_cobro": 6,
    "armas_violencia": 1,
    "secuestro_despojo": 12,
    "total_senales": 20,
    "familias_presentes": 4,
    "lat": 19.38582,
    "lon": -99.16859,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTAPALAPA",
    "colonia": "Buenavista",
    "narco_venta": 10,
    "extorsion_cobro": 2,
    "armas_violencia": 4,
    "secuestro_despojo": 4,
    "total_senales": 20,
    "familias_presentes": 4,
    "lat": 19.32821,
    "lon": -99.02969,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "VENUSTIANO CARRANZA",
    "colonia": "Peñon De Los Baños",
    "narco_venta": 2,
    "extorsion_cobro": 3,
    "armas_violencia": 6,
    "secuestro_despojo": 8,
    "total_senales": 19,
    "familias_presentes": 4,
    "lat": 19.43998,
    "lon": -99.08073,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "GUSTAVO A. MADERO",
    "colonia": "Ampliacion Casas Aleman",
    "narco_venta": 3,
    "extorsion_cobro": 7,
    "armas_violencia": 1,
    "secuestro_despojo": 8,
    "total_senales": 19,
    "familias_presentes": 4,
    "lat": 19.47716,
    "lon": -99.08495,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "COYOACAN",
    "colonia": "Pedregal De Santa Ursula",
    "narco_venta": 1,
    "extorsion_cobro": 7,
    "armas_violencia": 4,
    "secuestro_despojo": 6,
    "total_senales": 18,
    "familias_presentes": 4,
    "lat": 19.31047,
    "lon": -99.1534,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "COYOACAN",
    "colonia": "Del Carmen",
    "narco_venta": 1,
    "extorsion_cobro": 4,
    "armas_violencia": 0,
    "secuestro_despojo": 13,
    "total_senales": 18,
    "familias_presentes": 3,
    "lat": 19.35362,
    "lon": -99.16236,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "IZTAPALAPA",
    "colonia": "Santiago Acahualtepec 2a Ampliacion",
    "narco_venta": 13,
    "extorsion_cobro": 3,
    "armas_violencia": 1,
    "secuestro_despojo": 1,
    "total_senales": 18,
    "familias_presentes": 4,
    "lat": 19.34712,
    "lon": -99.01006,
    "prioridad": "Alta"
  },
  {
    "alcaldia": "TLALPAN",
    "colonia": "Pueblo San Pedro Martir",
    "narco_venta": 0,
    "extorsion_cobro": 4,
    "armas_violencia": 3,
    "secuestro_despojo": 10,
    "total_senales": 17,
    "familias_presentes": 3,
    "lat": 19.26564,
    "lon": -99.16952,
    "prioridad": "Alta"
  }
];

export const ESTADISTICAS_DELICTIVOS = {
  total_colonias_cdmx: 1543,
  colonias_prioridad_alta: 78,
  colonias_prioridad_media: 164,
  colonias_prioridad_baja: 1301,
  colonias_riesgo_critico: 26,
  colonias_riesgo_alto: 52,
  colonias_riesgo_medio: 270,
  colonias_riesgo_bajo: 1195,
  total_senales_indice: 5847,
  total_sentinel_prioritarios_geojson: 46116,
  total_alto_impacto_2024_2026: 48069,
  alto_impacto_por_anio: {"2024": 13076, "2025": 20802, "2026": 14191},
  alto_impacto_por_delito: [{"delito": "ROBO A TRANSEUNTE EN VÍA PÚBLICA CON Y SIN VIOLENCIA", "total": 16082}, {"delito": "ROBO DE VEHÍCULO CON Y SIN VIOLENCIA", "total": 13696}, {"delito": "VIOLACIÓN", "total": 5331}, {"delito": "ROBO A NEGOCIO CON VIOLENCIA", "total": 3941}, {"delito": "ROBO A PASAJERO A BORDO DEL METRO CON Y SIN VIOLENCIA", "total": 3006}, {"delito": "HOMICIDIO DOLOSO", "total": 1853}, {"delito": "LESIONES DOLOSAS POR DISPARO DE ARMA DE FUEGO", "total": 1244}, {"delito": "ROBO A REPARTIDOR CON Y SIN VIOLENCIA", "total": 1238}, {"delito": "ROBO A PASAJERO A BORDO DE MICROBUS CON Y SIN VIOLENCIA", "total": 604}, {"delito": "ROBO A CASA HABITACIÓN CON VIOLENCIA", "total": 496}, {"delito": "ROBO A PASAJERO A BORDO DE TAXI CON VIOLENCIA", "total": 267}, {"delito": "ROBO A CUENTAHABIENTE SALIENDO DEL CAJERO CON VIOLENCIA", "total": 255}, {"delito": "ROBO A TRANSPORTISTA CON Y SIN VIOLENCIA", "total": 32}, {"delito": "SECUESTRO", "total": 24}],
  alto_impacto_por_mes: [{"mes": "2024-01", "total": 1789}, {"mes": "2024-02", "total": 1780}, {"mes": "2024-03", "total": 1836}, {"mes": "2024-04", "total": 1785}, {"mes": "2024-05", "total": 1933}, {"mes": "2024-06", "total": 1886}, {"mes": "2024-07", "total": 2067}, {"mes": "2025-01", "total": 1827}, {"mes": "2025-02", "total": 1543}, {"mes": "2025-03", "total": 1669}, {"mes": "2025-04", "total": 1698}, {"mes": "2025-05", "total": 1765}, {"mes": "2025-06", "total": 1619}, {"mes": "2025-07", "total": 1785}, {"mes": "2025-08", "total": 1759}, {"mes": "2025-09", "total": 1852}, {"mes": "2025-10", "total": 1866}, {"mes": "2025-11", "total": 1764}, {"mes": "2025-12", "total": 1655}, {"mes": "2026-01", "total": 1523}, {"mes": "2026-02", "total": 1506}, {"mes": "2026-03", "total": 1642}, {"mes": "2026-04", "total": 1564}, {"mes": "2026-05", "total": 1543}, {"mes": "2026-06", "total": 1541}, {"mes": "2026-07", "total": 1650}, {"mes": "2026-08", "total": 1613}, {"mes": "2026-09", "total": 1609}],
};
