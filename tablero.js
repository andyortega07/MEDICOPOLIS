/* ==============================================
   tablero.js — Dados, fichas, construcciones,
   tooltips educativos y lógica de turno
============================================== */

/* ── CARAS DE DADO ── */
const FACES = ['⚀','⚁','⚂','⚃','⚄','⚅'];

/* ══════════════════════════════════════════════
   DATOS EDUCATIVOS Y DE JUEGO POR CASILLA
   Cada casilla tiene:
   - icon, name, cat, action ('pay'|'earn'|'free'|'lose')
   - amount (para mostrar)
   - edu: texto educativo clínico
   - game: mecánica de juego
   - stat: dato estadístico impactante
══════════════════════════════════════════════ */
const SQUARE_DATA = {
  0: {
    icon: '🏁', name: 'SALIDA', cat: 'Casilla Especial',
    action: 'earn', amount: '$200',
    edu: 'La prevención primaria en salud es como pasar por SALIDA: cada vuelta es una oportunidad de reforzar hábitos saludables. La OMS estima que el 80% de las enfermedades crónicas se pueden prevenir con intervenciones tempranas.',
    game: 'Cada vez que pasas o caes en SALIDA, cobras $200 del banco. Es tu ingreso base por cada ronda completa.',
    stat: '80% de las ECNT son prevenibles con dieta, ejercicio y no fumar.'
  },
  1: {
    icon: '🩺', name: 'Hipertensión Arterial', cat: 'Cardiología · C-1',
    action: 'pay', amount: '$60',
    edu: 'La hipertensión arterial (HTA) se define como PAS ≥140 mmHg y/o PAD ≥90 mmHg. Es el principal factor de riesgo cardiovascular modificable. Actúa dañando silenciosamente vasos sanguíneos, corazón, riñones y retina. El 90-95% corresponde a HTA esencial (sin causa identificable). El tratamiento incluye IECA, ARA II, calcioantagonistas y diuréticos tiazídicos.',
    game: 'Casilla de propiedad Cardiología. Si no tiene dueño puedes comprarla. Si tiene dueño, pagas renta aumentada si tiene Consultorios, Clínicas u Hospital.',
    stat: '1 de cada 3 adultos tiene hipertensión arterial en el mundo.'
  },
  2: {
    icon: '💚', name: 'Tarjeta Salud', cat: 'Casilla Especial',
    action: 'earn', amount: '$50–$100',
    edu: 'Las conductas protectoras de salud —actividad física, dieta mediterránea, no fumar, control de estrés— reducen el riesgo cardiovascular hasta un 80%. Cada hábito positivo suma puntos de salud en la vida real, igual que esta tarjeta suma dinero en el juego.',
    game: 'Toma la primera tarjeta del mazo Salud y aplica su beneficio. Cobra entre $50 y $100 según la tarjeta. Acumula tarjetas: al reunir 3, construyes un Consultorio gratis. Con 5 T.Salud en el mismo turno avanzas 3 casillas extra.',
    stat: 'Acumular hábitos saludables reduce la mortalidad por ECNT en un 50%.'
  },
  3: {
    icon: '🥗', name: 'Alimentación Saludable', cat: 'Nutrición · N-1',
    action: 'pay', amount: '$35',
    edu: 'Una dieta saludable debe incluir: ≥5 porciones diarias de frutas y verduras, granos enteros, proteína magra y grasas insaturadas. La dieta mediterránea reduce en 30% el riesgo de eventos cardiovasculares. En enfermería, la valoración nutricional (IMC, perímetro abdominal, albumina sérica) es esencial en el ingreso hospitalario.',
    game: 'Casilla de propiedad Nutrición. Al poseer todo el grupo N puedes construir Consultorios. La renta base es $35; con Hospital puede superar $175.',
    stat: 'Una dieta inadecuada causa el 11 millones de muertes anuales a nivel mundial.'
  },
  4: {
    icon: '⚖️', name: 'Obesidad', cat: 'Nutrición · N-2',
    action: 'pay', amount: '$50',
    edu: 'La obesidad se clasifica por IMC: Sobrepeso IMC 25-29.9 kg/m², Obesidad grado I 30-34.9, II 35-39.9, III ≥40 (mórbida). El perímetro abdominal >88 cm en mujeres y >102 cm en hombres indica riesgo cardiometabólico. Comorbilidades: DM2, HTA, dislipidemia, apnea del sueño, esteatohepatitis. Tratamiento: cambio de estilo de vida, farmacológico, bariátrico.',
    game: 'Casilla Nutrición de precio medio. Los jugadores con más propiedades Nutrición pueden cobrar renta mayor aquí. Si se hipoteca, el dueño no cobra.',
    stat: 'El 13% de los adultos mundiales tiene obesidad; duplicó su prevalencia desde 1980.'
  },
  5: {
    icon: '🩻', name: 'Consulta Médica', cat: 'Casilla Especial · Pago Fijo',
    action: 'pay', amount: '$30',
    edu: 'La consulta médica preventiva es clave en la detección temprana de ECNT. El examen físico sistemático incluye: signos vitales, IMC, glucemia en ayunas, perfil lipídico y PA. En enfermería, el rol en la consulta abarca la toma de signos vitales, educación al paciente y seguimiento del cumplimiento terapéutico.',
    game: 'Casilla de pago fijo: siempre pagas $30 al banco sin importar a quién pertenezca. Representa el costo basal de atención médica preventiva.',
    stat: 'Un control preventivo anual puede detectar el 70% de las ECNT en etapa temprana.'
  },
  6: {
    icon: '🩸', name: 'Diabetes Tipo 2', cat: 'Diabetes · D-1',
    action: 'pay', amount: '$60',
    edu: 'La DM2 se caracteriza por resistencia a insulina e hiperglucemia crónica. Criterios diagnósticos ADA: glucemia en ayunas ≥126 mg/dL, HbA1c ≥6.5%, glucemia 2h post-PTOG ≥200 mg/dL. Las complicaciones crónicas son micro (retinopatía, nefropatía, neuropatía) y macrovasculares (IAM, ACV). El pilar del tratamiento es el cambio de estilo de vida más metformina.',
    game: 'Casilla Diabetes de primer precio. Propiedad rentable a largo plazo si construyes. Con Hospital la renta sube a $300.',
    stat: '537 millones de personas viven con diabetes en el mundo (IDF, 2021).'
  },
  7: {
    icon: '💔', name: 'Infarto Agudo de Miocardio', cat: 'Cardiología · C-2',
    action: 'pay', amount: '$150',
    edu: 'El IAM ocurre por oclusión de una arteria coronaria, generalmente por rotura de placa ateromatosa. La triada diagnóstica: dolor precordial típico, cambios en ECG (elevación ST en STEMI) y elevación de troponinas. El protocolo de enfermería incluye: O₂ si SatO₂ <90%, AAS 300mg, monitorización continua, acceso IV y preparación para cateterismo. La ventana de reperfusión es <120 min (puerta-balón).',
    game: 'Casilla de alto valor en Cardiología. Pagar $150 simula el alto costo del tratamiento del IAM. Muy rentable para el dueño con edificaciones.',
    stat: 'El IAM es la principal causa de muerte en el mundo; ocurre uno cada 40 segundos en EE.UU.'
  },
  8: {
    icon: '⚠️', name: 'Tarjeta Riesgo', cat: 'Casilla Especial',
    action: 'pay', amount: '$50–$100',
    edu: 'Los factores de riesgo cardiovascular modificables incluyen: tabaquismo, HTA, dislipidemia, DM, obesidad, sedentarismo y dieta inadecuada. La escala Framingham estima el riesgo de evento cardiovascular a 10 años. En enfermería, la educación en modificación de factores de riesgo es una intervención NIC prioritaria.',
    game: 'Toma la primera tarjeta del mazo Riesgo y aplica la penalidad. Pagas entre $50 y $100 al banco. Con 3 T.Riesgo acumuladas en el mismo turno, pierdes un turno adicional. Con 5 T.Riesgo vas directo a UCI.',
    stat: 'Eliminar solo el tabaquismo reduce el riesgo cardiovascular en un 50% al año de abstinencia.'
  },
  9: {
    icon: '🫁', name: 'EPOC', cat: 'Pulmonar · R-1',
    action: 'pay', amount: '$90',
    edu: 'La Enfermedad Pulmonar Obstructiva Crónica se caracteriza por obstrucción irreversible del flujo aéreo (VEF1/CVF <0.70 post-broncodilatador). Estadios GOLD I-IV según VEF1%. El tabaquismo causa el 85-90% de los casos. El manejo incluye: abandono del tabaco (único que modifica la historia natural), BDCA, BDLA, corticoides inhalados en estadios avanzados, rehabilitación pulmonar y O₂ domiciliario si PaO₂ <55 mmHg.',
    game: 'Primera casilla Pulmonar. Pagar $90 representa el alto costo sanitario del EPOC. Propiedad de nivel medio-alto.',
    stat: 'El EPOC afecta a 480 millones de personas; es la 3ª causa de muerte mundial.'
  },
  10: {
    icon: '🏥', name: 'Visita al Hospital', cat: 'Casilla Especial',
    action: 'free', amount: 'GRATIS',
    edu: 'El hospital es el escenario de prácticas clínicas para el estudiante de enfermería. La visita sin ingreso refleja la importancia de la atención ambulatoria y la continuidad asistencial. Un sistema de salud eficiente prioriza la atención primaria para evitar hospitalizaciones innecesarias.',
    game: 'Si caes aquí, simplemente estás de visita. No pagas nada. Solo vas a UCI si la carta o una penalidad te envían. La casilla de visita y la de UCI están en el mismo espacio físico, pero tienen diferente efecto.',
    stat: 'El 75% de los ingresos hospitalarios por ECNT son prevenibles con manejo ambulatorio adecuado.'
  },
  11: {
    icon: '😮‍💨', name: 'Asma Bronquial', cat: 'Pulmonar · R-2',
    action: 'pay', amount: '$70',
    edu: 'El asma es una enfermedad inflamatoria crónica de la vía aérea con hiperreactividad bronquial reversible. El diagnóstico es clínico + espirométrico (reversibilidad ≥12% con broncodilatador). Clasificación GINA: controlada, parcialmente controlada, no controlada. El tratamiento escalonado incluye: SABA como rescate, corticoides inhalados de mantenimiento, LABA, antileucotrienos y terapia biológica (anti-IgE, anti-IL5) en asma grave.',
    game: 'Casilla Pulmonar de precio moderado. Pagas $70 al dueño o al banco si no tiene propietario.',
    stat: '339 millones de personas padecen asma; es la ECNT más frecuente en niños.'
  },
  12: {
    icon: '📊', name: 'Glucemia y Control Metabólico', cat: 'Diabetes · D-2',
    action: 'pay', amount: '$40',
    edu: 'La glucemia es la concentración de glucosa en sangre. Valores de referencia: ayunas 70-99 mg/dL (normal), 100-125 mg/dL (prediabetes), ≥126 mg/dL (DM). La HbA1c refleja el control glucémico de los últimos 3 meses; objetivo terapéutico <7% en la mayoría de pacientes. La hiperglucemia sostenida produce glucosilación de proteínas tisulares causando las complicaciones crónicas de la DM.',
    game: 'Casilla Diabetes de menor precio. Buena inversión inicial para la categoría. Con Hotel la rentabilidad es alta en relación a su costo de compra.',
    stat: 'La HbA1c por encima de 9% triplica el riesgo de complicaciones microvasculares.'
  },
  13: {
    icon: '💚', name: 'Tarjeta Salud', cat: 'Casilla Especial',
    action: 'earn', amount: '$50–$100',
    edu: 'La adherencia terapéutica es un determinante clave del control de las ECNT. Solo el 50% de los pacientes con enfermedades crónicas cumple el tratamiento a largo plazo. Las intervenciones de enfermería para mejorar la adherencia incluyen: educación personalizada, simplificación del régimen, recordatorios y seguimiento telefónico.',
    game: 'Segunda casilla Tarjeta Salud del tablero. Igual que sq2: cobra $50-$100. Acumula estas tarjetas para desbloquear construcciones.',
    stat: 'Mejorar la adherencia terapéutica tendría mayor impacto que cualquier avance farmacológico.'
  },
  14: {
    icon: '🔬', name: 'Detección Temprana del Cáncer', cat: 'Oncología · O-1',
    action: 'pay', amount: '$120',
    edu: 'La detección temprana del cáncer (cribado/screening) reduce la mortalidad al identificar la enfermedad en estadios tratables. Programas clave: mamografía (ca. mama, mujeres 50-74a), Papanicolaou/VPH (ca. cérvix), colonoscopia (ca. colorrectal >50a), PSA (ca. próstata), esputo/TAC de baja dosis (ca. pulmón en fumadores). La sensibilidad y especificidad definen la calidad del test de cribado.',
    game: 'Primera casilla Oncología. Precio medio-alto. El cáncer representado como propiedad cara simboliza su alto costo social y económico.',
    stat: 'El diagnóstico en estadio I mejora la supervivencia a 5 años del cáncer de colon del 10% al 90%.'
  },
  15: {
    icon: '🛡️', name: 'Seguro Médico', cat: 'Casilla Especial · Beneficio',
    action: 'earn', amount: '$100',
    edu: 'Los sistemas de seguro médico son fundamentales para garantizar el acceso universal a la salud. La cobertura de medicamentos para ECNT reduce la mortalidad en poblaciones vulnerables. En Ecuador, el IESS y el MSP ofrecen cobertura para tratamiento de diabetes, HTA y cáncer. La enfermería comunitaria facilita el acceso a estos servicios.',
    game: 'Casilla especial de beneficio: cobras $100 del banco siempre que caigas aquí. No tiene propietario y no se puede comprar. Representa el beneficio del sistema de salud.',
    stat: 'El acceso a seguro médico reduce la mortalidad por ECNT hasta en un 40% en países de bajos ingresos.'
  },
  16: {
    icon: '🏃', name: 'Actividad Física y Ejercicio', cat: 'Cardiología · C-3',
    action: 'pay', amount: '$80',
    edu: 'La OMS recomienda ≥150 min/semana de actividad física moderada o ≥75 min de intensa para adultos. El ejercicio aeróbico reduce la PA sistólica 5-8 mmHg, los triglicéridos 20-30% y la glucemia en ayunas 10-15 mg/dL. Los MET (equivalentes metabólicos) cuantifican la intensidad: caminar rápido = 3.5 MET, correr = 8 MET. En pacientes post-IAM, la rehabilitación cardíaca con ejercicio reduce la mortalidad 26%.',
    game: 'Casilla Cardiología de precio moderado. Curiosamente, el ejercicio "cuesta" en el juego pero protege la salud. Con todas las propiedades Cardio construidas, la renta aquí es muy alta.',
    stat: 'La inactividad física causa 3.2 millones de muertes anuales y cuesta al sistema sanitario billones.'
  },
  17: {
    icon: '🥑', name: 'Dieta Saludable', cat: 'Nutrición · N-3',
    action: 'pay', amount: '$60',
    edu: 'La dieta DASH (Dietary Approaches to Stop Hypertension) reduce la PA sistólica hasta 11 mmHg. Rica en frutas, verduras, lácteos bajos en grasa, granos integrales; baja en sodio (<2300 mg/día), grasas saturadas y azúcares añadidos. Los AGO-3 (pescado azul, linaza, nueces) reducen triglicéridos 20-30% y tienen efecto antiinflamatorio. La reducción de sodio disminuye el riesgo de ACV en 23%.',
    game: 'Casilla Nutrición de precio medio. Pagas $60 al dueño. Combinarla con las otras propiedades Nutrición potencia mucho las rentas.',
    stat: 'La dieta mediterránea reduce el riesgo de diabetes tipo 2 en un 23% y de enfermedades cardiovasculares en un 30%.'
  },
  18: {
    icon: '⚠️', name: 'Tarjeta Riesgo', cat: 'Casilla Especial',
    action: 'pay', amount: '$50–$100',
    edu: 'El estrés crónico activa el eje hipotalámico-hipofisario-adrenal elevando cortisol, lo que aumenta la PA, la glucemia y la inflamación sistémica. El síndrome de burnout se asocia a mayor incidencia de HTA, DM2 y depresión. Técnicas de manejo: mindfulness, ejercicio, técnicas de respiración y apoyo psicosocial son intervenciones de enfermería basadas en evidencia.',
    game: 'Segunda Tarjeta Riesgo del tablero. Penalidad $50-$100. Recuerda acumular tus tarjetas: 3 en un turno = turno perdido adicional; 5 = vas a UCI.',
    stat: 'El estrés crónico aumenta en un 27% el riesgo de infarto de miocardio.'
  },
  19: {
    icon: '💊', name: 'Tratamiento Oncológico', cat: 'Oncología · O-2',
    action: 'pay', amount: '$300',
    edu: 'El tratamiento del cáncer incluye cirugía, radioterapia, quimioterapia, terapia dirigida e inmunoterapia. La quimioterapia afecta células de rápida división causando efectos adversos: mucositis, neutropenia febril, náuseas, alopecia y neuropatía periférica. El rol de enfermería oncológica incluye: administración segura de citostáticos, manejo de vías centrales, control de efectos adversos y cuidado paliativo. La escala ECOG valora la capacidad funcional del paciente oncológico.',
    game: 'Casilla Oncología de máximo precio ($300). La más cara de las propiedades de la columna izquierda. Su alto costo refleja el precio real del tratamiento oncológico.',
    stat: 'El costo promedio del tratamiento de cáncer avanzado supera los $150,000 USD por paciente al año en EE.UU.'
  },
  20: {
    icon: '🚨', name: 'UCI — Unidad de Cuidados Intensivos', cat: 'Casilla Especial',
    action: 'lose', amount: '2 TURNOS',
    edu: 'La UCI es la unidad de mayor complejidad hospitalaria. Los criterios de ingreso incluyen: fallo multiorgánico, shock séptico, IAM complicado, ACV hemorrágico, cetoacidosis diabética grave. Las escalas de gravedad más usadas son APACHE II, SOFA y Glasgow. El rol de enfermería en UCI incluye: monitorización continua (FC, PA, SatO₂, capnografía), manejo de ventilación mecánica, cuidados de CVC y prevención de infecciones asociadas a dispositivos (NAVM, bacteriemia por CVC).',
    game: 'La casilla más temida. Pierdes 2 turnos o pagas $150 para salir en tu próximo turno. Si sacas dobles en tu turno en UCI, puedes salir gratis. Una Tarjeta Salud especial también permite salir.',
    stat: 'La mortalidad en UCI oscila entre 10% y 50% según el diagnóstico; el manejo de enfermería reduce las complicaciones hasta un 30%.'
  },
  21: {
    icon: '🥕', name: 'Vitaminas y Micronutrientes', cat: 'Nutrición · N-4',
    action: 'pay', amount: '$45',
    edu: 'Las vitaminas son micronutrientes esenciales que el organismo no puede sintetizar en cantidades suficientes. Vitaminas liposolubles (A, D, E, K) se almacenan en tejido adiposo; hidrosolubles (C, complejo B) no se almacenan y deben ingerirse diariamente. La vitamina D es clave en metabolismo óseo, función inmune y prevención de enfermedades crónicas. La deficiencia de vitamina B12 causa anemia megaloblástica y neuropatía. En el adulto mayor, la suplementación con calcio+vitamina D reduce fracturas un 15%.',
    game: 'Casilla Nutrición en la fila superior. Precio medio. Al poseer N-3, N-4 y N-5 juntos, la renta se triplica.',
    stat: 'El 42% de los adultos en EE.UU. tiene deficiencia de vitamina D; en Ecuador se estima un 60% en zonas andinas.'
  },
  22: {
    icon: '🧬', name: 'Prevención del Cáncer', cat: 'Oncología · O-3',
    action: 'pay', amount: '$100',
    edu: 'La prevención primaria del cáncer aborda los factores de riesgo modificables: tabaquismo (30% de todos los cánceres), alcohol (12%), obesidad (5-10%), infecciones (VPH, H. pylori, VHB/VHC), radiación UV y contaminantes ambientales. La prevención secundaria incluye el cribado. Las vacunas contra VPH (Gardasil 9) previenen el 90% de los cánceres de cérvix. El tamoxifeno reduce el riesgo de ca. mama hormonosensible en mujeres de alto riesgo.',
    game: 'Casilla Oncología de precio moderado. Buena inversión para completar el grupo O y empezar a construir.',
    stat: 'La vacunación contra VPH podría eliminar el cáncer de cérvix como problema de salud pública antes de 2100.'
  },
  23: {
    icon: '🧾', name: 'Examen de Salud Preventivo', cat: 'Casilla Especial · Pago Fijo',
    action: 'pay', amount: '$25',
    edu: 'El examen de salud preventivo o chequeo médico anual permite detectar ECNT en fase subclínica. Incluye: anamnesis, examen físico completo, glucemia en ayunas, perfil lipídico, función renal y hepática, hemograma, orina completa, ECG en >40 años y valoración del riesgo cardiovascular. En enfermería, el triaje y la captación activa de pacientes asintomáticos con factores de riesgo son intervenciones de alto impacto poblacional.',
    game: 'Pago fijo de $25 al banco. No tiene propietario. El costo más bajo del tablero, simbolizando que la prevención es barata comparada con el tratamiento.',
    stat: 'Cada $1 invertido en prevención ahorra $14 en costos de tratamiento de ECNT.'
  },
  24: {
    icon: '💉', name: 'Insulinoterapia', cat: 'Diabetes · D-3',
    action: 'pay', amount: '$80',
    edu: 'La insulina es la hormona anabólica principal, producida por las células β del páncreas. Tipos de insulina: ultrarrápida (lispro, aspart, glulisina, acción en 15 min), rápida (regular, 30-60 min), intermedia (NPH, 2-4h) y larga duración (glargina, detemir, degludec, acción 20-42h). El esquema basal-bolo imita la secreción fisiológica. La hipoglucemia (<70 mg/dL) es la complicación aguda más frecuente; el protocolo de enfermería es: regla 15-15 (15g hidratos de carbono, control a 15 min).',
    game: 'Casilla Diabetes de precio medio. Requería tratamiento en la vida real; en el juego, el dueño "trata" a quien cae y cobra la "consulta".',
    stat: 'El 25% de los diabéticos tipo 2 requerirán insulina en algún momento de su evolución.'
  },
  25: {
    icon: '🫀', name: 'Dislipidemia y Colesterol', cat: 'Cardiología · C-4',
    action: 'pay', amount: '$90',
    edu: 'La dislipidemia se define como la alteración patológica de los lípidos plasmáticos. Valores ideales: LDL <100 mg/dL (muy alto riesgo <70 mg/dL), HDL >40 mg/dL (H) y >50 mg/dL (M), TG <150 mg/dL, CT <200 mg/dL. Las estatinas son el fármaco de elección; reducen LDL 30-50% y la mortalidad cardiovascular 20-35%. El índice aterogénico (CT/HDL) >5 indica alto riesgo. La hipertrigliceridemia severa (>1000 mg/dL) puede causar pancreatitis aguda.',
    game: 'Cuarta propiedad Cardio de precio alto. Tener las 5 Cardio juntas es muy rentable. Si el dueño tiene Hospital aquí, la renta supera los $450.',
    stat: 'El tratamiento con estatinas reduce el riesgo de primer infarto en un 36% en pacientes de alto riesgo.'
  },
  26: {
    icon: '💚', name: 'Tarjeta Salud', cat: 'Casilla Especial',
    action: 'earn', amount: '$50–$100',
    edu: 'La educación terapéutica al paciente con ECNT es una intervención NIC de alta evidencia. Incluye: automanejo de la enfermedad, reconocimiento de signos de alarma, uso correcto de inhaladores, automonitorización glucémica, cuidado de los pies en el diabético y adherencia al tratamiento. El empoderamiento del paciente reduce hospitalizaciones un 20-30%.',
    game: 'Tercera Tarjeta Salud del tablero (fila superior). Cobra $50-$100. Muy útil si llevas pocas tarjetas Salud acumuladas.',
    stat: 'Los programas de educación a pacientes crónicos reducen las visitas a urgencias en un 25%.'
  },
  27: {
    icon: '🚬', name: 'Tabaquismo y EPOC', cat: 'Pulmonar · R-3',
    action: 'pay', amount: '$85',
    edu: 'El tabaco contiene más de 7000 sustancias tóxicas; la nicotina genera dependencia activando receptores nicotínicos en el SNC. El humo causa inflamación crónica en la vía aérea → destrucción de alvéolos (enfisema) y fibrosis bronquial (bronquitis crónica). El índice paquetes/año (IPA = cigarrillos/día ÷ 20 × años fumando) cuantifica la exposición: IPA >10 = riesgo significativo de EPOC. La vareniclina (Champix) es el tratamiento más eficaz para dejar de fumar (tasa de éxito 44% a 1 año).',
    game: 'Casilla Pulmonar de precio moderado-alto. El tabaquismo "destruye" los pulmones y en el juego destroza tu economía si el dueño tiene edificaciones.',
    stat: 'El tabaco mata a 8 millones de personas al año; el 20% de los fumadores desarrollará EPOC.'
  },
  28: {
    icon: '🔭', name: 'Diagnóstico Oncológico', cat: 'Oncología · O-4',
    action: 'pay', amount: '$180',
    edu: 'El diagnóstico definitivo de cáncer requiere confirmación histopatológica mediante biopsia. El estadiaje TNM (Tumor, Nódulos, Metástasis) determina la extensión y el pronóstico. Las técnicas diagnósticas incluyen: TAC, PET-TAC (detecta metástasis ≥8mm), RMN, gammagrafía ósea y biopsia líquida (ctDNA en sangre). Los marcadores tumorales (PSA, CA-125, CEA, AFP) apoyan el diagnóstico y el seguimiento, no son diagnósticos solos. El rol de enfermería en oncología diagnóstica incluye la preparación del paciente y la gestión de muestras.',
    game: 'Segunda propiedad más cara de Oncología. Precio $180. Si el dueño tiene Hospital en O, la renta puede llegar a $900.',
    stat: 'El PET-TAC detecta metástasis en el 25% de los casos considerados localizados por TAC convencional.'
  },
  29: {
    icon: '⚠️', name: 'Tarjeta Riesgo', cat: 'Casilla Especial',
    action: 'pay', amount: '$50–$100',
    edu: 'El consumo de alcohol aumenta el riesgo de: cirrosis hepática, cardiomiopatía alcohólica, pancreatitis crónica, neuropatía y 7 tipos de cáncer (boca, faringe, laringe, esófago, hígado, colorrectal y mama). No existe cantidad segura de alcohol respecto al riesgo de cáncer. En el contexto clínico, el cuestionario AUDIT detecta consumo perjudicial y dependencia alcohólica.',
    game: 'Tercera Tarjeta Riesgo del tablero (fila superior). Aplica la misma regla: acumula 3 y pierdes un turno extra; 5 y vas a UCI.',
    stat: 'El alcohol es responsable del 5.1% de la carga mundial de enfermedades y lesiones.'
  },
  30: {
    icon: '🛡', name: 'Zona Libre', cat: 'Casilla Especial',
    action: 'free', amount: 'DESCANSAS',
    edu: 'La Zona Libre representa la resiliencia en salud: la capacidad de recuperarse de situaciones adversas. En medicina preventiva, la "zona libre" equivale a los períodos de remisión o control estable de una ECNT, donde el paciente no genera gastos sanitarios agudos. La adherencia al tratamiento es lo que mantiene a los pacientes en su propia zona libre.',
    game: 'Descansas sin pagar nada. Si caes exactamente aquí (no enviado por tarjeta), solo descansas. Esta casilla actúa como refugio temporal en el tablero.',
    stat: 'El 60% de los pacientes con DM2 bien controlados permanecen libres de complicaciones por más de 10 años.'
  },
  31: {
    icon: '🧬', name: 'Resistencia a la Insulina', cat: 'Diabetes · D-4',
    action: 'pay', amount: '$90',
    edu: 'La resistencia a la insulina (RI) es el paso fisiopatológico previo a la DM2. El tejido adiposo visceral produce adipocinas proinflamatorias (TNF-α, IL-6, resistina) que interfieren con la señalización de insulina en músculo e hígado. El HOMA-IR (glucosa en ayunas × insulina / 405) evalúa la RI; valor normal <2.5. El síndrome metabólico (obesidad central + HTA + dislipidemia + hiperglucemia) multiplica ×5 el riesgo de DM2. Intervención: reducción del 7% del peso corporal previene el 58% de los casos de DM2.',
    game: 'Cuarta casilla Diabetes. Precio $90. Al poseer D-1 a D-4, el grupo completo permite construir y las rentas se disparan.',
    stat: 'El 88 millones de adultos en EE.UU. tienen prediabetes; el 70% desarrollará DM2 sin intervención.'
  },
  32: {
    icon: '🍔', name: 'Alimentos Ultraprocesados', cat: 'Nutrición · N-5',
    action: 'pay', amount: '$55',
    edu: 'La clasificación NOVA categoriza los alimentos por grado de procesamiento industrial. Los ultraprocesados (Grupo 4) contienen aditivos para maximizar palatabilidad y vida útil: emulsionantes, colorantes, saborizantes artificiales, edulcorantes y conservantes. Su consumo elevado se asocia a: obesidad, DM2, HTA, dislipidemia, síndrome metabólico y mayor riesgo de cáncer colorrectal. Contienen alta densidad energética, sodio (>600mg/100g), azúcares añadidos y grasas trans.',
    game: 'Quinta propiedad Nutrición. Precio $55. Completar todas las N desbloquea el grupo para construir y maximizar rentas.',
    stat: 'Los países con mayor consumo de ultraprocesados tienen tasas de obesidad 3 veces mayores que los de menor consumo.'
  },
  33: {
    icon: '🧪', name: 'Análisis Clínicos de Laboratorio', cat: 'Casilla Especial · Pago Fijo',
    action: 'pay', amount: '$90',
    edu: 'El laboratorio clínico es la herramienta diagnóstica más utilizada en medicina. Parámetros clave en ECNT: HbA1c (control DM), perfil lipídico (riesgo CV), creatinina + TFG estimada (función renal), microalbuminuria (daño renal precoz en DM/HTA), PCR-us (inflamación sistémica), BNP/NT-proBNP (insuficiencia cardíaca). El pre-analítico (ayunas, hemólisis, transporte) afecta hasta el 70% de los errores de laboratorio.',
    game: 'Pago fijo de $90 al banco. Más caro que la Consulta (sq5) y el Examen (sq23), reflejando que los análisis especializados tienen mayor costo. No tiene propietario.',
    stat: 'El laboratorio clínico interviene en el 70% de las decisiones diagnósticas y terapéuticas en medicina.'
  },
  34: {
    icon: '🧠', name: 'Accidente Cerebrovascular (ACV)', cat: 'Cardiología · C-5',
    action: 'pay', amount: '$180',
    edu: 'El ACV es la segunda causa de muerte y primera de discapacidad en el mundo. Tipos: isquémico (85%, tromboembólico) y hemorrágico (15%). La escala NIHSS cuantifica el déficit neurológico. La escala FAST (Face, Arms, Speech, Time) permite reconocimiento precoz. En isquémico, la trombólisis IV con rt-PA está indicada <4.5h del inicio; la trombectomía mecánica hasta 24h. Complicaciones de enfermería: prevención de aspiración, úlceras por presión, TVP y contracturas. La rehabilitación multidisciplinar debe iniciarse <24-48h del ingreso.',
    game: 'Casilla más cara de Cardiología ($180). Junto con C-2 (Infarto) son las dos propiedades más costosas del grupo rojo.',
    stat: 'Cada 40 segundos ocurre un ACV en EE.UU.; el 25% de los supervivientes tendrá un segundo evento en 5 años.'
  },
  35: {
    icon: '💚', name: 'Tarjeta Salud', cat: 'Casilla Especial',
    action: 'earn', amount: '$50–$100',
    edu: 'La actividad física regular modifica favorablemente todos los factores de riesgo cardiovascular: reduce la PA 5-7 mmHg, aumenta el HDL 5-10%, reduce los TG 20-30%, mejora la sensibilidad a insulina y contribuye al control del peso. El ejercicio de resistencia (pesas) mejora la masa muscular y el metabolismo basal, fundamental en el manejo de la obesidad y la diabetes tipo 2.',
    game: 'Cuarta Tarjeta Salud del tablero (columna derecha). Sigue acumulando para llegar a 3 y construir Consultorio.',
    stat: '150 minutos semanales de ejercicio moderado reducen la mortalidad por cualquier causa en un 33%.'
  },
  36: {
    icon: '🌡️', name: 'Fibrosis Pulmonar Idiopática', cat: 'Pulmonar · R-4',
    action: 'pay', amount: '$180',
    edu: 'La fibrosis pulmonar idiopática (FPI) es una enfermedad progresiva e irreversible del parénquima pulmonar. Se caracteriza por la acumulación anormal de tejido fibroso que destruye la arquitectura alveolar. La TC de alta resolución muestra patrón UIP (usual interstitial pneumonia). La espirometría revela patrón restrictivo (CVF <80% y VEF1/CVF >0.70). El pronóstico es malo: mediana de supervivencia 3-5 años. Los antifibróticos (pirfenidona, nintedanib) reducen la progresión. El trasplante pulmonar es la única opción curativa.',
    game: 'Casilla Pulmonar más cara ($180). Equivale al Hospital en tratamiento. Es la R-4, la más cara del grupo respiratorio.',
    stat: 'La FPI tiene una supervivencia media de 3-5 años; peor que muchos tipos de cáncer.'
  },
  37: {
    icon: '🧫', name: 'Biología Molecular del Cáncer', cat: 'Oncología · O-5',
    action: 'pay', amount: '$180',
    edu: 'El cáncer es una enfermedad genética adquirida. Los oncogenes (RAS, HER2, BRAF) aceleran la proliferación celular cuando se activan. Los genes supresores de tumores (p53, BRCA1/2, RB) frenan el ciclo celular cuando funcionan; su pérdida descontrola la proliferación. Las terapias dirigidas (imatinib en LMC con BCR-ABL, trastuzumab en HER2+, vemurafenib en BRAF V600E) atacan específicamente estas alteraciones moleculares con menor toxicidad que la quimioterapia convencional.',
    game: 'Quinta y última casilla Oncología ($180). Junto con O-2 y O-4 son las más caras del grupo. Poseerlas todas es devastador para los rivales.',
    stat: 'Las terapias dirigidas han aumentado la supervivencia media del melanoma metastásico de 9 meses a más de 5 años.'
  },
  38: {
    icon: '⚠️', name: 'Tarjeta Riesgo', cat: 'Casilla Especial',
    action: 'pay', amount: '$50–$100',
    edu: 'La obesidad abdominal o visceral (CC >88cm en mujeres, >102cm en hombres) es más peligrosa que la subcutánea. El tejido adiposo visceral es metabólicamente activo: produce angiotensinógeno (→HTA), VLDL (→dislipidemia), PCR y fibrinógeno (→inflamación y trombosis) e inhibidor del activador de plasminógeno (→riesgo trombótico). El síndrome metabólico con obesidad central multiplica por 5 el riesgo cardiovascular.',
    game: 'Cuarta Tarjeta Riesgo del tablero (columna derecha). Mismas reglas de acumulación: cuidado con llegar a 5.',
    stat: 'La obesidad abdominal aumenta el riesgo de síndrome metabólico en un 500% respecto a la obesidad periférica.'
  },
  39: {
    icon: '💧', name: 'Hidratación y Función Renal', cat: 'Nutrición · N-6',
    action: 'pay', amount: '$65',
    edu: 'La ingesta adecuada de agua es esencial para la función renal, termorregulación, transporte de nutrientes y eliminación de toxinas. La recomendación es 35 ml/kg/día. La deshidratación crónica es un factor de riesgo para litiasis renal, infección urinaria y deterioro renal. En pacientes con ICC o ERC se debe restringir líquidos. La valoración del balance hídrico (ingresos vs. egresos) es una intervención básica de enfermería. Los electrolitos (Na, K, Cl) regulan el volumen extracelular y son marcadores de hidratación.',
    game: 'Última casilla antes de volver a SALIDA. Precio $65. Propiedad Nutrición. Con Hotel N, esta casilla cierra el círculo de rentas del grupo.',
    stat: 'Una ingesta diaria de agua de 2L reduce el riesgo de litiasis renal recurrente en un 50%.'
  }
};

