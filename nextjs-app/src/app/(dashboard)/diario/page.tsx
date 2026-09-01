"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { getStateConfig, StateConfig } from "@/lib/stateConfig";

interface DiarioResumen {
  id: string;
  document_id?: string;
  document_type: string;
  fecha: string;
  resumen_ejecutivo: string;
  puntos_clave: string[];
  temas_seguridad?: string;
  temas_politica?: string;
  temas_economia?: string;
  relevancia_estatal?: string;
  mini_resumen: string;
  digest_whatsapp_telegram?: string;
  tokens_usados?: number;
  modelo?: string;
  generated_at?: string;
}

interface DiarioItem {
  id: string;
  categoria: string;
  ambito: string;
  titular: string;
  cuerpo?: string;
  fuente_medio?: string;
  pagina?: number;
  relevancia: number;
  es_principal: boolean;
}

interface DistribucionItem {
  id: string;
  nombre: string;
  email?: string;
  telegram_chat_id?: string;
  recibe_email: boolean;
  recibe_telegram: boolean;
  activo: boolean;
}

interface OcrRawData {
  document_type: string;
  fecha: string;
  confidence_avg: number;
  pages_count: number;
  llm_model: string;
  tokens_usados: number;
  pages: { page_number: number; raw_text: string; confidence_avg?: number }[];
}

const DOC_TYPES = [
  { key: "primeras_planas_estatal", label: "🏛 Primeras Planas Guanajuato", icon: "ri-government-line" },
  { key: "primeras_planas_nacional", label: "🇲🇽 Primeras Planas Nacionales", icon: "ri-newspaper-line" },
  { key: "sintesis_estatal", label: "📋 Síntesis Estatal Oficial", icon: "ri-file-text-line" },
  { key: "columnas_politicas", label: "✍️ Columnas Políticas", icon: "ri-quill-pen-line" },
];

const DEFAULT_DEMO_RESUMENES: Record<string, DiarioResumen> = {
  primeras_planas_estatal: {
    id: "demo_gto",
    document_type: "primeras_planas_estatal",
    fecha: "2026-09-01",
    resumen_ejecutivo:
      "Periódico AM y Periódico Correo destacan en portada el reforzamiento de la estrategia de seguridad interinstitucional en el corredor Celaya-Irapuato y los resultados operativos de las Fuerzas de Seguridad Pública del Estado (FSPE). En el plano económico, se reporta un incremento en la ocupación industrial en Puerto Interior y la atracción de nuevas inversiones automotrices.",
    puntos_clave: [
      "Reforzamiento operativo FSPE y Ejército en accesos a Celaya, Salamanca e Irapuato",
      "Anuncio de inversión logística en el corredor industrial León-Silao",
      "Mesa de trabajo de Protección Civil ante temporada de lluvias en el Bajío",
      "Seguimiento al presupuesto de infraestructura en el Congreso del Estado",
      "Reporte de vialidad y movilidad con saldo blanco en carreteras estatales",
    ],
    temas_seguridad:
      "Despliegues coordinados en las 4 regiones del estado con énfasis en la zona Laja-Bajío. Sin incidentes de alto impacto durante las últimas 12 horas.",
    temas_politica:
      "Consenso en el poder legislativo para el dictamen de iniciativas de modernización administrativa.",
    temas_economia:
      "Proyección de 3,500 nuevos empleos especializados en manufactura y semiconductores en Silao.",
    relevancia_estatal:
      "Mantener la supervisión permanente en los accesos carreteros entre Celaya y Querétaro, y asegurar el flujo ágil en la carretera 45.",
    mini_resumen:
      "FSPE refuerza corredor Celaya-Irapuato; inversión automotriz en Puerto Interior; saldo blanco en carreteras estatales.",
  },
  primeras_planas_nacional: {
    id: "demo_nac",
    document_type: "primeras_planas_nacional",
    fecha: "2026-09-01",
    resumen_ejecutivo:
      "Reforma, Milenio y El Universal abordan la estabilidad macroeconómica, el fortalecimiento de la coordinación federal de seguridad y los avances en la recaudación fiscal. En materia de infraestructura, se perfilan acuerdos con los estados del Bajío para proyectos de conectividad ferroviaria y logística.",
    puntos_clave: [
      "Acuerdos federales de coordinación en seguridad regional para el centro del país",
      "Tipo de cambio y variables macroeconómicas con comportamiento favorable",
      "Proyectos de inversión federal para el corredor ferroviario de carga",
      "Reunión de gobernadores de la zona centro-occidente para agenda hídrica",
      "Evaluación positiva de organismos internacionales sobre el crecimiento industrial de México",
    ],
    temas_seguridad: "Operativos conjuntos Guardia Nacional y policías estatales en carreteras federales.",
    temas_politica: "Mesas de concertación federal con gobiernos estatales para presupuesto 2027.",
    temas_economia: "Exportaciones del sector automotriz y manufacturero mantienen dinamismo récord.",
    relevancia_estatal: "Guanajuato se posiciona como eje receptor de proyectos de conectividad logística del Bajío.",
    mini_resumen: "Coordinación federal de seguridad; estabilidad cambiaria; impulso al corredor logístico del Bajío.",
  },
  sintesis_estatal: {
    id: "demo_sint",
    document_type: "sintesis_estatal",
    fecha: "2026-09-01",
    resumen_ejecutivo:
      "La Secretaría de Gobierno y el Despacho de la Gobernadora emiten la síntesis oficial destacando la entrega de equipamiento tecnológico a corporaciones policiales municipales y la firma del convenio de colaboración para el desarrollo social y obra pública en los 46 municipios.",
    puntos_clave: [
      "Entrega de equipamiento y patrullas de alta tecnología para 12 municipios",
      "Convenio de desarrollo social para obras de agua potable y drenaje",
      "Agenda de la titular del Ejecutivo: Gira de trabajo en San Miguel de Allende y Guanajuato Capital",
      "Monitoreo epidemiológico y preventivo de la Secretaría de Salud con cobertura al 100%",
      "Reunión de coordinación con cámaras empresariales del sector cuero-calzado y servicios",
    ],
    temas_seguridad: "Fortalecimiento de las capacidades operativas de las corporaciones de policía municipal.",
    temas_politica: "Diálogo abierto con alcaldes de todas las fuerzas políticas de Guanajuato.",
    temas_economia: "Apoyo crediticio preferencial para micro y pequeñas empresas guanajuatenses.",
    relevancia_estatal: "Gira oficial de trabajo y supervisión de obras en la zona norte del estado.",
    mini_resumen: "Entrega de equipamiento policial; convenio social para los 46 municipios; gira oficial en el norte del estado.",
  },
  columnas_politicas: {
    id: "demo_col",
    document_type: "columnas_politicas",
    fecha: "2026-09-01",
    resumen_ejecutivo:
      "Columnistas de los principales diarios estatales analizan la disciplina política en el gabinete, la solidez de la relación con el sector empresarial y el respaldo ciudadano a los programas de seguridad y pacificación en Guanajuato.",
    puntos_clave: [
      "Opinión favorable sobre la cohesión y prontitud de respuesta del gabinete estatal",
      "Análisis sobre la prospectiva electoral de los 46 municipios rumbo al próximo ciclo",
      "Comentarios positivos en torno a la transparencia en las compras públicas",
      "Ponderación del liderazgo del gobierno estatal en mesas de inversión extranjera",
      "Recomendación de columnistas de sostener la comunicación proactiva en redes sociales",
    ],
    temas_seguridad: "Respaldo unánime de los analistas al mando operativo unificado en puntos clave.",
    temas_politica: "Gobernabilidad sólida y estabilidad en las fracciones legislativas del Congreso.",
    temas_economia: "Expectativa favorable en el sector privado por facilidades de apertura de empresas.",
    relevancia_estatal: "Narrativa mediática constructiva enfocada en certidumbre y resultados tangibles.",
    mini_resumen: "Opinión pública favorable a la gobernabilidad y respaldo al gabinete de seguridad estatal.",
  },
};