/* ══════════════════════════════════════════════
   MAPA DE CASILLAS (centros en SVG 900×900)
══════════════════════════════════════════════ */
const SQUARES = [
  { cx: 843, cy: 843 }, // 0 SALIDA
  { cx: 750, cy: 843 }, { cx: 675, cy: 843 }, { cx: 600, cy: 843 },
  { cx: 525, cy: 843 }, { cx: 450, cy: 843 }, { cx: 375, cy: 843 },
  { cx: 300, cy: 843 }, { cx: 225, cy: 843 }, { cx: 150, cy: 843 },
  { cx: 57,  cy: 843 }, // 10 VISITA
  { cx: 57,  cy: 750 }, { cx: 57,  cy: 675 }, { cx: 57,  cy: 600 },
  { cx: 57,  cy: 525 }, { cx: 57,  cy: 450 }, { cx: 57,  cy: 375 },
  { cx: 57,  cy: 300 }, { cx: 57,  cy: 225 }, { cx: 57,  cy: 150 },
  { cx: 57,  cy: 57  }, // 20 UCI
  { cx: 150, cy: 57  }, { cx: 225, cy: 57  }, { cx: 300, cy: 57  },
  { cx: 375, cy: 57  }, { cx: 450, cy: 57  }, { cx: 525, cy: 57  },
  { cx: 600, cy: 57  }, { cx: 675, cy: 57  }, { cx: 750, cy: 57  },
  { cx: 843, cy: 57  }, // 30 ZONA LIBRE
  { cx: 843, cy: 150 }, { cx: 843, cy: 225 }, { cx: 843, cy: 300 },
  { cx: 843, cy: 375 }, { cx: 843, cy: 450 }, { cx: 843, cy: 525 },
  { cx: 843, cy: 600 }, { cx: 843, cy: 675 }, { cx: 843, cy: 750 },
];

const TOTAL = SQUARES.length; // 40

/* ── ESTADO DEL JUEGO ── */
const state = {
  turn:      0,
  positions: [0, 0, 0],
  money:     [1500, 1500, 1500],
  props:     [0, 0, 0],          // número de propiedades compradas
  // Tarjetas acumuladas POR TURNO (reset al cambiar turno)
  tSaludTurn:  [0, 0, 0],        // tarjetas salud acumuladas en el turno
  tRiesgoTurn: [0, 0, 0],
  // Construcciones totales
  consultorios: [0, 0, 0],
  clinicas:     [0, 0, 0],
  hospitales:   [0, 0, 0],
  rolling:      false,
  uciTurns:    [0, 0, 0],        // turnos restantes en UCI
};

const NAMES   = ['Jugador 1', 'Jugador 2', 'Jugador 3'];
const TOKENS  = ['🧑', '👩', '👦'];
const COLORS  = ['#C0392B', '#1A5276', '#1E8449'];
const OFFSETS = [
  { dx: -12, dy:  12 },
  { dx:  12, dy: -12 },
  { dx:  14, dy:  14 },
];

/* ── CASILLAS ESPECIALES ── */
const SALUD_SQ  = [2, 13, 26, 35];
const RIESGO_SQ = [8, 18, 29, 38];
const PROPERTY_SQ = [1,3,4,6,7,9,11,12,14,16,17,19,21,22,24,25,27,28,31,32,34,36,37,39];
// Mitad GANAN (propiedades pares del array), mitad PAGAN
// Regla: propiedades con índice par en PROPERTY_SQ = cobrar; índice impar = pagar al banco
// Simplificado: casillas impares del tablero = pagar; pares = cobrar (excepto especiales)