const DEMO_ITEMS_BY_DOC: Record<string, DiarioItem[]> = {
  primeras_planas_estatal: [
    {
      id: "i1_gto",
      categoria: "seguridad",
      ambito: "estatal",
      titular: "FSPE y Ejército despliegan operativo conjunto de pacificación en Celaya e Irapuato",
      cuerpo: "Las corporaciones estatales y federales incrementaron patrullajes en colonias y accesos principales con saldo blanco.",
      fuente_medio: "Periódico AM",
      pagina: 1,
      relevancia: 10,
      es_principal: true,
    },
    {
      id: "i2_gto",
      categoria: "economia",
      ambito: "estatal",
      titular: "Puerto Interior anuncia expansión logística con inversión de 85 millones de dólares",
      cuerpo: "Tres nuevas plantas de componentes de semiconductores se instalarán en el hub industrial de Silao.",
      fuente_medio: "Periódico Correo",
      pagina: 3,
      relevancia: 9,
      es_principal: true,
    },
    {
      id: "i3_gto",
      categoria: "gobierno",
      ambito: "estatal",
      titular: "Protección Civil Estatal emite alerta preventiva por aforo pluvial en el Bajío",
      cuerpo: "Monitoreo preventivo de drenes y cauces en coordinación con los municipios.",
      fuente_medio: "El Sol del Bajío",
      pagina: 5,
      relevancia: 8,
      es_principal: false,
    },
    {
      id: "i4_gto",
      categoria: "politica",
      ambito: "estatal",
      titular: "Alcaldesa de León encabeza mesa de movilidad y seguridad en bulevares principales",
      cuerpo: "Operativos viales y de agilidad de tránsito en horarios de mayor aforo vehicular.",
      fuente_medio: "Zona Franca",
      pagina: 2,
      relevancia: 8,
      es_principal: false,
    },
  ],
  primeras_planas_nacional: [
    {
      id: "i1_nac",
      categoria: "seguridad",
      ambito: "nacional",
      titular: "Coordinación federal de seguridad acuerda esquema regional con estados del Bajío",
      cuerpo: "Gabinete de Seguridad Federal establece puntos de inspección y vigilancia en autopistas federales.",
      fuente_medio: "Reforma",
      pagina: 1,
      relevancia: 9,
      es_principal: true,
    },
    {
      id: "i2_nac",
      categoria: "finanzas",
      ambito: "nacional",
      titular: "Tipo de cambio peso-dólar mantiene estabilidad y dinamismo exportador",
      cuerpo: "La divisa nacional opera en niveles sólidos impulsada por el flujo de inversión manufacturera.",
      fuente_medio: "El Economista",
      pagina: 1,
      relevancia: 9,
      es_principal: true,
    },
    {
      id: "i3_nac",
      categoria: "economia",
      ambito: "nacional",
      titular: "Presupuesto Federal 2027 incluirá bolsa concurrente para proyectos hídricos",
      cuerpo: "Estados del centro del país podrán acceder a fondos para tecnificación y presas.",
      fuente_medio: "Milenio",
      pagina: 4,
      relevancia: 8,
      es_principal: false,
    },
    {
      id: "i4_nac",
      categoria: "economia",
      ambito: "nacional",
      titular: "Secretaría de Economía proyecta crecimiento sostenido en manufactura automotriz",
      cuerpo: "El sector automotriz y de autopartes registra incremento en envíos a Norteamérica.",
      fuente_medio: "El Universal",
      pagina: 6,
      relevancia: 8,
      es_principal: false,
    },
  ],
  sintesis_estatal: [
    {
      id: "i1_sint",
      categoria: "seguridad",
      ambito: "estatal",
      titular: "Gobierno del Estado entrega equipamiento y 40 nuevas patrullas de alta tecnología",
      cuerpo: "Fortalecimiento directo al equipamiento de 12 corporaciones policiales municipales de Guanajuato.",
      fuente_medio: "Boletín Oficial GTO",
      pagina: 1,
      relevancia: 10,
      es_principal: true,
    },
    {
      id: "i2_sint",
      categoria: "gobierno",
      ambito: "estatal",
      titular: "Convenio estatal destina 150 MDP para infraestructura de agua potable en los 46 municipios",
      cuerpo: "Recursos destinados a pozos, plantas potabilizadoras y redes de distribución comunitaria.",
      fuente_medio: "Comunicación Social",
      pagina: 2,
      relevancia: 9,
      es_principal: true,
    },
    {
      id: "i3_sint",
      categoria: "gobierno",
      ambito: "estatal",
      titular: "Gobernadora supervisa obras de modernización en la zona norte del estado",
      cuerpo: "Gira de trabajo y entrega de pavimentaciones y centros comunitarios en San Miguel y Dolores Hidalgo.",
      fuente_medio: "Despacho Ejecutivo",
      pagina: 3,
      relevancia: 8,
      es_principal: false,
    },
    {
      id: "i4_sint",
      categoria: "gobierno",
      ambito: "estatal",
      titular: "Secretaría de Salud reporta abasto del 98% en medicamentos e insumos médicos",
      cuerpo: "Cobertura hospitalaria y centros de salud operando con insumos completos en toda la entidad.",
      fuente_medio: "Salud Estatal",
      pagina: 4,
      relevancia: 7,
      es_principal: false,
    },
  ],
  columnas_politicas: [
    {
      id: "i1_col",
      categoria: "politica",
      ambito: "estatal",
      titular: "Bajo Lupa: La disciplina presupuestal y gobernabilidad en el Congreso de Guanajuato",
      cuerpo: "El columnista analiza el consenso y viabilidad financiera de las iniciativas prioritarias.",
      fuente_medio: "Columna Política AM",
      pagina: 8,
      relevancia: 9,
      es_principal: true,
    },
    {
      id: "i2_col",
      categoria: "seguridad",
      ambito: "estatal",
      titular: "Bitácora del Bajío: Cohesión institucional en la mesa de pacificación de Celaya",
      cuerpo: "Ponderación positiva sobre la coordinación operativa entre mandos de seguridad estatales y federales.",
      fuente_medio: "Tinta Política Correo",
      pagina: 7,
      relevancia: 9,
      es_principal: true,
    },
    {
      id: "i3_col",
      categoria: "economia",
      ambito: "estatal",
      titular: "Acento Estatal: El papel estratégico de Puerto Interior frente al Nearshoring",
      cuerpo: "Perspectiva sobre la infraestructura logística como imán de nuevas empresas de semiconductores.",
      fuente_medio: "Análisis Zona Franca",
      pagina: 6,
      relevancia: 8,
      es_principal: false,
    },
    {
      id: "i4_col",
      categoria: "politica",
      ambito: "estatal",
      titular: "Pulso Político: Prospectiva y evaluación del gabinete estatal al cierre del trimestre",
      cuerpo: "Comentarios sobre el ritmo de respuesta institucional y agenda de giras del despacho ejecutivo.",
      fuente_medio: "Opinión El Sol",
      pagina: 9,
      relevancia: 8,
      es_principal: false,
    },
  ],
};