const RENT = {
  1:60, 3:35, 4:50, 6:60, 7:150, 9:90,
  11:70, 12:40, 14:120, 16:80, 17:60, 19:300,
  21:45, 22:100, 24:80, 25:90, 27:85, 28:180,
  31:90, 32:55, 34:180, 36:180, 37:180, 39:65,
};
const PAY_FIXED = { 5:30, 23:25, 33:90 };
const EARN_FIXED = { 15:100 };

/* ─── BONUS DE CONSTRUCCIONES ─── */
function getRentMultiplier(playerIdx) {
  const c  = state.consultorios[playerIdx];
  const cl = state.clinicas[playerIdx];
  const h  = state.hospitales[playerIdx];
  if (h > 0) return 5;
  if (cl >= 4) return 4;
  if (cl >= 2) return 3;
  if (cl >= 1) return 2;
  if (c > 0)   return 1.5;
  return 1;
}

/* ── UTILIDADES DOM ── */
function $(id) { return document.getElementById(id); }

function addLog(text, cls = '') {
  const log = $('gameLog');
  const p   = document.createElement('p');
  p.className = 'log-entry ' + cls;
  p.textContent = text;
  log.prepend(p);
  while (log.children.length > 40) log.removeChild(log.lastChild);
}

function updateMoneyUI() {
  state.money.forEach((m, i) => {
    $('p' + i + 'money').textContent = '$' + Math.max(0, m).toLocaleString();
    $('p' + i + 'props').textContent = `Props: ${state.props[i]}`;
  });
}

function updateBuildUI() {
  const p = state.turn;
  $('bConsult0').textContent = `J${p+1}: ${state.consultorios[p]}`;
  $('bClinic0').textContent  = `J${p+1}: ${state.clinicas[p]}`;
  $('bHosp0').textContent    = `J${p+1}: ${state.hospitales[p]}`;
  $('tSalud0').textContent   = state.tSaludTurn[p];
  $('tRiesgo0').textContent  = state.tRiesgoTurn[p];
}

function updateTurnUI() {
  for (let i = 0; i < 3; i++) {
    const card = $('p' + i + 'card');
    const ind  = $('p' + i + 'turn');
    if (i === state.turn) {
      card.classList.add('active-turn');
      ind.classList.remove('hidden');
    } else {
      card.classList.remove('active-turn');
      ind.classList.add('hidden');
    }
  }
  updateBuildUI();
}

/* ── POSICIÓN SVG DE UNA FICHA ── */
function getPawnPos(playerIdx) {
  const sq  = SQUARES[state.positions[playerIdx]];
  const off = OFFSETS[playerIdx];
  return { cx: sq.cx + off.dx, cy: sq.cy + off.dy };
}

/* ── MOVER FICHA EN EL SVG ── */
function movePawnSvg(playerIdx) {
  const pos    = getPawnPos(playerIdx);
  const circle = $('pawn' + playerIdx);
  const text   = $('pawn' + playerIdx + 't');
  circle.classList.remove('pawn-moving');
  text.classList.remove('pawn-moving');
  void circle.offsetWidth;
  circle.classList.add('pawn-moving');
  text.classList.add('pawn-moving');
  circle.setAttribute('cx', pos.cx);
  circle.setAttribute('cy', pos.cy);
  text.setAttribute('x', pos.cx);
  text.setAttribute('y', pos.cy + 6);
  setTimeout(() => {
    circle.classList.remove('pawn-moving');
    text.classList.remove('pawn-moving');
  }, 450);
}