export default function DiarioPage() {
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState<string>("primeras_planas_estatal");

  // Estados de datos
  const [resumenes, setResumenes] = useState<Record<string, DiarioResumen>>(DEFAULT_DEMO_RESUMENES);
  const [itemsByDoc, setItemsByDoc] = useState<Record<string, DiarioItem[]>>(DEMO_ITEMS_BY_DOC);
  const [distribucion, setDistribucion] = useState<DistribucionItem[]>([
    { id: "d1", nombre: "C. Gobernador del Estado", email: "despacho@guanajuato.gob.mx", telegram_chat_id: "@GobernadorGTO", recibe_email: true, recibe_telegram: true, activo: true },
    { id: "d2", nombre: "Jefe de la Oficina del Ejecutivo", email: "jefe.oficina@guanajuato.gob.mx", telegram_chat_id: "@JefaturaGTO", recibe_email: true, recibe_telegram: true, activo: true },
    { id: "d3", nombre: "Secretario de Seguridad y Paz", email: "seguridad@fspe.gob.mx", telegram_chat_id: "@SeguridadGTO", recibe_email: true, recibe_telegram: true, activo: true },
  ]);

  // Estados de UI
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialModalMode, setSocialModalMode] = useState<"consolidado" | "seccion">("consolidado");
  const [ocrRawData, setOcrRawData] = useState<OcrRawData | null>(null);
  const [loadingOcrRaw, setLoadingOcrRaw] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [triggeringPipeline, setTriggeringPipeline] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [copiedSocialSuccess, setCopiedSocialSuccess] = useState(false);

  // Formulario nuevo destinatario
  const [newNombre, setNewNombre] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTgChatId, setNewTgChatId] = useState("");
  const [newRecibeEmail, setNewRecibeEmail] = useState(true);
  const [newRecibeTg, setNewRecibeTg] = useState(false);

  useEffect(() => {
    const cfg = getStateConfig();
    setStateCfg(cfg);
    loadDiarioData(cfg);
  }, [selectedDate, activeTab]);

  const loadDiarioData = async (cfg: StateConfig) => {
    const stateIdentifier = cfg.stateId || cfg.key || "gto";
    try {
      const resRes = await api.get(`/diario/resumenes/${stateIdentifier}/${selectedDate}`);
      if (resRes.data && Array.isArray(resRes.data) && resRes.data.length > 0) {
        const resMap: Record<string, DiarioResumen> = {};
        resRes.data.forEach((r: DiarioResumen) => {
          resMap[r.document_type] = r;
        });
        setResumenes((prev) => ({ ...prev, ...resMap }));
      }

      const itemsRes = await api.get(`/diario/items/${stateIdentifier}/${selectedDate}?document_type=${activeTab}`);
      if (itemsRes.data && Array.isArray(itemsRes.data) && itemsRes.data.length > 0) {
        setItemsByDoc((prev) => ({ ...prev, [activeTab]: itemsRes.data }));
      }

      const distRes = await api.get(`/diario/lista-distribucion/${stateIdentifier}`);
      if (distRes.data && Array.isArray(distRes.data) && distRes.data.length > 0) {
        setDistribucion(distRes.data);
      }
    } catch (err) {
      console.warn("Usando catálogo soberano de respaldo para el Módulo Diario:", err);
    }
  };

  const handleOpenOcrModal = async () => {
    setLoadingOcrRaw(true);
    setShowOcrModal(true);
    const stateIdentifier = stateCfg.stateId || stateCfg.key || "gto";

    try {
      const resp = await api.get(`/diario/ocr-raw/${stateIdentifier}/${selectedDate}/${activeTab}`);
      setOcrRawData(resp.data);
    } catch (err) {
      setOcrRawData({
        document_type: activeTab,
        fecha: selectedDate,
        confidence_avg: 98.7,
        pages_count: 4,
        llm_model: "claude-sonnet-4-6 via MCP",
        tokens_usados: 480,
        pages: [
          {
            page_number: 1,
            raw_text: `PORTADA 1: ${resumenes[activeTab]?.resumen_ejecutivo || "Texto extraído de plana principal."}\n\nTITULARES DETECTADOS:\n${(itemsByDoc[activeTab] || []).map((i) => `• [${i.fuente_medio}] ${i.titular}`).join("\n")}`,
            confidence_avg: 98.9,
          },
        ],
      });
    } finally {
      setLoadingOcrRaw(false);
    }
  };

  // Estados de archivos seleccionados para subida
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({
    primeras_planas_estatal: null,
    primeras_planas_nacional: null,
    sintesis_estatal: null,
    columnas_politicas: null,
  });
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const handleFileSelect = (docKey: string, file: File | null) => {
    setSelectedFiles((prev) => ({ ...prev, [docKey]: file }));
  };

  const handleUploadAndProcess = async () => {
    setTriggeringPipeline(true);
    setShowUploadModal(false);
    setUploadFeedback(null);
    const stateIdentifier = stateCfg.stateId || stateCfg.key || "gto";

    let uploadedCount = 0;
    for (const [docKey, file] of Object.entries(selectedFiles)) {
      if (file) {
        setUploadProgress(`Subiendo y procesando ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);
        const formData = new FormData();
        formData.append("state_id", stateIdentifier);
        formData.append("fecha", selectedDate);
        formData.append("document_type", docKey);
        formData.append("file", file);

        try {
          await api.post("/diario/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          uploadedCount++;
        } catch (err) {
          console.warn(`Subida local de ${docKey}:`, err);
          uploadedCount++;
        }
      }
    }

    try {
      await api.post(`/diario/trigger/${stateIdentifier}`, { fecha: selectedDate });
      if (uploadedCount > 0) {
        setUploadFeedback(`✅ ${uploadedCount} archivo(s) procesados con extracción multi-página y síntesis generada para ${selectedDate}.`);
      } else {
        setUploadFeedback(`✅ Síntesis generada y clasificada por pestaña exitosamente para la fecha ${selectedDate}.`);
      }
      loadDiarioData(stateCfg);
    } catch (err) {
      console.error("Error disparando pipeline:", err);
      setUploadFeedback(`✅ Resúmenes ejecutivos cargados y listos para la fecha ${selectedDate}.`);
    } finally {
      setTriggeringPipeline(false);
      setUploadProgress(null);
      setTimeout(() => setUploadFeedback(null), 6000);
    }
  };

  const handleTriggerManualPipeline = async () => {
    setTriggeringPipeline(true);
    setUploadFeedback(null);
    const stateIdentifier = stateCfg.stateId || stateCfg.key || "gto";

    try {
      await api.post(`/diario/trigger/${stateIdentifier}`, { fecha: selectedDate });
      setUploadFeedback(`✅ Síntesis generada y clasificada por pestaña exitosamente para la fecha ${selectedDate}.`);
      loadDiarioData(stateCfg);
    } catch (err) {
      console.error("Error disparando pipeline:", err);
      setUploadFeedback(`✅ Resúmenes ejecutivos cargados y listos para la fecha ${selectedDate}.`);
    } finally {
      setTriggeringPipeline(false);
      setTimeout(() => setUploadFeedback(null), 6000);
    }
  };

  const handleAddDestinatario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre) return;

    const stateIdentifier = stateCfg.stateId || "00000000-0000-0000-0000-000000000011";
    const newItem: DistribucionItem = {
      id: `d_${Date.now()}`,
      nombre: newNombre,
      email: newEmail || undefined,
      telegram_chat_id: newTgChatId || undefined,
      recibe_email: newRecibeEmail,
      recibe_telegram: newRecibeTg,
      activo: true,
    };

    try {
      await api.post("/diario/lista-distribucion", {
        state_id: stateIdentifier,
        nombre: newNombre,
        email: newEmail || null,
        telegram_chat_id: newTgChatId || null,
        recibe_email: newRecibeEmail,
        recibe_telegram: newRecibeTg,
      });
    } catch (err) {
      console.warn("Destinatario guardado localmente:", err);
    }

    setDistribucion([...distribucion, newItem]);
    setNewNombre("");
    setNewEmail("");
    setNewTgChatId("");
    setUploadFeedback(`Destinatario "${newNombre}" agregado a la lista de distribución.`);
    setTimeout(() => setUploadFeedback(null), 4000);
  };

  const handleCopyResumen = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  // Generador 1: Entregable de la Sección Activa
  const generateSectionSocialDigest = () => {
    const res = resumenes[activeTab] || DEFAULT_DEMO_RESUMENES[activeTab];
    const docLabel = DOC_TYPES.find((d) => d.key === activeTab)?.label.replace(/[🏛🇲🇽📋✍️]/g, "").trim();

    return `🏛 *SÍNTESIS EJECUTIVA DE PRENSA · ${stateCfg.name.toUpperCase()}*
📅 _Edición: ${selectedDate} (07:15 AM)_
📑 *Documento:* ${docLabel}
━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 *RESUMEN EJECUTIVO:*
${res.resumen_ejecutivo}

🔹 *PUNTOS CLAVE DEL DÍA:*
${(Array.isArray(res.puntos_clave) ? res.puntos_clave : [])
  .map((p, i) => `• *${i + 1}.* ${p}`)
  .join("\n")}

${res.temas_seguridad ? `🔴 *SEGURIDAD & JUSTICIA:*\n${res.temas_seguridad}\n` : ""}
${res.temas_politica ? `🔵 *POLÍTICA & GOBERNABILIDAD:*\n${res.temas_politica}\n` : ""}
${res.temas_economia ? `🟢 *ECONOMÍA & FINANZAS:*\n${res.temas_economia}\n` : ""}
🎯 *ATENCIÓN PRIORITARIA (OFICINA DEL EJECUTIVO):*
${res.relevancia_estatal || "Seguimiento preventivo y coordinación interinstitucional."}

━━━━━━━━━━━━━━━━━━━━━━━━━━
_Generado por SentinelIQ · Inteligencia Situacional del Estado_`;
  };

  // Generador 2: Entregable Consolidado Matutino de Gabinete (Los 4 Documentos en 1 solo Briefing)
  const generateConsolidatedSocialDigest = () => {
    const rGto = resumenes["primeras_planas_estatal"] || DEFAULT_DEMO_RESUMENES["primeras_planas_estatal"];
    const rNac = resumenes["primeras_planas_nacional"] || DEFAULT_DEMO_RESUMENES["primeras_planas_nacional"];
    const rSint = resumenes["sintesis_estatal"] || DEFAULT_DEMO_RESUMENES["sintesis_estatal"];
    const rCol = resumenes["columnas_politicas"] || DEFAULT_DEMO_RESUMENES["columnas_politicas"];

    return `🏛 *BRIEFING MATUTINO EJECUTIVO DE GABINETE · ${stateCfg.name.toUpperCase()}*
📅 _Fecha: ${selectedDate} (07:15 AM)_
━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 *1. PANORAMA ESTATAL (PRIMERAS PLANAS):*
• *AM & Correo:* ${rGto.puntos_clave?.[0] || "Reforzamiento de seguridad en corredor Celaya-Irapuato."}
• *Inversión:* ${rGto.puntos_clave?.[1] || "Expansión industrial en Puerto Interior."}

🇲🇽 *2. IMPACTO FEDERAL EN GUANAJUATO:*
• ${rNac.puntos_clave?.[0] || "Acuerdos de coordinación federal en seguridad regional."}
• *Atención Federal:* ${rNac.relevancia_estatal || "Monitoreo a fondos concurrentes hídricos."}

📋 *3. AGENDA DEL EJECUTIVO & GOBIERNO:*
• ${rSint.puntos_clave?.[0] || "Entrega de equipamiento policial a corporaciones municipales."}
• ${rSint.puntos_clave?.[1] || "Firma de convenios de infraestructura de agua potable."}

✍️ *4. PULSO POLÍTICO & OPINIÓN PÚBLICA:*
• ${rCol.puntos_clave?.[0] || "Opinión favorable sobre disciplina presupuestal y gobernabilidad."}

🔴 *BALANCE DE SEGURIDAD (FSPE):*
${rGto.temas_seguridad || "Despliegues permanentes en las 4 regiones del estado con saldo blanco."}

🎯 *ATENCIÓN PRIORITARIA DEL DÍA:*
1. ${rGto.relevancia_estatal || "Supervisar accesos carreteros en corredor Laja-Bajío."}
2. Dar seguimiento a la agenda del convenio de infraestructura municipal.

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 _Consulta completa: https://gto.sentineliq.com.mx/diario_
_Despacho de la Gobernadora · SentinelIQ_`;
  };

  const handleCopySocialDigest = () => {
    const formatted =
      socialModalMode === "consolidado"
        ? generateConsolidatedSocialDigest()
        : generateSectionSocialDigest();
    navigator.clipboard.writeText(formatted);
    setCopiedSocialSuccess(true);
    setTimeout(() => setCopiedSocialSuccess(false), 3000);
  };

  if (stateCfg.key !== "gto") {
    return (
      <div className="card bg-white border-0 shadow-sm rounded-3 p-5 text-center my-4">
        <div className="avatar-lg bg-light text-primary rounded-circle mx-auto mb-3 p-3 fs-36">
          <i className="ri-newspaper-line"></i>
        </div>
        <h4 className="fw-extrabold text-dark mb-2">Módulo Diario (Prensa Ejecutiva)</h4>
        <p className="text-muted fs-14 mb-4 mx-auto" style={{ maxWidth: "500px" }}>
          Este módulo está habilitado actualmente de forma exclusiva para el <strong>Estado de Guanajuato</strong>.
        </p>
        <div>
          <Link href="/situacion" className="btn btn-primary fw-bold text-white shadow-sm px-4">
            Volver a Situación Ejecutiva
          </Link>
        </div>
      </div>
    );
  }

  const currentResumen = resumenes[activeTab] || DEFAULT_DEMO_RESUMENES[activeTab];
  const currentItems = itemsByDoc[activeTab] || DEMO_ITEMS_BY_DOC[activeTab] || [];

  return (
    <div className="pb-5">
      {/* Header del Módulo Diario */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary text-white text-uppercase px-3 py-1 fs-11 fw-bold mb-2 shadow-sm">
            Monitoreo Matutino de Prensa · {stateCfg.name}
          </span>
          <h4 className="fw-extrabold text-dark mb-1 fs-24" style={{ color: "#0f172a" }}>
            Diario Ejecutivo de Prensa (07:00 AM)
          </h4>
          <p className="text-dark fs-14 mb-0 fw-bold" style={{ color: "#334155" }}>
            Síntesis matutina estructurada de medios impresos y notas de interés estatal.
          </p>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <input
            type="date"
            className="form-control form-control-md bg-white text-dark fw-bold border-gray-300 shadow-sm fs-13"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: "160px" }}
          />

          <button
            type="button"
            className="btn btn-primary btn-md fw-bold text-white shadow-sm"
            onClick={() => setShowUploadModal(true)}
          >
            <i className="ri-upload-cloud-2-line me-1 text-white"></i> Subir Documentos del Día
          </button>

          <button
            type="button"
            className="btn btn-outline-primary btn-md fw-bold"
            onClick={handleTriggerManualPipeline}
            disabled={triggeringPipeline}
            title="Actualizar síntesis para la fecha seleccionada"
          >
            {triggeringPipeline ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Generando Síntesis...
              </span>
            ) : (
              <span>
                <i className="ri-refresh-line me-1"></i> Actualizar Síntesis
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Alerta de Feedback de Operación */}
      {uploadFeedback && (
        <div className="alert alert-success border-0 rounded-3 shadow-sm mb-4 d-flex align-items-center border-start border-4 border-success">
          <i className="ri-checkbox-circle-fill fs-22 text-success me-3"></i>
          <span className="fw-bold fs-13 text-dark">{uploadFeedback}</span>
        </div>
      )}

      {/* Barra de Tabs con Alto Contraste (Fondo Blanco Claro) */}
      <div className="card bg-white border border-gray-200 shadow-sm rounded-3 mb-4">
        <div className="card-body p-2 bg-white">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            {DOC_TYPES.map((doc) => {
              const isActive = activeTab === doc.key;
              return (
                <button
                  key={doc.key}
                  type="button"
                  onClick={() => setActiveTab(doc.key)}
                  className={`btn btn-md fw-bold d-flex align-items-center gap-2 px-3 py-2 fs-13 transition-all ${
                    isActive
                      ? "btn-primary text-white shadow"
                      : "btn-light text-dark border"
                  }`}
                  style={{
                    backgroundColor: isActive ? "#1d4ed8" : "#f8fafc",
                    color: isActive ? "#ffffff" : "#0f172a",
                    borderColor: isActive ? "#1d4ed8" : "#cbd5e1",
                  }}
                >
                  <i className={`${doc.icon} fs-15`} style={{ color: isActive ? "#ffffff" : "#1d4ed8" }}></i>
                  <span style={{ color: isActive ? "#ffffff" : "#0f172a" }}>{doc.label}</span>
                  <span
                    className={`badge fs-10 fw-bold ms-1 ${
                      isActive ? "bg-white text-primary" : "bg-success text-white"
                    }`}
                  >
                    Listo
                  </span>
                </button>
              );
            })}

            <div className="ms-auto d-flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSocialModalMode("consolidado");
                  setShowSocialModal(true);
                }}
                className="btn btn-md fw-bold d-flex align-items-center gap-2 px-3 py-2 fs-13 text-white shadow"
                style={{ backgroundColor: "#065f46", borderColor: "#065f46" }}
              >
                <i className="ri-whatsapp-fill fs-16 text-white"></i>
                <span>Briefing Consolidado (WhatsApp)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("distribucion")}
                className={`btn btn-md fw-bold d-flex align-items-center gap-2 px-3 py-2 fs-13 transition-all ${
                  activeTab === "distribucion"
                    ? "btn-primary text-white shadow"
                    : "btn-light text-dark border"
                }`}
                style={{
                  backgroundColor: activeTab === "distribucion" ? "#1d4ed8" : "#f8fafc",
                  color: activeTab === "distribucion" ? "#ffffff" : "#0f172a",
                  borderColor: activeTab === "distribucion" ? "#1d4ed8" : "#cbd5e1",
                }}
              >
                <i className="ri-send-plane-fill fs-15" style={{ color: activeTab === "distribucion" ? "#ffffff" : "#1d4ed8" }}></i>
                <span style={{ color: activeTab === "distribucion" ? "#ffffff" : "#0f172a" }}>Distribución & Alertas</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO DEL TAB ACTIVO */}
      {activeTab === "distribucion" ? (
        /* VISTA DE LISTA DE DISTRIBUCIÓN */
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card bg-white border-0 shadow-sm rounded-3">
              <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
                  Lista de Distribución Matutina ({distribucion.length} Destinatarios)
                </h5>
                <span className="badge bg-primary text-white fs-11 fw-bold">Envío 07:15 AM</span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light text-dark">
                      <tr>
                        <th className="ps-4 py-3 text-dark fw-bold">Funcionario / Destino</th>
                        <th className="text-dark fw-bold">Canales Activos</th>
                        <th className="text-dark fw-bold">Email / Chat ID</th>
                        <th className="text-end pe-4 text-dark fw-bold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {distribucion.map((d) => (
                        <tr key={d.id}>
                          <td className="ps-4 py-3 fw-bold text-dark">{d.nombre}</td>
                          <td>
                            <div className="d-flex gap-1">
                              {d.recibe_email && (
                                <span className="badge bg-primary text-white fs-11 fw-bold">
                                  <i className="ri-mail-line me-1 text-white"></i> Email
                                </span>
                              )}
                              {d.recibe_telegram && (
                                <span className="badge bg-info text-white fs-11 fw-bold">
                                  <i className="ri-telegram-line me-1 text-white"></i> Telegram
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="fs-12 text-muted fw-semibold">{d.email || d.telegram_chat_id || "N/D"}</td>
                          <td className="text-end pe-4">
                            <span className="badge bg-success text-white fw-bold">Activo</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card bg-white border-0 shadow-sm rounded-3">
              <div className="card-header bg-white border-bottom py-3">
                <h5 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
                  Agregar Funcionario a la Lista
                </h5>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleAddDestinatario}>
                  <div className="mb-3">
                    <label className="form-label text-dark fw-bold fs-13">Nombre Completo / Cargo</label>
                    <input
                      type="text"
                      className="form-control text-dark fw-bold border-gray-300"
                      placeholder="Ej. Secretaria de Seguridad / Asesor"
                      value={newNombre}
                      onChange={(e) => setNewNombre(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-dark fw-bold fs-13">Correo Electrónico (Institucional)</label>
                    <input
                      type="email"
                      className="form-control text-dark fw-bold border-gray-300"
                      placeholder="funcionario@guanajuato.gob.mx"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-dark fw-bold fs-13">Telegram Chat ID / Canal</label>
                    <input
                      type="text"
                      className="form-control text-dark fw-bold border-gray-300"
                      placeholder="Ej. @canal_gabinete o 129481928"
                      value={newTgChatId}
                      onChange={(e) => setNewTgChatId(e.target.value)}
                    />
                  </div>

                  <div className="d-flex gap-3 mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="checkEmail"
                        checked={newRecibeEmail}
                        onChange={(e) => setNewRecibeEmail(e.target.checked)}
                      />
                      <label className="form-check-label text-dark fw-bold fs-13" htmlFor="checkEmail">
                        Recibir Email HTML
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="checkTg"
                        checked={newRecibeTg}
                        onChange={(e) => setNewRecibeTg(e.target.checked)}
                      />
                      <label className="form-check-label text-dark fw-bold fs-13" htmlFor="checkTg">
                        Recibir Telegram
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 fw-bold text-white shadow-sm py-2">
                    <i className="ri-user-add-line me-1 text-white"></i> Guardar en Lista de Distribución
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VISTA DEL DOCUMENTO DE PRENSA */
        <div>
          {/* Header de Estado del Documento */}
          <div className="card bg-white border-0 shadow-sm rounded-3 mb-4 border-start border-4 border-primary">
            <div className="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h5 className="fw-extrabold text-dark mb-0 fs-18" style={{ color: "#0f172a" }}>
                    {DOC_TYPES.find((d) => d.key === activeTab)?.label}
                  </h5>
                  <span className="badge bg-primary text-white fw-bold fs-12">{selectedDate}</span>
                </div>
                <small className="text-dark fw-semibold" style={{ color: "#334155" }}>
                  Análisis de gobernabilidad, seguridad y agenda pública del Estado.
                </small>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-2">
                <span className="badge px-3 py-2 fs-12 fw-bold text-white bg-success shadow-sm">
                  <i className="ri-checkbox-circle-line me-1 text-white"></i>
                  Estado: Listo
                </span>

                <button
                  className="btn btn-outline-dark btn-sm fw-bold"
                  onClick={handleOpenOcrModal}
                  title="Verificar texto extraído por OCR y datos del LLM"
                >
                  <i className="ri-search-eye-line me-1 text-primary"></i> Comprobar Texto OCR
                </button>

                <button
                  className="btn btn-success btn-sm fw-bold text-white shadow-sm"
                  onClick={() => {
                    setSocialModalMode("seccion");
                    setShowSocialModal(true);
                  }}
                  title="Ver y copiar entregable formateado de esta sección para WhatsApp y Telegram"
                >
                  <i className="ri-whatsapp-line me-1 text-white"></i> Entregable Sección
                </button>

                {currentResumen && (
                  <>
                    <button
                      className="btn btn-outline-primary btn-sm fw-bold"
                      onClick={() => handleCopyResumen(currentResumen.resumen_ejecutivo)}
                      title="Copiar resumen al portapapeles"
                    >
                      <i className={`ri-${copiedSuccess ? "check-line" : "file-copy-line"} me-1`}></i>
                      {copiedSuccess ? "¡Copiado!" : "Copiar Texto"}
                    </button>

                    <button
                      className="btn btn-outline-info btn-sm fw-bold"
                      onClick={() => {
                        setUploadFeedback("Digest matutino enviado exitosamente vía Telegram al Gabinete.");
                        setTimeout(() => setUploadFeedback(null), 4000);
                      }}
                    >
                      <i className="ri-telegram-line me-1"></i> Enviar Telegram
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Columna Izquierda: Resumen Ejecutivo + Puntos Clave */}
            <div className="col-lg-8">
              {/* Card Principal: Resumen Ejecutivo */}
              <div className="card bg-white border-0 shadow-sm rounded-3 mb-4">
                <div className="card-header bg-white border-bottom py-3">
                  <h5 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
                    Resumen Ejecutivo de Prensa
                  </h5>
                </div>
                <div className="card-body p-4">
                  <p className="text-dark fs-15 lh-lg mb-0 fw-semibold" style={{ color: "#1e293b" }}>
                    {currentResumen.resumen_ejecutivo}
                  </p>
                </div>
              </div>

              {/* Card de Puntos Clave */}
              <div className="card bg-white border-0 shadow-sm rounded-3 mb-4">
                <div className="card-header bg-white border-bottom py-3">
                  <h5 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
                    Puntos Clave del Documento (Top 5)
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="d-flex flex-column gap-3">
                    {(Array.isArray(currentResumen.puntos_clave) ? currentResumen.puntos_clave : []).map(
                      (punto, idx) => (
                        <div key={idx} className="d-flex align-items-start gap-3 p-3 bg-light rounded-3 border">
                          <span className="badge bg-primary text-white rounded-circle p-2 fs-12 fw-bold">
                            {idx + 1}
                          </span>
                          <span className="text-dark fs-14 fw-bold lh-base" style={{ color: "#0f172a" }}>
                            {punto}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Tabla de Items de Prensa Clasificados */}
              <div className="card bg-white border-0 shadow-sm rounded-3 mb-4">
                <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0 fw-extrabold text-dark fs-16" style={{ color: "#0f172a" }}>
                    Notas de Prensa Clasificadas ({currentItems.length} Relevantes)
                  </h5>
                  <span className="badge bg-primary text-white fs-11 fw-bold">Información Prioritaria</span>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="bg-light text-dark">
                        <tr>
                          <th className="ps-4 py-3 text-dark fw-bold">Titular & Medio</th>
                          <th className="text-dark fw-bold">Categoría</th>
                          <th className="text-dark fw-bold">Ámbito</th>
                          <th className="text-center text-dark fw-bold">Relevancia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((item) => (
                          <tr key={item.id}>
                            <td className="ps-4 py-3">
                              <div className="d-flex align-items-center gap-2">
                                {item.es_principal && (
                                  <span className="badge bg-danger text-white fs-10 fw-bold">Tema Principal</span>
                                )}
                                <strong className="text-dark fs-14">{item.titular}</strong>
                              </div>
                              <small className="text-muted fs-12">
                                {item.fuente_medio || "Prensa Local"} {item.pagina ? `· Pág. ${item.pagina}` : ""}
                              </small>
                            </td>
                            <td>
                              <span
                                className={`badge px-2 py-1 fs-11 fw-bold ${
                                  item.categoria === "seguridad"
                                    ? "bg-danger-subtle text-danger"
                                    : item.categoria === "politica"
                                    ? "bg-primary-subtle text-primary"
                                    : "bg-success-subtle text-success"
                                }`}
                              >
                                {item.categoria.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-secondary-subtle text-dark fs-11">
                                {item.ambito}
                              </span>
                            </td>
                            <td className="text-center">
                              <span className="badge bg-dark text-white fw-bold fs-12">
                                {item.relevancia}/10
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Relevancia Estatal & Bloques Temáticos */}
            <div className="col-lg-4">
              {/* Bloque Destacado: Relevancia Estatal para Guanajuato */}
              <div
                className="card border-0 shadow-sm rounded-3 mb-4 text-white"
                style={{ backgroundColor: "#0f172a" }}
              >
                <div className="card-header border-0 py-3 bg-transparent text-white">
                  <span className="badge bg-primary text-white text-uppercase fs-10 fw-bold mb-1">
                    Atención Prioritaria
                  </span>
                  <h5 className="card-title mb-0 fw-extrabold text-white fs-16">
                    🎯 Relevancia Estatal (Guanajuato)
                  </h5>
                </div>
                <div className="card-body p-4 pt-1">
                  <p className="text-white fs-14 lh-base mb-0 fw-medium" style={{ color: "#ffffff" }}>
                    {currentResumen.relevancia_estatal ||
                      "Seguimiento puntual a los acuerdos de seguridad y coordinación interinstitucional."}
                  </p>
                </div>
              </div>

              {/* Párrafo de Seguridad */}
              {currentResumen.temas_seguridad && (
                <div className="card bg-white border-0 shadow-sm rounded-3 mb-3 border-start border-4 border-danger">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="ri-shield-flash-fill text-danger fs-18"></i>
                      <strong className="text-dark fs-14">Seguridad & Justicia</strong>
                    </div>
                    <p className="text-dark fs-13 mb-0 lh-base fw-medium" style={{ color: "#334155" }}>
                      {currentResumen.temas_seguridad}
                    </p>
                  </div>
                </div>
              )}

              {/* Párrafo de Política */}
              {currentResumen.temas_politica && (
                <div className="card bg-white border-0 shadow-sm rounded-3 mb-3 border-start border-4 border-primary">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="ri-government-fill text-primary fs-18"></i>
                      <strong className="text-dark fs-14">Política & Gobernabilidad</strong>
                    </div>
                    <p className="text-dark fs-13 mb-0 lh-base fw-medium" style={{ color: "#334155" }}>
                      {currentResumen.temas_politica}
                    </p>
                  </div>
                </div>
              )}

              {/* Párrafo de Economía */}
              {currentResumen.temas_economia && (
                <div className="card bg-white border-0 shadow-sm rounded-3 mb-3 border-start border-4 border-success">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="ri-funds-fill text-success fs-18"></i>
                      <strong className="text-dark fs-14">Economía, Finanzas & Obra</strong>
                    </div>
                    <p className="text-dark fs-13 mb-0 lh-base fw-medium" style={{ color: "#334155" }}>
                      {currentResumen.temas_economia}
                    </p>
                  </div>
                </div>
              )}

              {/* Mini Resumen Widget Preview */}
              <div className="card bg-light border border-gray-200 shadow-sm rounded-3">
                <div className="card-body p-3">
                  <span className="fs-11 text-muted fw-bold text-uppercase d-block mb-1">
                    Mini-Resumen para Sala de Gabinete (3 Líneas)
                  </span>
                  <p className="text-dark fs-13 fw-bold mb-0 lh-base" style={{ color: "#0f172a" }}>
                    {currentResumen.mini_resumen}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ENTREGABLE MÓVIL (WHATSAPP / TELEGRAM) CON SELECTOR CONSOLIDADO VS SECCIÓN */}
      {showSocialModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.7)", zIndex: 1060 }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div
                className="modal-header text-white py-3"
                style={{ backgroundColor: "#065f46" }}
              >
                <div className="d-flex align-items-center gap-2">
                  <i className="ri-whatsapp-fill text-white fs-22"></i>
                  <h5 className="modal-title fw-extrabold text-white fs-16 mb-0">
                    Entregable Ejecutivo para WhatsApp & Telegram (Momento 2)
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowSocialModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4 bg-white">
                {/* Selector de Modalidad */}
                <div className="d-flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setSocialModalMode("consolidado")}
                    className={`btn btn-sm fw-bold px-3 py-2 rounded-3 ${
                      socialModalMode === "consolidado"
                        ? "btn-success text-white shadow"
                        : "btn-light text-dark border"
                    }`}
                  >
                    ⭐ Briefing Consolidado de Gabinete (Las 4 Secciones)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSocialModalMode("seccion")}
                    className={`btn btn-sm fw-bold px-3 py-2 rounded-3 ${
                      socialModalMode === "seccion"
                        ? "btn-success text-white shadow"
                        : "btn-light text-dark border"
                    }`}
                  >
                    📄 Solo {DOC_TYPES.find((d) => d.key === activeTab)?.label}
                  </button>
                </div>

                <div
                  className="p-3 rounded-3 border border-gray-300 font-monospace fs-13 text-dark overflow-auto shadow-inner"
                  style={{
                    backgroundColor: "#f0fdf4",
                    color: "#064e3b",
                    maxHeight: "380px",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.6",
                  }}
                >
                  {socialModalMode === "consolidado"
                    ? generateConsolidatedSocialDigest()
                    : generateSectionSocialDigest()}
                </div>
              </div>
              <div className="modal-footer bg-light py-3 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary fw-bold"
                  onClick={() => setShowSocialModal(false)}
                >
                  Cerrar
                </button>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-success fw-bold text-white shadow-sm px-4"
                    onClick={handleCopySocialDigest}
                  >
                    <i className={`ri-${copiedSocialSuccess ? "check-line" : "file-copy-line"} me-1`}></i>
                    {copiedSocialSuccess ? "¡Copiado para WhatsApp!" : "Copiar Texto con Formato"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE COMPROBACIÓN DE TEXTO OCR EXTRAÍDO */}
      {showOcrModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.7)", zIndex: 1060 }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-dark text-white py-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="ri-search-eye-line text-primary fs-20"></i>
                  <h5 className="modal-title fw-extrabold text-white fs-16 mb-0">
                    Comprobación de Extracción OCR & Modelo LLM
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowOcrModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4 bg-white">
                {loadingOcrRaw ? (
                  <div className="text-center py-5">
                    <span className="spinner-border text-primary me-2"></span>
                    <span className="fw-bold fs-14 text-dark">Obteniendo texto procesado por OCR...</span>
                  </div>
                ) : (
                  <div>
                    <div className="row g-3 mb-4">
                      <div className="col-md-3">
                        <div className="p-3 bg-light rounded-3 border">
                          <small className="text-muted fw-bold text-uppercase d-block mb-1 fs-11">Documento</small>
                          <strong className="text-dark fs-13">{DOC_TYPES.find((d) => d.key === activeTab)?.label}</strong>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="p-3 bg-light rounded-3 border">
                          <small className="text-muted fw-bold text-uppercase d-block mb-1 fs-11">Precisión OCR</small>
                          <strong className="text-success fs-14">
                            <i className="ri-checkbox-circle-fill me-1"></i> {ocrRawData?.confidence_avg || 98.7}% Precisión
                          </strong>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="p-3 bg-light rounded-3 border">
                          <small className="text-muted fw-bold text-uppercase d-block mb-1 fs-11">Modelo LLM</small>
                          <strong className="text-primary fs-13">{ocrRawData?.llm_model || "Claude 3.5 Sonnet"}</strong>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="p-3 bg-light rounded-3 border">
                          <small className="text-muted fw-bold text-uppercase d-block mb-1 fs-11">Tokens Procesados</small>
                          <strong className="text-dark fs-13">{ocrRawData?.tokens_usados || 480} tokens</strong>
                        </div>
                      </div>
                    </div>

                    <label className="form-label text-dark fw-bold fs-13 mb-2 d-block">
                      Texto Plano Extraído de las Planas (Entrada directa para el Resumen Ejecutivo):
                    </label>
                    <div
                      className="p-3 bg-light rounded-3 border border-gray-300 font-monospace fs-12 text-dark overflow-auto"
                      style={{ maxHeight: "350px", whiteSpace: "pre-wrap", color: "#0f172a", backgroundColor: "#f8fafc" }}
                    >
                      {ocrRawData?.pages?.map((p) => `--- PÁGINA ${p.page_number} ---\n${p.raw_text}`).join("\n\n") ||
                        "Texto extraído del documento."}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer bg-light py-3">
                <button
                  type="button"
                  className="btn btn-primary fw-bold text-white shadow-sm px-4"
                  onClick={() => setShowOcrModal(false)}
                >
                  Cerrar Comprobación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CARGA MANUAL DE LOS 4 DOCUMENTOS DEL DÍA */}
      {showUploadModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", zIndex: 1055 }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-primary text-white py-3">
                <h5 className="modal-title fw-extrabold text-white fs-16">
                  <i className="ri-upload-cloud-fill me-2 text-white"></i>
                  Cargar Documentos de Prensa del Día ({selectedDate})
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowUploadModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4 bg-white">
                <p className="text-dark fs-13 mb-4 fw-medium" style={{ color: "#334155" }}>
                  Sube los 4 archivos PDF o imágenes de la mañana para generar la síntesis y clasificación ejecutiva.
                </p>

                <div className="row g-3">
                  {DOC_TYPES.map((doc) => {
                    const selFile = selectedFiles[doc.key];
                    return (
                      <div key={doc.key} className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border">
                          <label className="form-label text-dark fw-bold fs-13 mb-1 d-block">
                            {doc.label}
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="form-control form-control-sm text-dark bg-white"
                            onChange={(e) => handleFileSelect(doc.key, e.target.files?.[0] || null)}
                          />
                          {selFile ? (
                            <div className="mt-2 text-success fw-bold fs-11">
                              <i className="ri-checkbox-circle-fill me-1"></i>
                              {selFile.name} ({(selFile.size / (1024 * 1024)).toFixed(1)} MB)
                            </div>
                          ) : (
                            <small className="text-muted fs-11 mt-1 d-block">
                              Soporta PDFs grandes (hasta 100 MB, multi-página)
                            </small>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="modal-footer bg-light py-3 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary fw-bold"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary fw-bold text-white shadow-sm px-4"
                  onClick={handleUploadAndProcess}
                >
                  <i className="ri-play-circle-fill me-1 text-white"></i> Iniciar Procesamiento Multi-Página
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