function initPawns() {
  for (let i = 0; i < 3; i++) movePawnSvg(i);
}

/* ── DADO ── */
function dieFace(n) { return FACES[n - 1]; }

function animateDie(elId, finalFace) {
  const el = $(elId);
  let count = 0;
  el.classList.add('rolling');
  const iv = setInterval(() => {
    el.textContent = FACES[Math.floor(Math.random() * 6)];
    count++;
    if (count >= 10) {
      clearInterval(iv);
      el.textContent = finalFace;
      el.classList.remove('rolling');
    }
  }, 55);
}

/* ══════════════════════════════════════════════
   LÓGICA DE CONSTRUCCIONES
   - 3 Tarjetas Salud acumuladas en turno = +1 Consultorio
   - 3 Consultorios = +1 Clínica (consume los 3 consultorios)
   - 4 Clínicas     = +1 Hospital (consume las 4 clínicas)
   - Penalidades:
     - 3 T.Riesgo en turno = pierde turno adicional
     - 5 T.Riesgo en turno = va a UCI directo
     - 5 T.Salud  en turno = avanza 3 casillas extra
══════════════════════════════════════════════ */
function checkBuildProgress(playerIdx) {
  const salud  = state.tSaludTurn[playerIdx];
  const riesgo = state.tRiesgoTurn[playerIdx];
  let extraMsg = '';

  // 3 T.Salud → construir Consultorio
  if (salud > 0 && salud % 3 === 0) {
    state.consultorios[playerIdx]++;
    addLog(`🏢 ${NAMES[playerIdx]} construye un CONSULTORIO (#${state.consultorios[playerIdx]})`, 'build');
    // 3 Consultorios → Clínica
    if (state.consultorios[playerIdx] >= 3) {
      state.consultorios[playerIdx] -= 3;
      state.clinicas[playerIdx]++;
      addLog(`🏥 ${NAMES[playerIdx]} construye una CLÍNICA (#${state.clinicas[playerIdx]})`, 'build');
      // 4 Clínicas → Hospital
      if (state.clinicas[playerIdx] >= 4) {
        state.clinicas[playerIdx] -= 4;
        state.hospitales[playerIdx]++;
        addLog(`🏨 ¡${NAMES[playerIdx]} construye un HOSPITAL! (#${state.hospitales[playerIdx]})`, 'build');
        addLog(`🏨 La renta de todas sus propiedades es ahora ×5`, 'build');
      }
    }
  }

  // Bonus 5 T.Salud → avanza 3 casillas
  if (salud === 5) {
    extraMsg = 'bonus5salud';
    addLog(`⭐ ¡${NAMES[playerIdx]} tiene 5 Tarjetas Salud! Avanza 3 casillas extra`, 'good');
  }

  // 3 T.Riesgo → pierde turno adicional
  if (riesgo === 3) {
    addLog(`💀 ${NAMES[playerIdx]} acumula 3 Tarjetas Riesgo — pierde un turno adicional`, 'alert');
  }

  // 5 T.Riesgo → UCI directo
  if (riesgo >= 5) {
    state.positions[playerIdx] = 20;
    state.uciTurns[playerIdx]  = 2;
    movePawnSvg(playerIdx);
    addLog(`🚨 ¡${NAMES[playerIdx]} acumula 5 Tarjetas Riesgo — va DIRECTO a UCI!`, 'alert');
  }

  updateBuildUI();
  return extraMsg;
}

/* ── LÓGICA DE CASILLA ── */
function resolveSquare(playerIdx, sq) {
  const p = playerIdx;
  const n = NAMES[p];

  // Pasar por SALIDA ya se maneja en rollDice

  if (sq === 20) {
    state.uciTurns[p] = 2;
    addLog(`🚨 ${n} cae en UCI — pierde 2 turnos o paga $150`, 'alert');
    return;
  }
  if (sq === 10) { addLog(`🏥 ${n} visita el hospital — solo de paseo`, ''); return; }
  if (sq === 30) { addLog(`🛡 ${n} descansa en Zona Libre`, 'good'); return; }

  // Tarjeta Salud
  if (SALUD_SQ.includes(sq)) {
    const bonus = [50, 75, 100][Math.floor(Math.random() * 3)];
    state.money[p] += bonus;
    state.tSaludTurn[p]++;
    addLog(`💚 ${n} saca Tarjeta Salud — cobra $${bonus} (total turno: ${state.tSaludTurn[p]})`, 'good');
    const extra = checkBuildProgress(p);
    if (extra === 'bonus5salud') {
      state.positions[p] = (state.positions[p] + 3) % TOTAL;
      movePawnSvg(p);
      resolveSquare(p, state.positions[p]);
    }
    updateMoneyUI();
    return;
  }

  // Tarjeta Riesgo
  if (RIESGO_SQ.includes(sq)) {
    const fine = [50, 75, 100][Math.floor(Math.random() * 3)];
    state.money[p] -= fine;
    state.tRiesgoTurn[p]++;
    addLog(`⚠️ ${n} saca Tarjeta Riesgo — paga $${fine} (total turno: ${state.tRiesgoTurn[p]})`, 'alert');
    checkBuildProgress(p);
    updateMoneyUI();
    return;
  }

  // Pago fijo (Consulta, Examen, Análisis)
  if (PAY_FIXED[sq] !== undefined) {
    state.money[p] -= PAY_FIXED[sq];
    const d = SQUARE_DATA[sq];
    addLog(`🏦 ${n} cae en ${d ? d.name : 'Pago fijo'} — paga $${PAY_FIXED[sq]}`, '');
    updateMoneyUI();
    return;
  }

  // Cobro fijo (Seguro)
  if (EARN_FIXED[sq] !== undefined) {
    state.money[p] += EARN_FIXED[sq];
    addLog(`💰 ${n} cae en Seguro Médico — cobra $${EARN_FIXED[sq]}`, 'good');
    updateMoneyUI();
    return;
  }

  // Propiedades: paga renta al banco o al dueño
  if (RENT[sq] !== undefined) {
    const base = RENT[sq];
    // Multiplicador según construcciones del jugador activo (simplificado: mejor jugador = mayor renta)
    // Para hacerlo más justo: el propietario (si hubiera sistema de compra) cobraría su propio multiplicador
    // En este sistema simplificado todas las propiedades pertenecen al "banco médico"
    const mult = getRentMultiplier(p);
    const finalRent = Math.round(base * mult);
    state.money[p] -= finalRent;
    state.props[p]++;
    const d = SQUARE_DATA[sq];
    const label = d ? d.name : `Casilla ${sq}`;
    if (mult > 1) {
      addLog(`🏠 ${n} cae en ${label} — paga $${finalRent} (base $${base} ×${mult} por construcciones)`, 'highlight');
    } else {
      addLog(`🏠 ${n} cae en ${label} — paga $${finalRent}`, 'highlight');
    }
    updateMoneyUI();
    return;
  }

  addLog(`📍 ${n} avanza a casilla ${sq}`);
}

/* ── TIRAR DADOS ── */
function rollDice() {
  if (state.rolling) return;

  // Verificar si está en UCI
  if (state.uciTurns[state.turn] > 0) {
    state.uciTurns[state.turn]--;
    addLog(`🚨 ${NAMES[state.turn]} sigue en UCI (turnos restantes: ${state.uciTurns[state.turn]})`, 'alert');
    nextTurn();
    return;
  }

  state.rolling = true;
  const btn = $('rollBtn');
  btn.disabled = true;

  const d1    = Math.floor(Math.random() * 6) + 1;
  const d2    = Math.floor(Math.random() * 6) + 1;
  const total = d1 + d2;

  animateDie('die1', dieFace(d1));
  animateDie('die2', dieFace(d2));

  const result = $('diceResult');
  result.className   = 'dice-result';
  result.textContent = '🎲 Tirando…';

  setTimeout(() => {
    result.className   = 'dice-result big';
    result.textContent = `${NAMES[state.turn]} saca ${d1} + ${d2} = ${total}`;

    const prev = state.positions[state.turn];
    state.positions[state.turn] = (prev + total) % TOTAL;

    // Pasó por SALIDA
    if (state.positions[state.turn] < prev && state.positions[state.turn] !== 0) {
      state.money[state.turn] += 200;
      addLog(`🏁 ${NAMES[state.turn]} pasa por SALIDA — cobra $200`, 'good');
    }

    movePawnSvg(state.turn);
    resolveSquare(state.turn, state.positions[state.turn]);
    updateMoneyUI();

    // Penalización extra: 3 T.Riesgo en turno = salta el siguiente turno
    if (state.tRiesgoTurn[state.turn] === 3) {
      // Avanzar dos turnos
      state.turn = (state.turn + 1) % 3;
      addLog(`⏭ Turno adicional saltado por 3 Tarjetas Riesgo`, 'alert');
    }

    nextTurn();
  }, 680);
}

function nextTurn() {
  // Limpiar tarjetas del turno anterior
  const prev = state.turn;
  state.tSaludTurn[prev]  = 0;
  state.tRiesgoTurn[prev] = 0;

  state.turn = (state.turn + 1) % 3;
  updateTurnUI();
  addLog(`🎯 Turno de ${NAMES[state.turn]}`);

  state.rolling = false;
  const btn = $('rollBtn');
  btn.disabled = false;
}

/* ══════════════════════════════════════════════
   TOOLTIP EDUCATIVO
══════════════════════════════════════════════ */
const tooltip = document.getElementById('squareTip');

// Construir HTML del tooltip
function buildTooltip(sq) {
  const d = SQUARE_DATA[sq];
  if (!d) return '';

  const actionLabel = {
    pay:  `PAGAS ${d.amount}`,
    earn: `COBRAS ${d.amount}`,
    free: d.amount,
    lose: `PIERDES ${d.amount}`,
  }[d.action];

  return `
    <div class="tip-header">
      <span class="tip-icon">${d.icon}</span>
      <div>
        <div class="tip-name">${d.name}</div>
        <div class="tip-cat">${d.cat}</div>
      </div>
    </div>
    <span class="tip-action ${d.action}">${actionLabel}</span>
    <div class="tip-edu">${d.edu}</div>
    <div class="tip-game">⚙️ <strong>En el juego:</strong> ${d.game}</div>
    ${d.stat ? `<div class="tip-stat">📊 <span><strong>Dato clave:</strong> ${d.stat}</span></div>` : ''}
  `;
}

// Posicionar tooltip cerca del cursor sin salirse de la pantalla
function positionTooltip(e) {
  const tip = tooltip;
  const vw  = window.innerWidth;
  const vh  = window.innerHeight;
  const tw  = tip.offsetWidth  || 320;
  const th  = tip.offsetHeight || 280;

  let x = e.clientX + 18;
  let y = e.clientY + 12;

  if (x + tw > vw - 10) x = e.clientX - tw - 14;
  if (y + th > vh - 10) y = e.clientY - th - 10;

  tip.style.left = x + 'px';
  tip.style.top  = y + 'px';
}

// Asignar eventos a todas las casillas con data-sq
document.querySelectorAll('.sq-hover').forEach(el => {
  const sq = parseInt(el.dataset.sq, 10);

  el.addEventListener('mouseenter', (e) => {
    tooltip.innerHTML = buildTooltip(sq);
    if (tooltip.innerHTML.trim()) {
      tooltip.classList.add('visible');
      positionTooltip(e);
    }
  });

  el.addEventListener('mousemove', positionTooltip);

  el.addEventListener('mouseleave', () => {
    tooltip.classList.remove('visible');
  });
});

/* ── INIT ── */
initPawns();
updateTurnUI();
updateMoneyUI();
addLog(`🎮 ¡Juego iniciado! Turno: ${NAMES[state.turn]}`);
addLog(`💡 Pasa el cursor sobre cada casilla para ver información educativa`, 'good');