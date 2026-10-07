/* OBRASST · lo que el ATS y el IPERC continuo del portal toman de la app: las listas, la biblioteca de
   actividades, la base de peligros y el dibujo del ATS «clásico» y del IPERC «Anexo 7» (ats.js, ats-flujo.js,
   iperc.js), para que la hoja que sale en la web sea la misma de la app. Lo arma armar.py. No editar. */
var PAPD = {"req":["Permiso de trabajo","Procedimiento específico","Capacitación específica","Monitoreo de gases","Monitoreo de ruido","MSDS"],"epp":["Botas c/puntera acero","Botas dieléctricas","Botas de jebe","Casco de seguridad","Barbiquejo","Tapones auditivos","Protección auditiva tipo copa","Respirador c/humo","Respirador c/gases","Respirador c/polvo","Guantes de cuero/badana","Guantes dieléctricos","Guantes de neopreno","Guantes de jebe","Lentes de seguridad","Chaleco reflectivo","Uniforme","Arnés 1 LV","Arnés 2 LV c/shock abs.","Arnés 2 LV c/cable acero","Linterna minera","Mandil de cuero","Mangas de cuero / escarpines","Guantes caña larga","Careta de soldador","Uniforme jean","Lentes de oxicorte","Careta de esmerilador","Traje Tyvek","Otros"],"epc":["Barandas rígidas","Conos","Tranqueras","Cintas","Malla naranja","Iluminación","Letreros","Línea de vida","Balizas luminosas","Freno vertical","Bloqueo retráctil","Vigías","Extintor","Protector c/ruido","Protector c/polvo","Malla contra caídas","Paletas Pare/Siga","Otros"],"perm":["Trabajo en caliente","Excavación","Trabajo en altura","Izaje de carga","Trabajos eléctricos","Espacios confinados"],"notas":["El ATS deberá incluir el entorno: líneas energizadas, desniveles de suelo, velocidad del viento, baja iluminación, temperatura, etc.","Solo las personas capacitadas y autorizadas como vigías podrán realizar dicha labor.","Antes de iniciar un trabajo siga estos pasos: (1) ¿Qué tengo que hacer? (2) ¿Qué necesito para hacerlo? (3) ¿Cómo lo voy a hacer? (4, 5 y 6) ¿Cómo me podría accidentar? y (7) ¿Qué haré para evitarlo?","El responsable de grupo o supervisor directo no asignará labores de operación de equipos y/o herramientas de poder a personal de categoría inferior a oficial, que además deberá estar capacitado y entrenado en el uso de ese equipo o herramienta."],"oblig":"Cumpliré todas las directivas que me imparta mi empleador para evitar accidentarme o contraer una enfermedad ocupacional.\nNo ejecutaré trabajo alguno:\n· Sin haber elaborado antes el ATS específico de ese trabajo.\n· Si no tengo una orden concreta de mi supervisor inmediato.\n· En labores o cargos de categoría superior a lo que dice mi contrato.\n· Si no cuento con todo el EPP requerido y en buen estado.\n· Si no soy competente para la actividad: no tengo la experiencia, no he sido instruido ni entrenado en ese trabajo.\n· Si el trabajo es de alto riesgo y no están emitidos los permisos que corresponden.\n· Si no cuento con todos los recursos para iniciar mi actividad.\nUsaré correctamente mi EPP en todo momento; no lo alteraré ni lo reemplazaré por otro.\nAnte un accidente o incidente paralizaré el trabajo y lo reportaré de inmediato a mi supervisor.\nNo retiraré ni anularé sistemas, dispositivos o medidas de protección.\nCumpliré los procedimientos de trabajo y el Reglamento Interno de Seguridad y Salud en el Trabajo.\nParalizaré mi actividad ante peligro inminente, y avisaré. Es un derecho que me reconoce la Ley 29783.","reglas":["No se inicia ningún trabajo sin la reunión de inicio de jornada y el ATS firmado por toda la cuadrilla. Si el trabajo es de alto riesgo, además con su permiso emitido.","Cada quien hace solo las tareas para las que fue entrenado y autorizado.","El área se mantiene ordenada, señalizada y limpia. Los residuos se segregan; se evitan los derrames.","No se permanece debajo de una carga suspendida ni en el recorrido de una carga, ni bajo zonas con riesgo de caída de objetos.","No se usa ningún equipo fuera del criterio de diseño o de la especificación del fabricante.","No se usan andamios ni equipos que no hayan sido inspeccionados y autorizados (tarjeta verde).","Antes de intervenir una línea con energía —eléctrica, hidráulica, neumática o mecánica— se bloquea y se etiqueta.","No se conduce, opera ni interviene equipo móvil sin autorización. No se usa el celular mientras se opera o se conduce.","No se retiran ni anulan dispositivos de protección. El EPP se usa completo y en buen estado.","Los accidentes e incidentes se reportan de inmediato, sin excepción y sin represalia.","No se ingresa al área bajo efectos de alcohol o drogas, ni se introducen a la obra ni al campamento.","Pienso y luego actúo. Si veo un acto riesgoso, le hablo a mi compañero: le digo que puede salir lastimado.","Todo trabajador tiene derecho a negarse a trabajar si las condiciones pueden causarle una lesión grave.","Prepárese física y mentalmente para la tarea. Cumpla las indicaciones médicas y cuide su salud."],"notasRev":["Si se incorpora personal nuevo a la cuadrilla, el jefe de grupo o supervisor le comunicará los riesgos de cada tarea y lo hará firmar. Si falta espacio, se anexa otra hoja.","Ninguna labor puede realizarse sin ATS.","El ATS es una orden escrita específica. El incumplimiento del ATS que derive en lesión al trabajador no constituye accidente de trabajo según el D.S. 003-98-SA, art. 2, inciso 2.3, literal c."],"tipos":{"mec":"Mecánico","loc":"Locativo","qui":"Químico","fis":"Físico","erg":"Ergonómico","ele":"Eléctrico","bio":"Biológico","psi":"Psicosocial","otr":"Otros"},"base":[["BIO-001","bio","Agentes Biológicos (Virus, Bacterias, Hongos, parásitos)","Exposición a agentes biológicos","Enfermedades virales, infecciosas o parasitarias"],["BIO-002","bio","Animales / Insectos - Vectores","Mordeduras/Picadura de animales y/o insectos","Lesiones de piel, Envenenamiento"],["BIO-003","bio","Plantas","Exposición cutánea e ingestión de sustancias dañinas","Intoxicación, envenenamiento, lesiones en la piel, heridas"],["BIO-004","bio","COVID-19 (SARS-CoV-2 )","Exposición al virus SARS-CoV-2","Sensación de alza térmica o fiebre, tos, estornudos, dolor de garganta, pérdida del gusto y/o del olfato y dificultad para respirar"],["ELE-001","ele","Líneas eléctricas/Puntos energizados en Baja Tensión","Descarga/Contacto con energía eléctrica en baja tensión","Shock eléctrico, paro cardio-respiratorio, Quemaduras I, II, III, muerte"],["ELE-002","ele","Líneas eléctricas/Puntos energizados en Media Tensión","Descarga/Contacto con energía eléctrica en media tensión","Shock eléctrico, paro cardio-respiratorio, Quemaduras I, II, III, muerte"],["ELE-003","ele","Líneas eléctricas/Puntos energizados en Alta Tensión","Descarga/Contacto con energía eléctrica en alta tensión","Shock eléctrico, paro cardio-respiratorio, Quemaduras I, II, III, muerte"],["ELE-004","ele","Uso de herramientas eléctricas","Descarga/Contacto con energía eléctrica en baja tensión","Shock eléctrico, paro cardio-respiratorio, Quemaduras I, II, III, muerte"],["ELE-005","ele","Energía eléctrica estática acumulada","Descarga/Contacto con energía eléctrica estática","Shock eléctrico, paro cardio-respiratorio, Quemaduras I, II, III, muerte"],["ELE-006","ele","Empalme de cables","Descarga/Contacto con energía eléctrica","Shock eléctrico, paro cardio-respiratorio, Quemaduras I, II, III"],["ELE-007","ele","Fallas Eléctricas de equipos","Contacto con energía eléctrica/Incendio","Shock eléctrico, paro cardio-respiratorio, Quemaduras I, II, III, muerte"],["ERG-001","erg","Movimientos Repetitivos","Ergonómico por movimientos repetitivos","Cervicalgia, Dorsalgia, Escoliosis, Síndrome de Túnel Carpiano, Lumbalgias, Bursitis, Celulitis, Cuello u hombro tensos, Dedo engatillado, Epicondili…"],["ERG-002","erg","Espacio Inadecuado de Trabajo","Ergonómico por espacio inadecuado de trabajo","Distensión, Torsión, Fatiga y DORT (disturbios osteo-musculares relacionados al trabajo)"],["ERG-003","erg","Sobreesfuerzo","Ergonómico por sobreesfuerzo","Distensión, Torsión, Fatiga y DORT (disturbios osteo-musculares relacionados al trabajo)"],["ERG-004","erg","Postura Inadecuada / Forzada","Ergonómico por postura inadecuada / forzada","Distensión, Torsión, Fatiga y DORT (disturbios osteo-musculares relacionados al trabajo)"],["ERG-005","erg","Desplazamiento vertical manual de materiales","Ergonómico por desplazamiento vertical de materiales","Cervicalgia, Dorsalgia, Escoliosis, Fatiga"],["ERG-006","erg","Esfuerzo muscular focalizado","Ergonómico por esfuerzo muscular focalizado","Cervicalgía, Dorsalgía, Escoliosis, Trastornos de huesos y articulaciones, trastornos vasculares, transtornos musculares (sistema nervioso)"],["ERG-007","erg","Exposición a vibraciones de conjunto mano-brazo","Ergonómico por vibraciones mano-brazo","Transtornos de huesos y articulaciones, transtornos vasculares, transtornos musculares (sistema nervioso)"],["ERG-008","erg","Trabajo de pie (y/o andar) más de 4 horas continuas sin descanso","Ergonómico por trabajo de pie","Fatiga, DORT, Parto prematuro"],["FIS-001","fis","Ruido","Exposición a Ruido","Pérdida Auditiva Inducida por Ruido, Hipoacusia o sordera provocada por el ruido en el embrión, infertilidad, prematuridad"],["FIS-002","fis","Vibraciones","Exposición a vibraciones","Afecciones de los músculos, de los tendones, de los huesos, de las articulaciones, de los vasos sanguíneos periféricos o de los nervios periféricos,…"],["FIS-003","fis","Radiaciones No Ionizantes","Exposición a radiaciones no ionizantes","Efecto de la Radiación, Problemas Neurológicos, Lesión de Retina, Enfermedades oftalmológicas a consecuencia de exposiciones a radiaciones ultraviole…"],["FIS-004","fis","Rayos Infrarojos, microondas, ultrasonidos","Exposición a radiaciones infrarrojos, microondas y ultrasonidos","Trabajos con exposición a radiaciones no ionizantes con longitud de onda entre los 100 y 400 nm"],["FIS-005","fis","Frío","Exposición prolongada a temperaturas extremas","Quemaduras, gangrena de extremidad, hipotermia, gripes, molestias en la garganta, faringitis, Alteración en el desarrollo del embrión, feto"],["FIS-006","fis","Calor","Exposición prolongada a temperaturas extremas","Quemaduras, insolación, deshidratación, fatiga, irritación de los ojos, Trastornos vasculares en feto por vasoconstricción"],["FIS-007","fis","Corrientes de aire","Exposición a corrientes de aire","Molestias en la garganta, faringitis, afecciones respiratorias, somnolencia, dolor de cabeza, problemas cutáneos e irritación de los ojos"],["FIS-008","fis","Ventilación inadecuada/deficiente","Exposición a ventilación deficiente","Molestias en la garganta, faringitis, afecciones respiratorias, somnolencia, dolor de cabeza, problemas cutáneos e irritación de los ojos"],["FIS-009","fis","Humedad","Exposición Excesiva a Humedad","Enfermedades Contagiosas o Infecciosas, Dermatosis, Resfriados, Alergias"],["FIS-010","fis","Presión Atmosférica","Exposición a Alta Presión Atmosférica","Aumento de Presión Arterial. Enfermedades provocadas por compresión o descompresión atmosférica"],["FIS-011","fis","Radiaciones Ionizantes","Exposición a radiaciones ionizantes","Quemaduras, Efectos de la Radiación, Lesiones de Retina, Infertilidad, aborto espontáneo, defectos de nacimiento, bajo peso al nacer, afecciones en e…"],["FIS-012","fis","Iluminación Inadecuada/deficiente","Exposición a condiciones de iluminación inadecuadas","Disminución de la agudeza visual, asteopía, miopía, cefalea"],["FIS-013","fis","Detritos","Contacto de detritos","Lesiones a la vista"],["LOC-001","loc","Superficies de trabajo en mal estado","Caída al mismo nivel","Escoriaciones, abrasiones (Lesiones superficiales), Fracturas y Contusiones"],["LOC-002","loc","Uso de escaleras portátiles","Caídas a distinto nivel","Golpes, fracturas, traumatismos"],["LOC-003","loc","Uso de escaleras fijas","Caídas a distinto nivel","Golpes, fracturas, traumatismos"],["LOC-004","loc","Elementos apilados inadecuadamente o mal asegurados","Caída de Objetos","Golpes, politraumatismo, contusiones"],["LOC-005","loc","Falta de orden y limpieza","Caída al mismo nivel","Golpes, politraumatismo, contusiones"],["LOC-006","loc","Uso de andamios y plataformas temporales","Caídas a distinto nivel","Golpes, fracturas muerte"],["LOC-007","loc","Falta de señalización","Caídas al mismo nivel","Golpes, politraumatismo, contusiones"],["LOC-008","loc","Techos debilitados o defectuosos","Caídas a distinto nivel","Golpes, fracturas muerte"],["LOC-009","loc","Material Inflamable","Incendio","Quemaduras, Asfixia, Muerte"],["LOC-010","loc","Material Inflamable; Fluidos a Presión, Equipo Presurizado","Explosión","Quemaduras, Traumatismos, Contusiones, Asfixia, Muerte"],["LOC-011","loc","Uso de escaleras del Erector","Caídas a distinto nivel","Politraumatismo, Contusiones"],["LOC-012","loc","Plataforma de trabajo","Caídas a desnivel y mismo nivel","Golpes, politraumatismo"],["LOC-013","loc","Plataforma de Camión de servicio","Resbalones, caídas","Hematomas, Golpes, fracturas"],["LOC-014","loc","Plataformas en silos y estructuras en Planta Bicomponente","Caídas a distinto nivel","Golpes, politraumatismo"],["LOC-015","loc","Desniveles en el área de trabajo","Caídas a distinto nivel","Golpes, politraumatismo, fractura"],["LOC-016","loc","Áreas con deficiencia de Oxigeno o Gases por encima del Límite máximo permisible","Exposición a deficiencia de oxigeno o gases","Asfixia, Intoxicación"],["LOC-017","loc","Áreas en condiciones Hiperbáricas","Descompresión omitiva","Enfermedades descompresivas"],["LOC-018","loc","Plataforma de equipos","Caídas a distinto nivel","Hematomas, Golpes"],["LOC-019","loc","Trabajos en altura (encima de 1.80 m)","Caídas a distinto nivel","Fractura, Contusiones, Muerte"],["LOC-020","loc","Trabajos en altura en cámara de excavación","Caída de personal","Contusiones, Fracturas,"],["LOC-021","loc","Trabajos en altura (encima de 1.80 m) en cámara de excavación","Caídas a distinto nivel","Fractura, Contusiones, Muerte"],["LOC-022","loc","Superficie en desnivel, excavación, zanja abierta","Caídas a distinto nivel","Golpes , fracturas, muerte"],["MEC-001","mec","Manipulación de objetos y herramientas en altura","Caída de Objetos","Golpes, heridas, politraumatismos, fracturas, muerte"],["MEC-002","mec","Elementos manipulados con grúas/montacargas/tecle eléctrico","Caída de Objetos","Contusión, Aplastamiento (Superficie Cutánea Intacta), Traumatismo, Muerte"],["MEC-003","mec","Transporte de carga","Caída de Objetos","Contusión, Aplastamiento (Superficie Cutánea Intacta), Traumatismo, Fracturas, Muerte"],["MEC-004","mec","Maniobras de Izaje","Caída de Objetos","Golpes, lesiones, aplastamiento por caída de equipos, Muerte"],["MEC-005","mec","Pila de material inestable","Derrumbe/Caída de equipo/caída a distinto nivel/Atrapamiento","Contusión, Aplastamiento (Superficie Cutánea Intacta), Traumatismo, Muerte"],["MEC-006","mec","Tránsito vehicular","Colisión/Atropello/Volcadura","Fractura, Contusiones, Lesiones, Muerte"],["MEC-007","mec","Vías/Pistas en Mal Estado","Colisión/Atropello/Volcadura","Fractura, Contusiones, Lesiones, Muerte"],["MEC-008","mec","Personal de Piso interactuando con equipos móviles","Atropello/Aplastamiento","Fractura, Contusiones, Lesiones, Muerte"],["MEC-009","mec","Maquinas/Objetos en movimiento","Atrapamiento/Contacto con maquinarias u objetos en movimiento","Contusión, heridas politraumatismos, muerte"],["MEC-010","mec","Herramientas neumáticas","Contacto con herramientas neumáticas en movimiento","Heridas, cortes, golpes, fracturas, amputaciones de algún miembro"],["MEC-011","mec","Herramientas neumáticas","Contacto con herramientas neumáticas en movimiento","Heridas, cortes, golpes, fracturas, amputaciones de algún miembro"],["MEC-012","mec","Herramientas para golpear (martillo, combas)","Contacto con herramientas de golpe","Golpes, heridas, politraumatismo, muerte"],["MEC-013","mec","Herramientas/Equipos en mal estado","Atrapamiento/Contacto con herramientas en mal estado","Heridas, cortes, golpes, fracturas, amputaciones de algún miembro"],["MEC-014","mec","Herramientas o maquinarias sin guarda","Atrapamiento/Contacto con herramientas o maquinarias sin guarda","Heridas, cortes, golpes, fracturas, amputaciones de algún miembro"],["MEC-015","mec","Herramientas o maquinarias sin guarda","Atrapamiento/Contacto con herramientas o maquinarias sin guarda","Heridas, cortes, golpes, fracturas, amputaciones de algún miembro"],["MEC-016","mec","Herramientas eléctricas","Atrapamiento/Contacto con herramientas eléctricas","Heridas, cortes, golpes, fracturas, amputaciones de algún miembro"],["MEC-017","mec","Herramientas portátiles eléctricas punzo cortantes","Contacto con herramientas portátiles eléctricas punzo cortantes","Heridas, cortes, golpes, fracturas, amputaciones de algún miembro"],["MEC-018","mec","Herramientas portátiles eléctricas punzo cortantes","Contacto con herramientas portátiles eléctricas punzo cortantes","Heridas, cortes, golpes, fracturas, amputaciones de algún miembro"],["MEC-019","mec","Objetos o superficies punzo cortantes","Contacto con objetos o superficies punzo contantes","Heridas punzo cortantes, heridas contusas"],["MEC-020","mec","Objetos o superficies punzo cortantes","Contacto con objetos o superficies punzo contantes","Heridas punzo cortantes, heridas contusas"],["MEC-021","mec","Fallas Mecánicas en vehículos y equipos","Colisión/Atropello/Volcadura","Golpes, heridas, politraumatismo, muerte"],["MEC-022","mec","Superficies/Material a elevadas/bajas temperaturas","Contacto con superficies/material a elevadas/bajas temperaturas","Quemaduras"],["MEC-023","mec","Fallas Mecánicas en vehículos y equipos","Colisión/Atropello/Volcadura","Golpes, heridas, politraumatismo, muerte"],["MEC-024","mec","Estructuras Inestables","Caída de estructuras","Contusión, Aplastamiento (Superficie Cutánea Intacta), Traumatismo, Muerte"],["MEC-025","mec","Pisos resbaladizos/disparejos","Caída al mismo nivel","Golpes, contusiones, traumatismo, muerte"],["MEC-026","mec","Mecanismos Giratorios","Aplastamiento, atrapamiento","Amputaciones, Fracturas"],["MEC-027","mec","Elementos izados con erector de dovelas","Caída de Dovela","Contusión, Aplastamiento"],["MEC-028","mec","Personal de Piso interactuando con alimentador de dovelas","Aplastamiento, atrapamiento","Fractura, Contusiones"],["MEC-029","mec","Personal de piso interactuando con el desplazamiento del erector","Aplastamiento, atrapamiento","Fractura, Contusiones"],["MEC-030","mec","Manipulación de medios mecánicos (carretilla boogie, estoca)","Colisión, Atropello, Volcadura","Fractura, Contusiones"],["MEC-031","mec","Cinta en movimiento","Atrapamiento","Contusión, heridas, amputaciones de algún miembro"],["MEC-032","mec","Elementos Izados con tecle eléctrico y mecánicos en cintas","Aplastamiento, atrapamiento","Fractura, Contusiones"],["MEC-033","mec","Manipulación de herramientas en cinta transportadora","Atrapamiento","Contusión, heridas, amputaciones de algún miembro"],["MEC-034","mec","Rodillos","Atrapamiento","Contusión, heridas"],["MEC-035","mec","Tránsito de volquetes en superficie","Colisión, Atropello","Contusiones, Fracturas, muerte"],["MEC-036","mec","Operación de Excavadora","Aplastamiento, atrapamiento","Contusiones, Fracturas, muerte"],["MEC-037","mec","Transporte de desmonte en volquetes","Caída de material","Politraumatismo, Contusiones, muerte"],["MEC-038","mec","Equipos en movimiento( Volquetes, Camiones, Bombonas, Cisternas, Plataformas, Mixer, Cama baja y otros)","Atropellos, Aplastamiento","Politraumatismo, Contusiones, Fracturas, Golpes, muerte"],["MEC-039","mec","Tecles, polipastos eléctricos y manuales","Caída de carga","Aplastamiento, Politraumatismo, Contusiones"],["MEC-040","mec","Aparejos o accesorios de izaje","Caída de carga","Aplastamiento, Politraumatismo, Contusiones"],["MEC-041","mec","Equipos y Accesorios para Ajuste o Sujeción de carga","Caída de carga","Aplastamiento, Politraumatismo, Contusiones"],["MEC-042","mec","Herramientas manuales, eléctricas, neumáticas u otros","Caída de herramientas","Colpes, Fracturas, Contusiones"],["MEC-043","mec","Elementos izados con grúa de dovelas","Caída de Materiales","Contusión, Aplastamiento, muerte"],["MEC-044","mec","Personal de piso interactuando con el desplazamiento de la grúa de dovelas","Aplastamiento, atrapamiento","Fractura, Contusiones, muerte"],["MEC-045","mec","Transporte de Carga con Traspaleta","Caída de Objetos","Contusión, Aplastamiento"],["MEC-046","mec","Personal de piso interactuando con el desplazamiento de la carga","Aplastamiento, atrapamiento","Fractura, Contusiones"],["MEC-047","mec","Elementos izados con grúa pórtico","Caída de Materiales","Contusión, Aplastamiento, muerte"],["MEC-048","mec","Personal de piso interactuando con el desplazamiento de la grúa pórtico","Aplastamiento, atrapamiento","Fractura, Contusiones, muerte"],["MEC-049","mec","Espátulas, Combas de jebe, Cutter y botellas de aplicación de terokal","Arañones, Golpes, Contacto con terokal, cortes","Contusiones, cortes, irritaciones"],["MEC-050","mec","Válvulas de aire","Golpes","Cortes, Lesiones en la mano"],["MEC-051","mec","Intervención de equipos por mantenimiento","Encendido inintencionado de los equipos en mantenimiento","Cortes, Amputaciones, Aplastamientos, Fracturas"],["MEC-052","mec","Manipulación de Polipastos","Caída de carga","Fracturas, Golpes, Amputaciones"],["MEC-053","mec","Personal interactuando con piezas izadas con tecles o elevadas con gatas hidráulicas","Atrapamiento de extremidades con piezas en movimiento","Fracturas, Golpes, Amputaciones"],["MEC-054","mec","Manipulación de Esmeril de Banco","Proyección directa de partículas, contacto con disco en movimiento","Cortes, lesiones oculares"],["MEC-055","mec","Manipulación de Taladro de engranaje","Contacto con piezas cortantes","Cortes, Incrustaciones"],["MEC-056","mec","Manipulación de Cierra Cinta para metal","Contacto con piezas cortantes","Amputaciones, Cortes, Fracturas"],["MEC-057","mec","Manipulación de Prensa Hidráulica","Atrapamiento con piezas en movimiento","Amputaciones, Fracturas, Golpes"],["MEC-058","mec","Manipulación del Afilador de Brocas","Contacto con piezas cortantes","Amputaciones, Cortes, Fracturas"],["MEC-059","mec","Materiales de carpintería, tablones, paneles o planchas","Sobreesfuerzo, Aplastamiento","Lumbalgia, Cortes, Golpes"],["MEC-060","mec","Manipulación de Radial","Proyección directa de partículas, contacto con disco en movimiento","Amputaciones, Cortes, Fracturas"],["MEC-061","mec","Manipulación de Amoladora","Proyección directa de partículas, contacto con disco en movimiento","Amputaciones, Cortes, Fracturas"],["MEC-062","mec","Manipulación de Rotomartillo","Exposición a las vibraciones","Lesiones osteoarticulares"],["MEC-063","mec","Manipulación de Taladro","Proyección de partículas, contacto eléctrico","Golpes, cortes, quemadura,"],["MEC-064","mec","Picado con Cizallas y martillos hidráulicos para demolición","Caída de Material picado, Proyección de Partículas","Aplastamiento"],["MEC-065","mec","Nudos de alambre","Atrapamiento","Arañones, Heridas, cortes"],["MEC-066","mec","Extensión de tuberías de producción","Tuberías sin despresurizar","Golpes, Fracturas, Muerte"],["MEC-067","mec","Desprendimiento de fragmentos incandescentes","Proyección de material incandescente","Incendios, Quemaduras"],["MEC-068","mec","Operación de Manlift","Atropello, Volcamiento","Contusiones, Fracturas"],["MEC-069","mec","Superficies incandescentes","Exposición a superficies incandescentes","Quemaduras"],["MEC-070","mec","Operación de Montacarga","Atropello, Volcamiento","Contusiones, Fracturas"],["MEC-071","mec","Transporte de carga con montacarga","Caída de Objetos","Contusión, Aplastamiento"],["MEC-072","mec","Elementos izados con grúa puente","Caída de Materiales","Contusión, Aplastamiento"],["MEC-073","mec","Manipulación del Kit de Oxicorte","Fugas de gas comprimido","Quemaduras, Traumatismos, Asfixia, Muerte"],["MEC-074","mec","Operación de Telehandler","Atropello, Volcamiento","Contusiones, Fracturas"],["MEC-075","mec","Transporte de carga con telehandler","Caída de Objetos","Contusión, Aplastamiento, muerte"],["MEC-076","mec","Operación del Camión de Servicio","Atropello, Volcamiento","Contusiones, Fracturas, muerte"],["MEC-077","mec","Elementos izados con grúa de camión de servicio","Caída de Materiales","Contusión, Aplastamiento, muerte"],["MEC-078","mec","Operación de la cesta elevadora del camión de servicio","Caída del persona, Aplastamiento","Contusiones, Fracturas"],["MEC-079","mec","Manipulación de tuberías","No despresurización (purgado) o activación inintencionado de las tuberías","Cortes, Amputaciones, Fracturas,"],["MEC-080","mec","Elementos izados con camión grúa","Caída de Materiales","Contusión, Aplastamiento, muerte"],["MEC-081","mec","Bombeo de bentonita y/o mortero por las líneas (tuberías)","Caída de tubería(s) de traslado de bentonita y/o mortero","Cortes, Fractura, Aplastamiento"],["MEC-082","mec","Fluidos con temperatura elevada","Contacto con fluidos a elevadas temperaturas","Quemaduras de primer, segundo o tercer grado"],["MEC-083","mec","Desprendimiento de fragmentos incandescentes producto de la operación de equipos de soldadura en cámara","Contacto y proyección de partículas incandescentes","Incendio, quemaduras"],["MEC-084","mec","Manipulación de pistola neumática de impacto","Golpes por contacto con herramienta","Contusiones, Fracturas,"],["MEC-085","mec","Falta de aseguramiento de las líneas de mortero y bentonita","Deslizamiento y/o caída de tubería(s) de las líneas de mortero y/o bentonita","Atrapamiento, aplastamiento, Golpes, Fracturas"],["MEC-086","mec","Maquinas/Objetos en movimiento","Atrapamiento/Contacto con maquinarias u objetos en movimiento","Contusión, heridas politraumatismos, muerte"],["MEC-087","mec","Herramientas neumáticas","Contacto con herramientas neumáticas en movimiento","Golpes, heridas, politraumatismo, Fracturas"],["OTR-001","otr","Sismos","Caída al mismo o distinto nivel/colapso de estructuras","Contusión, Aplastamiento (Superficie Cutánea Intacta), Traumatismo, Muerte"],["OTR-002","otr","Manifestación Publica/Toma de Instalaciones","Golpeado o agredido","Contusiones, Lesiones, Muerte"],["OTR-003","otr","Movilización/Desplazamiento de personal","Accidente","Traumatismo, Contusiones, Muerte"],["OTR-004","otr","Exposición a Radiación Solar","Exposición a rayos UV","Cancer a la piel, disipelas, sarpullido, dermatitis, daño a los ojos"],["OTR-005","otr","Condiciones del terreno","Tropezones, resbalones, caídas al mismo nivel","Golpes, heridas, excoriaciones, contusiones"],["OTR-006","otr","Energías peligrosas (mangueras a presión)","Golpes por movimientos intempestivos de mangueras de fluidos","Laceraciones, traumatismos múltiples"],["OTR-007","otr","Transito (Operación del equipo)","Ingreso a la zona de transito de vehículos y/o equipos","Lesiones, traumatismos múltiples"],["OTR-008","otr","Accesorios, Bombas","Golpes, atrapamiento, atricciones","Contusiones, Lesiones, Fractura,mutilaciones"],["OTR-009","otr","Uso de productos quimicos para desinfección del covid 19 (-Hipoclorito de sodio al 0.1%. - Alcohol al 70 %. - Peróxido de hidrogeno al 0.5 %. - Amoni…","Inhalacion de gases o vapores toxicos, corrosivos, irritantes. Quemaduras Explosion por sustancias usadas para la disen…","Daño al sistema nervioso, pulmones, riñones, higado, mucosa irritadas"],["OTR-010","otr","Manipulación de Aditivo","Inhalación de particulas de aditivos, contacto de aditivo con la piel, caida de polvo en los ojos","Irritación a vías respiratorias, dermatitis, irritación de ojos"],["OTR-011","otr","Exposicion de agentes biologicos en baños y comedores","Potencial contacto con microorganismo que pueden dar lugar a enfermedades","Alergias e infecciones"],["OTR-012","otr","Métales (Partículas)","Exposicion a partículas","Incrustación de partículas al cuerpo (lesiones oculares, lesiones dérmicas)"],["OTR-013","otr","Manipulacion de herramientas manuales (escuadra, marcador metalico, martillo, cincel y flexometro)","Golpes por mala manipulación herramientas","Contusiones, laseraciones"],["OTR-014","otr","Manipulacion de estructuras metalicas (angulos, grating, tuberias) Bordes cortantes de las planchas","Golpes Cortes . Atriccionamiento","Contusiones, Fracturas 'Traumatismo Heridas"],["OTR-015","otr","Interacción con herramientas de poder (Motosoldadora)","Contacto directo/indirecto con energias(mecánica y eléctrica) Contacto con bordes cortantes. Proyección del disco de co…","Golpes, Atriccionamiento, laceraciones, Traumatismo, heridas, fracturas, lumbalgia, quemaduras"],["OTR-016","otr","Uso de productos quimicos para desinfección del covid 19 (-Hipoclorito de sodio al 0.1%. - Alcohol al 70 %. - Peróxido de hidrogeno al 0.5 %. - Amoni…","Inhalacion de gases o vapores toxicos, corrosivos, irritantes. Quemaduras Explosion por sustancias usadas para la disen…","Daño al sistema nervioso, pulmones, riñones, higado, mucosa irritadas"],["OTR-017","otr","Factor Psicosocial por la organiacion y condicion del trabajo","Transtorno biologico y social por las condiciones de trabajo","Ansiedad, nerviosismo, fatiga, irritabilidad, estrés"],["OTR-018","otr","Soldadura de partes y componentes de la central de inyeccion (mezclador, ajitador, plataforma)","Contacto con electricidad, contacto con elementos calientes, proyeccion de particulas,Exposicion a rayos UV, inhalacion…","Quemaduras, irritación a los ojos Irritación al sistema respiratorio. Quemaduras, lesiones, perdida material, Cancer"],["OTR-019","otr","Corte y calentado de partes y componentes de la central de inyeccion (mezclador, ajitador, plataforma)","Proyección de partículas, contacto con partículas calientes, luminosidad intensa, incendio, explosión","Irritación a los ojos Proyecccion de particulas al rostro. Quemaduras, lesiones, perdida material"],["OTR-020","otr","Esmerilado de piezas y componentes de la central de inyeccion (mezclador, ajitador, plataforma)","Contacto con disco de corte en rotacion","Cortes, mutilaciones"],["OTR-021","otr","Soldadura de partes y componentes de los equipos de perforación","Contacto con electricidad, contacto con elementos calientes, proyeccion de particulas,Exposicion a rayos UV, inhalacion…","Quemaduras, irritación a los ojos Irritación al sistema respiratorio. Quemaduras, lesiones, perdida material, Cancer"],["OTR-022","otr","Corte y calentado de partes y componentes de los equipos de perforación (oxicorte)","Proyección de partículas, contacto con partículas calientes, luminosidad intensa, incendio, explosión","Irritación a los ojos Proyecccion de particulas al rostro. Quemaduras, lesiones, perdida material"],["OTR-023","otr","Uso de productos quimicos para desinfección del covid 19 (-Hipoclorito de sodio al 0.1%. - Alcohol al 70 %. - Peróxido de hidrogeno al 0.5 %. - Amoni…","Inhalacion de gases o vapores toxicos, corrosivos, irritantes. Quemaduras Explosion por sustancias usadas para la disen…","Daño al sistema nervioso, pulmones, riñones, higado, mucosa irritadas"],["OTR-024","otr","Factor Psicosocial por la organiacion y condicion del trabajo","Transtorno biologico y social por las condiciones de trabajo","Ansiedad, nerviosismo, fatiga, irritabilidad, estrés"],["OTR-025","otr","Manipulación de engrasadoras (grasa)","Golpes, salpicadura a ojos, contaminación a partes del cuerpo con la grasa. Sobre esfuerzo","Heridas, dermatitis, sensibilización de la piel, irritación de ojo, Lumbalgias"],["OTR-026","otr","Energías peligrosas (Energía eléctrica, mecánica.)","Contacto directo/indirecto con energía eléctrica, Mecánica","Electrocución, quemaduras, Cortes, mutilaciones, atrapamiento, muerte"],["OTR-027","otr","Contacto con equipos, piezas o herramientas que se encuentren sucios con aceites o grasas usadas, o generen exposición a sustancias químicas","Exposición a contaminación del cuerpo con productos","Dermatitis a la piel"],["OTR-028","otr","Energía hidráulica. (energía hidráulica)","Salpicaduras, derrames de fluidos, latigazos","Golpes, laceraciones, traumatismos múltiple. fracturas, dermatitis, contaminación del cuerpo"],["OTR-029","otr","Energías peligrosas (electricidad, presion, mecanica, etc)","Liberación descontrolada de energia durante el mantenimiento o en las pruebas con el equipo energizado","Electrocución, quemaduras, lesiones, mutilaciones, muerte"],["OTR-030","otr","Equipo en transito (Perforadoras)","Atropello a personas, colisión con las estructuras, choques con otras unidades","Lesiones, traumatismos múltiples, daño a la propiedad"],["OTR-031","otr","Herramientas de corte","Cortes, proyeccion de partículas a la vista","Lesiones en las manos y ojos , heridas expuestas"],["OTR-032","otr","Accesorios, Bombas","Golpes, atrapamiento, atricciones","Contusiones, Lesiones, Fractura,mutilaciones"],["OTR-033","otr","Manipulación de tuberías","Atrapamiento de manos, golpes","Contusiones, lesiones, fractura"],["OTR-034","otr","Manipulación y traslado de herramientas manuales","Golpes, caidas, caidas al mismo nivel","Contusiones, cortes, heridas"],["OTR-035","otr","Traslado de tuberías","Sobreesfuerzo, dolores musculares","Distensión, Torsión, Fatiga y DORT (disturbios osteo-musculares relacionados al trabajo)"],["OTR-036","otr","Energia Neumatica. (Compresora)","Ruptura de cilindro por presión excesiva (Explosión)","Contuciones, heridas, fracturas, muerte, daños materiales"],["OTR-037","otr","Manipulación de objetos / equipos","Descarga/Contacto con energía eléctrica en baja tensión. Caida de objetos. Contanto con superficies de corte","Quemaduras. Ex coriaciones, Abrasiones (Lesiones Superficial), y Contusiones. Corte. Golpes"],["OTR-038","otr","Manipulación de válvulas de compresora","Golpes por mala manipulación de válvula","Contusiones, Lesiones, Fractura"],["OTR-039","otr","Operación de Compresora","Incendio por sobrecalentamiento","Lesiones, golpes, traumatismos múltiples"],["OTR-040","otr","Traslado de equipos y accesorios","Sobre esfuerzo, dolores musculares","Distensión, Torsión, Fatiga y DORT (disturbios osteo-musculares relacionados al trabajo)"],["OTR-041","otr","Manipulación de objetos / equipos","Sobre esfuerzo por dimensión ex cesiva del objeto, pérdida de visibilidad o agarre del objeto. Caída de Objetos","Distensión muscular, lesión en tendones o ligamentos articulares por sobre esfuerzo. Lumbalgia u otro dolor articular. Fracturas, Contusiones"],["OTR-042","otr","Sobreesfuerzo (Peligros asociados a levantar / manejar objetos manualmente)","Sobre esfuerzo por dimensión ex cesiva del objeto, pérdida de visibilidad o agarre del objeto","Distensión muscular, lesión en tendones o ligamentos articulares por sobre esfuerzo. Lumbalgia u otro dolor articular"],["OTR-043","otr","Sustancias peligrosas","Contacto químico (por vía: cutánea, respiratoria, digestiva y ocular)","Irritación y quemaduras por contacto directo. Intoxicación"],["OTR-044","otr","Aditivo","Inhalación de particulas de aditivos, contacto de aditivo con la piel, caida de polvo en los ojos","Irritación a vías respiratorias, dermatitis, irritación de ojos"],["OTR-045","otr","Polvo de bentonita (Partículas suspendidas)","Exposición a partículas suspendidas","Irritación a vías respiratorias e irritacion a la vista"],["OTR-046","otr","Herramientas y Materiales","Contusiones, cortes, 'Traumatismo","Colocar las manos bajo materiales en movimiento. No protegerse de los bordes cortantes. No identificar puntos de atriccion. Personal no utiliza los E…"],["OTR-047","otr","Plataforma de Trabajo insegura por presencia de lodo de cemento","Resbalones, caídas al mismo nivel, proyección de lechada","Golpes, esguinse"],["OTR-048","otr","Herramientas de poder (Esmeril)","Manipulación del esmeril. Corte por contacto con disco de corte en rotacion","Cortes, mutilaciones, muerte"],["OTR-049","otr","Falla o mala manipulación de acoples de manguera","Contacto con cemento/aditivos, salpicadura a ojos, exposición a golpes por magueras desacopladas Desemplame de manguera…","Dermatitis, irritación de ojos, cortes, contusiones, fracturas Golpe, fractura, mutilación, cortes"],["OTR-050","otr","Métales (Partículas)","Exposicion a partículas","Incrustación de partículas al cuerpo (lesiones oculares, lesiones dérmicas)"],["OTR-051","otr","Manipulacion de herramientas manuales (escuadra, marcador metalico, martillo, cincel y flexometro)","Golpes por mala manipulación herramientas","Contusiones, laseraciones"],["OTR-052","otr","Manipulación de accesorios (Mangueras, balón de nitrogeno, cuadro registrador, etc)","Atrapamiento de manos, golpes por mala manipulación","Golpes, heridas, excoriaciones, contusiones"],["OTR-053","otr","Interacción con herramientas de poder (Motosoldadora)","Contacto directo/indirecto con energias(mecánica y eléctrica) Contacto con bordes cortantes. Proyección del disco de co…","Golpes, Atriccionamiento, laceraciones, Traumatismo, heridas, fracturas, lumbalgia, quemaduras"],["OTR-054","otr","Personal ajeno a labores, exterior de obra","Asalto, vehiculos en movimiento","Golpes, herida por elemento punzocortante, herida por arma de fuego, atropello"],["OTR-055","otr","Cable de izaje","Atrapamiento,","Cortes, fractura, mutilación"],["OTR-056","otr","Distracciones del conductor por uso de medios de telecomunicaciones (celulares y otros equipos)","Exponer a las distracciones del conductor","Atropello a peatones y choque con otro vehículo"],["OTR-057","otr","Contacto con partículas calientes","Incrustacion de particulas al cuerpo, lesiones, perdida material, Incendio, Explosiones","Quemaduras Perdida material. Material"],["OTR-058","otr","Manipulación de tuberías","Atrapamiento de manos","Contusiones, lesiones, fractura"],["OTR-059","otr","Traslado de tuberías","Sobreesfuerzo, dolores musculares","Distensión, Torsión, Fatiga y DORT (disturbios osteo-musculares relacionados al trabajo)"],["OTR-060","otr","Soldadura de partes y componentes de la central de inyeccion (mezclador, ajitador, plataforma)","Contacto con electricidad, contacto con elementos calientes, proyeccion de particulas,Exposicion a rayos UV, inhalacion…","Quemaduras, irritación a los ojos Irritación al sistema respiratorio. Quemaduras, lesiones, perdida material, Cancer"],["OTR-061","otr","Corte y calentado de partes y componentes de la central de inyeccion (mezclador, ajitador, plataforma)","Proyección de partículas, contacto con partículas calientes, luminosidad intensa, incendio, explosión","Irritación a los ojos Proyecccion de particulas al rostro. Quemaduras, lesiones, perdida material"],["OTR-062","otr","Esmerilado de piezas y componentes de la central de inyeccion (mezclador, ajitador, plataforma)","Contacto con disco de corte en rotacion","Cortes, mutilaciones, muerte"],["OTR-063","otr","Soldadura de partes y componentes de los equipos de perforación","Contacto con electricidad, contacto con elementos calientes, proyeccion de particulas,Exposicion a rayos UV, inhalacion…","Quemaduras, irritación a los ojos Irritación al sistema respiratorio. Quemaduras, lesiones, perdida material, Cancer"],["OTR-064","otr","Corte y calentado de partes y componentes de los equipos de perforación","Proyección de partículas, contacto con partículas calientes, luminosidad intensa, incendio, explosión","Irritación a los ojos Proyecccion de particulas al rostro. Quemaduras, lesiones, perdida material"],["OTR-065","otr","Traslado de muestras de concreto","Sobre esfuerzo, dolores musculares","Distensión, Torsión, Fatiga y DORT (disturbios osteo-musculares relacionados al trabajo)"],["OTR-066","otr","Polimero (Partículas suspendidas)","Exposición a partículas suspendidas","Irritación a vías respiratorias Lesion a la vista"],["OTR-067","otr","Productos químicos (pintura, thinner, etc)","Contacto productos quimicos","Inhalacion de productos quimicos, irritación de vias respiratorias, irritación de piel y ojos"],["OTR-068","otr","Sustancias peligrosas","Inhalación de vapores y gases. Manipulación de sustancias químicas. Contacto con hidrocarburos. Contaminación al cuerpo…","Alergias irritación de la vía respiratoria, piel y ojos. Dermatitis a la piel"],["OTR-069","otr","Herramientas manuales (Manipulación de Herramientas/objetos)","Golpeado por mala manipulación de objetos o herramientas","Traumatismo, contusiones, Fracturas, Cortes"],["OTR-070","otr","Partes en movimiento ( pellizcos, atrapamiento)","Atrapamiento de personas por partes en movimiento","Amputaciones"],["OTR-071","otr","Manipulación de engrasadoras (grasa)","Golpes, salpicadura a ojos, contaminación a partes del cuerpo con la grasa. Sobre esfuerzo","Heridas, dermatitis, sensibilización de la piel, irritación de ojo, Lumbalgias"],["OTR-072","otr","Energías peligrosas (Energía eléctrica, mecánica.)","Contacto directo/indirecto con energía eléctrica, Mecánica","Electrocución, quemaduras, Cortes, mutilaciones, atrapamiento, muerte"],["OTR-073","otr","Sobreesfuerzo(Peligros asociados a levantar / manejar objetos manualmente)","Sobresfuerzo carga a brazo de objetos pesados","Distensión, Torsión, Fatiga y DORT (disturbios osteo-musculares relacionados al trabajo)"],["OTR-074","otr","Contacto con equipos, piezas o herramientas que se encuentren sucios con aceites o grasas usadas, o generen exposición a sustancias químicas","Exposición a contaminación del cuerpo con productos","Dermatitis a la piel"],["OTR-075","otr","Energía hidráulica. (energía hidráulica)","Salpicaduras, derrames de fluidos, chacoteos","Golpes, laceraciones, traumatismos múltiple. fracturas, dermatitis, contaminación del cuerpo, muerte"],["OTR-076","otr","Energías peligrosas (electricidad, presion, mecanica, etc)","Liberación descontrolada de energia durante el mantenimiento o en las pruebas con el equipo energizado","Electrocución, quemaduras, lesiones, mutilaciones, muerte"],["OTR-077","otr","Partes móviles","Atrapamientos, Golpes","Contusiones amputaciones, muerte"],["OTR-078","otr","Equipo en transito (Perforadoras)","Atropello a personas, colisión con las estructuras, choques con otras unidades. Volcaduras, aplastamiento de personas p…","Lesiones, traumatismos múltiples, daño a la propiedad, muerte"],["OTR-079","otr","Terreno desnivelado (equipo)","Volcaduras, aplastamiento de personas por volteo de equipo, muerte","Lesiones, traumatismos múltiples"],["OTR-080","otr","Condiciones del terreno","Tropezones, resbalones, caídas al mismo nivel","Golpes, heridas, excoriaciones, contusiones"],["OTR-081","otr","Instalaciones (Estructuras ajenas a la máquina de perforación)","Choques","Daños a la propiedad"],["OTR-082","otr","Partes en movimiento","Atrapamiento de manos","Contusiones, Lesiones, Fractura,mutilaciones"],["OTR-083","otr","Transito (Equipo en Movimiento)","Atropello, aplastamiento, Choques","Traumatismos múltiples, fracturas, lesiones incapacitantes, muerte, daños materiales"],["OTR-084","otr","Equipo (Perforadora)","Volcaduras, aplastamiento de personas por volteo de equipo, muerte, Atrapamientos","Lesiones, traumatismos múltiples, mutilasiones"],["OTR-085","otr","Partes en movimiento","Atrapamiento de partes del cuerpo","Contusiones, Lesiones, Fractura,mutilaciones"],["OTR-086","otr","Manipulación de mangueras hidraulicas","Golpes con mangueras","Laceraciones, traumatismos múltiples"],["OTR-088","otr","Partículas suspendidas (dedritos)","Exposición a partículas suspendidas","Golpes"],["OTR-089","otr","Manipulación de tuberías","Atrapamiento de manos, golpes","Contusiones, lesiones, fractura"],["OTR-090","otr","Embone / desembone de tubería","Golpes con llaves","Golpes, heridas, excoriaciones, contusiones"],["OTR-091","otr","Traslado de tuberías","Sobreesfuerzo, dolores musculares","Distensión, Torsión, Fatiga y DORT (disturbios osteo-musculares relacionados al trabajo)"],["OTR-092","otr","Productos químicos (grasa)","Contacto con producto químico","Reacciones, dermatitis"],["OTR-093","otr","Oscuridad","Falta de iluminación, puntos de sombra en el área de trabajo","Contusiones, cortes, heridas"],["OTR-094","otr","Fatiga y somnolencia","Sueño","Golpes, atricciones choques"],["OTR-095","otr","Energia Neumatica. (Compresora)","Ruptura de cilindro por presión excesiva (Explosión)","Contuciones, heridas, fracturas, muerte, daños materiales"],["OTR-096","otr","Energia Neumatica. (Mangueras)","Proyección de manguera y elementos de sujeción de las mismas","Contuciones, heridas, fracturas"],["OTR-097","otr","Energía Residual (Aire en mangueras y tuberias)","Proyección de manguera y elementos de sujeción de las mismas","Contuciones, heridas, fracturas"],["OTR-098","otr","Uso de aceites y lubricantes","Inhalacion de gases o vapores toxicos, corrosivos, irritantes. Quemaduras. Caida de aceite y7o lubricante sobre el suel…","Daño al sistema nervioso, pulmones, riñones, higado, mucosa irritadas. Derrame de aceite sobre el suelo y agua"],["OTR-099","otr","Manipulación de válvulas de compresora","Golpes por mala manipulación de válvula","Contusiones, Lesiones, Fractura"],["OTR-100","otr","Ruido emitido por la compresora","Exposición al ruido","Daños a la audición (Hipoacusia)"],["OTR-101","otr","Energia Electrica (Manipulación de tableros eléctricos)","Contacto directo/indirecto con energía eléctrica","Electrocución, quemaduras, atrapamiento, muerte,"],["OTR-102","otr","Operación de Compresora","Incendio por sobrecalentamiento","Lesiones, golpes, traumatismos múltiples"],["OTR-103","otr","Traslado de equipos y accesorios","Sobre esfuerzo, dolores musculares","Distensión, Torsión, Fatiga y DORT (disturbios osteo-musculares relacionados al trabajo)"],["OTR-104","otr","Gases Comprimidos (nitrógeno)","Cilindro de gas en mal estado, fuga de nitrogeno, volcadura del balon","Asfixia, quemaduras, aplastamiento"],["OTR-105","otr","Manipulación de accesorios (mangueras)","Atrapamiento de manos, golpes por mala manipulación","Golpes, heridas, excoriaciones, contusiones"],["OTR-106","otr","Condiciones del terreno","Tropezones, resbalones, caídas al mismo nivel","Golpes, heridas, excoriaciones, contusiones"],["OTR-107","otr","Energías peligrosas (eléctrica, neúmatica, mecánica, etc)","Contacto con energías peligrosas","Electrocución, quemaduras"],["OTR-108","otr","Gases Comprimidos (nitrógeno)","Cilindro de gas en mal estado, fuga de nitrogeno","Asfixia, quemaduras"],["OTR-109","otr","Condiciones del terreno (piso humedo)","Resbalones, caídas al mismo nivel","Golpes, heridas, excoriaciones, contusiones"],["OTR-110","otr","Polvo (Partículas suspendidas)","Exposición a partículas suspendidas","Irritación a vías respiratorias"],["OTR-111","otr","Ruido","Daño auditivo","Hipoacusia inducida por ruido"],["OTR-112","otr","Manguera de Obturar a Presion","Rotura de manguera, explosion","Hipoacusia inducida por ruido, lesiones graves"],["OTR-113","otr","Condiciones del terreno","Tropezones, resbalones, caídas al mismo nivel","Golpes, heridas, excoriaciones, contusiones"],["OTR-114","otr","Abastecimiento de bentonita","Sobreesfuerzo, dolores musculares, caidas a desnivle","Distensión, Torsión, Fatiga y DORT (disturbios osteo-musculares relacionados al trabajo)"],["OTR-115","otr","Polvo de bentonita (Partículas suspendidas)","Exposición a partículas suspendidas","Irritación a vías respiratorias e irritacion a la vista"],["OTR-116","otr","Contacto con aditivos","Contacto con cemento/aditivos, salpicadura a ojos","Dermatitis, irritación de ojos"],["OTR-117","otr","Herramientas manuales","Golpes por mala manipulación de herramientas","Contusiones"],["OTR-118","otr","Energías peligrosas","Contacto indirecto con energia eléctrica","Electrocución, quemaduras"],["OTR-119","otr","Partes en movimiento","Atrapamiento de manos","Contusiones, Lesiones, Fractura,mutilaciones"],["OTR-120","otr","Ruido","Daño auditivo","Hipoacusia inducida por ruido"],["OTR-121","otr","Plataforma de Trabajo insegura por presencia de lodo de cemento","Resbalones, caídas al mismo nivel, proyección de lechada","Golpes, esguinse"],["OTR-122","otr","Ergonomia (movimiento repetitivo, postura inadecuada, sobresfuerzo, etc)","Sobresfuerzo cargio de Cemento","Lumbalgia"],["OTR-123","otr","Polvo de cemento","Inhalación de particulas de polvo de cemento, contacto de polvo de cemento con la piel, caida de polvo en los ojos","Irritación a vías respiratorias, dermatitis, irritación de ojos"],["OTR-124","otr","Bombas Accesorios","Golpes, atrapamiento, atricciones","Amputaciones, lesiones graves"],["OTR-125","otr","Falla o mala manipulación de acoples de manguera","Contacto con cemento/aditivos, salpicadura a ojos, exposición a golpes por magueras desacopladas Desemplame de manguera…","Dermatitis, irritación de ojos, cortes, contusiones, fracturas Golpe, fractura, mutilación, cortes, muerte"],["OTR-126","otr","Energías peligrosas (Manguera hidraulica con energia neúmatica)","Latigazo de manguera","Golpe, fractura, lesiones graves,"],["OTR-127","otr","Manipulación de accesorios (Mangueras)","Atrapamiento de manos, golpes por mala manipulación","Contusiones, Lesiones,"],["OTR-128","otr","Condiciones del terreno (piso humedo)","Resbalones, caídas al mismo nivel","Golpes, heridas, excoriaciones, contusiones"],["OTR-129","otr","Herramientas manuales","Golpes por mala manipulación de herramientas manuales","Contusiones"],["OTR-130","otr","Manipulación de accesorios (Mangueras, balón de nitrogeno, cuadro registrador, etc)","Atrapamiento de manos, golpes por mala manipulación","Golpes, heridas, excoriaciones, contusiones"],["OTR-131","otr","Contacto con mezcla (Cemento)","Contacto con cemento/aditivos, salpicadura a ojos","Dermatitis, irritación de ojos"],["OTR-132","otr","Acoples de manguera","Desemplame de manguera con embone","Golpe, fractura, mutilación"],["OTR-133","otr","Carga suspendida","Caida de carga","Golpe, aplastamiento, fractura, lesiones graves, muerte"],["OTR-134","otr","Personal ajeno a labores, exterior de obra","Asalto, vehiculos en movimiento","Golpes, herida por elemento punzocortante, herida por arma de fuego, atropello, muerte"],["OTR-135","otr","Cable de izaje","Atrapamiento,","Cortes, fractura, mutilación"],["OTR-136","otr","Distracciones del conductor por uso de medios de telecomunicaciones (celulares y otros equipos)","Exponer a las distracciones del conductor","Atropello a peatones y choque con otro vehículo"],["OTR-137","otr","Zanja abierto (Panel de excavacion)","Caidas a distinto nivel","Ahogamiento"],["OTR-138","otr","Condiciones del terreno","Tropezones, resbalones, caídas al mismo nivel","Golpes, heridas, excoriaciones, contusiones"],["OTR-139","otr","Manguera de agua a presión","Proyección de agua a presión","Daños a la vista"],["OTR-140","otr","Ruido","Exposición a ruido","Hipoacusia inducida por ruido"],["OTR-141","otr","Radiación Solar","Exposición a rayos UV","Càncer a la piel, disipelas, sarpullido, dermatitis, daño a los ojos"],["OTR-142","otr","Polimero (Partículas suspendidas)","Exposición a partículas suspendidas","Irritación a vías respiratorias Lesion a la vista"],["OTR-143","otr","Manipulación de tuberías","Atrapamiento de manos","Contusiones, lesiones, fractura"],["OTR-144","otr","Traslado de tuberías","Sobreesfuerzo, dolores musculares","Distensión, Torsión, Fatiga y DORT (disturbios osteo-musculares relacionados al trabajo)"],["OTR-145","otr","Equipo (Perforadora)","Volcaduras, aplastamiento de personas por volteo de equipo, muerte, Atrapamientos","Lesiones, traumatismos múltiples, mutilasiones"],["OTR-146","otr","Agua a presión","Proyección de agua a presión","Daños a la vista y piel"],["OTR-147","otr","Partes en movimiento","Atrapamiento de partes del cuerpo","Contusiones, Lesiones, Fractura,mutilaciones"],["OTR-148","otr","Manipulación de mangueras hidraulicas","Golpes con mangueras","Laceraciones, traumatismos múltiples"],["OTR-149","otr","Excavación abierta","Caidas a distinto nivel","Fracturas, contusiones"],["OTR-150","otr","Valva y baya de excavación en movimiento","Aplastamiento/Contacto con maquina u objeto en movimiento","Fracturas, contusiones"],["OTR-151","otr","Manipulación de listones de madera","Atricción de manos","Fracturas, contusiones"],["OTR-152","otr","Traslado de muestras de concreto","Sobre esfuerzo, dolores musculares","Distensión, Torsión, Fatiga y DORT (disturbios osteo-musculares relacionados al trabajo)"],["OTR-153","otr","Ergonomia (movimiento repetitivo, postura inadecuada, sobresfuerzo, etc)","Sobresfuerzo en cargio de materiales","Lumbalgia"],["PSI-001","psi","Condiciones de trabajo: Tipo de trabajo, grado de autonomía, aislamiento, promoción, estilo de dirección, turnicidad, ritmos y jornadas de trabajo","Trastornos Biológicos y Sociales por Condiciones de Trabajo","Ansiedad, Nerviosismo, Fatiga, Irritabilidad, Estrés, Burnout, Mayor frecuencia de partos prematuros, abortos espontáneos, etc"],["PSI-002","psi","Trabajo en Turno Nocturno, Monotonía y/o Repetitividad, Jornada de Trabajo Prolongada","Trastornos Biológicos y Sociales por Jornada de Trabajo Prolongada","Ansiedad, Nerviosismo, Estrés"],["PSI-003","psi","Hostigamiento sexual y/o acoso laboral (Mobbing)","Transtornos biológicos y sociales","Ansiedad, Nerviosismo, Estrés, Partos prematuros, abortos espontáneos"],["QUI-001","qui","Sustancias Químicas, Vapores, Compuestos o productos químicos en general","Contacto de la vista con sustancias o agentes dañinos","Irritación, Conjuntivitis Química, Quemadura"],["QUI-002","qui","Sustancias Químicas, Vapores, Compuestos o productos químicos en general","Contacto de la piel con sustancias o agentes dañinos. (Absorción cutánea)","Dermatitis de contacto, Quemaduras, Envenenamiento"],["QUI-003","qui","Sustancias Químicas, Vapores, Compuestos o productos químicos en general","Inhalación de sustancias o agentes dañinos","Asfixia, Intoxicación, Irritación, Neumoconiosis, problemas del aparato respiratorio, dolencias hepáticas, renales y neurológicas"],["QUI-004","qui","Sustancias Químicas, Vapores, Compuestos o productos químicos en general","Ingestión de sustancias o agentes dañinos","Intoxicación, Neumonía Química, Dolencias hepáticas, renales y neurológicas"],["QUI-005","qui","Polvo (Material Particulado)","Inhalación de polvo (material particulado)","Neumoconiosis, irritación, intoxicación y problemas alérgicos"],["QUI-006","qui","Concreto","Exposición a proyección, derrame y salpicadura de concreto","Irritaciones, Lesiones, quemaduras en los ojos o cuerpo por contacto con el concreto"],["QUI-007","qui","Lodo (Material Liquido)","Exposición al lodo(material liquido)","irritación, alergias"],["QUI-008","qui","Pegamento ( Terokal)","Contacto con la vista, piel, inhalación o ingesta del terokal","Irritación, Conjuntivitis Química, Dermatitis de contacto, Asfixia, Intoxicación, problemas del aparato respiratorio"],["QUI-009","qui","Sigunit 65 PE (Silicato)","Contacto con la vista, piel, inhalación o ingestión","Irritación, Conjuntivitis Química, Dermatitis de contacto, Asfixia, Intoxicación, problemas del aparato respiratorio"],["QUI-010","qui","Productos Químicos asociados a la inyección del Mortero (Silicato, Agente espumante, Concreto)","Contacto con la vista, piel, inhalación o ingestión","Irritación, Conjuntivitis Química, Dermatitis de contacto, Asfixia, Intoxicación, problemas del aparato respiratorio"],["QUI-011","qui","Productos Químicos asociados al mantenimiento mecánico","Contacto con la vista, piel, inhalación o ingestión","Irritación, Conjuntivitis Química, Dermatitis de contacto, Asfixia, Intoxicación, problemas del aparato respiratorio"],["QUI-012","qui","Productos Químicos asociados al tratamiento de agua residual (Acido Regulador, Coagulante, Antiespumante, Floculante)","Contacto con la vista, piel, inhalación o ingestión","Irritación, Conjuntivitis Química, Dermatitis de contacto, Asfixia, Intoxicación, problemas del aparato respiratorio"],["QUI-013","qui","Agua residual","Contacto con la vista, piel, ingestión","Alergia cutánea, Irritación, Conjuntivitis Química, Dermatitis de contacto, Intoxicación"],["QUI-014","qui","Deshechos contaminados en el decantador","Contacto con la vista, piel, ingestión","Alergia cutánea, Irritación, Conjuntivitis Química, Dermatitis de contacto, Intoxicación"],["QUI-015","qui","Productos Químicos asociados a la Producción de Mortero (Retardante, Cemento, Bentonita)","Contacto con la vista, piel, inhalación o ingestión","Irritación, Conjuntivitis Química, Dermatitis de contacto, Asfixia, Intoxicación, problemas del aparato respiratorio"],["QUI-016","qui","Productos Químicos asociados al mantenimiento y limpieza de los tanques","Contacto con la vista, piel, inhalación o ingestión","Irritación, Conjuntivitis Química, Dermatitis de contacto, Asfixia, Intoxicación, problemas del aparato respiratorio"],["QUI-017","qui","Productos Químicos asociados a la instalación de tuberías","Contacto con la vista, piel, inhalación o ingestión","Irritación, Conjuntivitis Química, Dermatitis de contacto, Asfixia, Intoxicación, problemas del aparato respiratorio"],["QUI-018","qui","Sustancias Químicas, Vapores, Compuestos o productos químicos en general","Contacto con sustancias o agentes dañinos","Cancerígeno, mutagénico, peligroso para la salud reproductiva"]],"bib":[{"a":"Ingreso al área de trabajo","f":[{"p":"Área desordenada y materiales acumulados","r":"Tropezones, cortes","c":"Golpes, contusiones","m":"Transitar por zona delimitada, señalizada y ordenada"},{"p":"Superficies de trabajo en mal estado","r":"Caídas al mismo nivel","c":"Abrasiones, escoriaciones","m":"Transitar por superficie estable"},{"p":"Movimiento de vehículos","r":"Atropello","c":"Contusiones, fracturas, fatalidad","m":"Contacto visual con el operador y su vigía; transitar por zona delimitada y señalizada"},{"p":"Ascenso y descenso por escalera de andamio","r":"Caída a distinto nivel","c":"Golpes, fracturas, fatalidad","m":"Uso de los tres puntos de apoyo"},{"p":"Uso de escalera común","r":"Caída a distinto nivel","c":"Golpes, fracturas, fatalidad","m":"Uso de los tres puntos de apoyo; escalera amarrada y en ángulo 4:1"},{"p":"Clima adverso","r":"Exposición a temperaturas extremas","c":"Enfermedad respiratoria","m":"Uso de chompa polar, cortavientos, bebidas calientes"},{"p":"Radiación solar","r":"Exposición a rayos UV","c":"Cáncer de piel, sarpullido, dermatitis","m":"Bloqueador solar, puntos de hidratación, lentes oscuros, punto de sombra"},{"p":"Carga suspendida","r":"Caída de objetos","c":"Fractura, fatalidad","m":"No exponerse a la línea de fuego, no caminar bajo la carga, comunicarse con el rigger"},{"p":"Agentes biológicos","r":"Exposición a agentes biológicos","c":"Fiebre, dolor de cabeza, secreción nasal","m":"Reporte de síntomas respiratorios a línea de mando, lavado de manos"}]},{"a":"Verificación de herramientas, equipos y piezas","f":[{"p":"Manipulación de herramientas","r":"Contacto con herramientas","c":"Cortes y golpes","m":"Check list de herramientas manuales, cinta del mes, herramienta sin improvisar"},{"p":"Manipulación de piezas de andamio","r":"Contacto con piezas de andamio","c":"Golpes, fracturas","m":"Personal capacitado como andamiero, no cargar más de 25 kg"}]},{"a":"Acarreo de materiales y herramientas","f":[{"p":"Manipulación manual de carga","r":"Sobreesfuerzo","c":"Síndrome del túnel carpiano, escoliosis, lumbalgia","m":"Buenas posturas, uso de hombreras, uso de buggie"},{"p":"Traslado vertical de materiales","r":"Caída de objetos","c":"Fracturas, contusiones","m":"Uso de driza, apoyo de 2 personas, no acumular carga"}]},{"a":"Armado y desarmado de andamios","f":[{"p":"Manipulación de estructura de andamio","r":"Contacto con piezas de andamio","c":"Golpes, fracturas","m":"Personal capacitado como andamiero, espacio liberado"},{"p":"Traslado vertical de estructura de andamio","r":"Sobreesfuerzo","c":"Cervicalgia, dorsalgia, escoliosis, fatiga","m":"Manejo entre 2 o más personas, posturas adecuadas"},{"p":"Traslado vertical de estructura de andamio","r":"Caída de objetos","c":"Golpes, heridas, politraumatismos, fracturas, muerte","m":"Delimitar radio de caída y señalizar, uso de driza 3/8\""},{"p":"Trabajo en altura (por encima de 1.80 m)","r":"Caída a distinto nivel","c":"Fracturas, contusiones, muerte","m":"Arnés de cuerpo entero con sistema anticaídas anclado por encima del hombro"},{"p":"Uso de andamio","r":"Colapso de la estructura","c":"Fatalidad, contusiones, fracturas","m":"Uso de cáncamos, nivelación del terreno, inspección del andamio y tarjeta verde"},{"p":"Manipulación de herramientas manuales en altura","r":"Caída de objetos","c":"Golpes, heridas, politraumatismos, fracturas, muerte","m":"Rodapiés, driza para herramientas, delimitar y señalizar abajo"},{"p":"Manipulación de herramientas manuales","r":"Contacto con herramientas","c":"Cortes, golpes y hemorragias","m":"Personal capacitado, uso de EPP básico"},{"p":"Trabajos en áreas próximas","r":"Interacción con trabajos próximos","c":"Contusiones, heridas","m":"Delimitación y señalización del área, coordinación entre cuadrillas"}]},{"a":"Fin de la jornada","f":[{"p":"Área desordenada","r":"Caídas al mismo nivel","c":"Golpes, lesiones","m":"Orden y limpieza antes de retirarse"},{"p":"Material mal apilado","r":"Caída de objetos","c":"Contusiones, heridas","m":"Acomodar materiales asegurando estabilidad"},{"p":"Pisos mojados","r":"Caídas al mismo nivel","c":"Golpes, lesiones","m":"Secar el área de trabajo y señalizar"},{"p":"Residuos sólidos","r":"Contaminación ambiental","c":"Generación de RRSS","m":"Segregar los residuos y eliminarlos en el contenedor que corresponde"}]}],"niv":{"A":{"t":"ALTO","plazo":"0-24 horas","c":"#D9261C","d":"Riesgo intolerable. Si el peligro no se puede controlar, los trabajos se paralizan."},"M":{"t":"MEDIO","plazo":"0-72 horas","c":"#E8A000","d":"Se corrige dentro del plazo; mientras tanto la tarea sigue con el control puesto."},"B":{"t":"BAJO","plazo":"1 mes","c":"#2E7D32","d":"Riesgo tolerable."}}};
var PAP_APP = (function(){
  var _MMPT = 25.4/72, ATS = null, IP = null, _ATS_EXT = {};
  /* lo que en la app sale del celular (la empresa, la obra, el personal, los códigos de formato) aquí lo pone quien llama */
  var _C = { emp:{}, obra:'', trabs:[], fmt:{}, logo:null, libre:true, ipListo:true };
  var ATS_REQ = PAPD.req, ATS_EPP = PAPD.epp, ATS_EPC = PAPD.epc, ATS_PERM = PAPD.perm, IP_NIV = PAPD.niv;
  var ATS_NOTAS = PAPD.notas, ATS_OBLIG_DEF = PAPD.oblig, ATS_REGLAS_DEF = PAPD.reglas, ATS_NOTAS_REV = PAPD.notasRev;
  function empleador(){ return _C.emp || {}; }
  function nombreDeLaObra(){ return _C.obra || ''; }
  function trabsLocal(){ return _C.trabs || []; }
  function formatoDe(k){ return (_C.fmt && _C.fmt[k]) || { cod:'', rev:'', fecha:'' }; }
  function logoSinMarcoYa(){ return _C.logo || null; }
  function pdfLogo(doc, x, y, w, h, al){
    var emp = empleador(); if(!emp.logo) return false;
    var L = logoSinMarcoYa() || { du:emp.logo, r:1 }, r = L.r || 1, lw = w, lh = w / r;
    if(lh > h){ lh = h; lw = h * r; }
    var dx = (al === 'izq') ? 0 : (al === 'der' ? (w - lw) : (w - lw)/2);
    try{ doc.addImage(L.du, x + dx, y + (h - lh)/2, lw, lh, undefined, 'FAST'); return true; }catch(e){ return false; }
  }
  /* la franja roja de «no habilita el inicio»: en la app la decide lo firmado; aquí, quien llama (una obra que firma
     en papel no la lleva) */
  function atsPuedeTrabajar(){ return !!_C.libre; }
  function ipercListo(){ return !!_C.ipListo; }
  function _senSlug(t){ var s = String(t||''); try{ s = s.normalize('NFD').replace(/[\u0300-\u036f]/g,''); }catch(e){} return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,42); }
/* ── de ats-flujo.js ── */
function _atsFirmaPDF(doc, tr, x, y, w, h){
  if(!tr || !tr.p || !tr.p.length) return;
  var prop = (tr.h||380)/1000;
  var esc1 = Math.min(w/1000, h/(1000*prop));
  var aw = 1000*esc1, ah = 1000*prop*esc1;
  var ox = x + (w-aw)/2, oy = y + (h-ah)/2;
  doc.setDrawColor(16,24,32); doc.setLineWidth(Math.max(0.16, aw/260));
  doc.setLineCap('round'); doc.setLineJoin('round');
  tr.p.forEach(function(s){
    var pasos = [], px = s[0]*esc1, py = s[1]*esc1;
    for(var i=2;i<s.length;i+=2){
      var nx = s[i]*esc1, ny = s[i+1]*esc1;
      pasos.push([nx-px, ny-py]); px=nx; py=ny;
    }
    if(!pasos.length) return;
    try{ doc.lines(pasos, ox+s[0]*esc1, oy+s[1]*esc1); }catch(e){}
  });
  doc.setLineWidth(0.2); doc.setDrawColor(150,156,162);
  try{ doc.setLineCap('butt'); doc.setLineJoin('miter'); }catch(e){}
}
/* ── de ats.js ── */
function _atsTxt(doc, t, x, y, w, ft, bold, alto){
  doc.setFont('helvetica', bold?'bold':'normal'); doc.setFontSize(ft);
  var lin = doc.splitTextToSize(String(t||''), w);
  var lh = ft*1.13*_MMPT, yy = y + ft*0.74*_MMPT;
  var max = alto ? Math.max(1, Math.floor(alto/lh)) : lin.length;
  lin.slice(0, max).forEach(function(l){ doc.text(l, x, yy); yy += lh; });
  return lin.length*lh;
}
function _atsCaja(doc, x, y, w, h, relleno){
  if(relleno){ doc.setFillColor(relleno[0],relleno[1],relleno[2]); doc.rect(x,y,w,h,'F'); }
  doc.setDrawColor(70,78,86); doc.setLineWidth(0.22); doc.rect(x,y,w,h,'S');
}
var _ATS_AZUL = [214,232,243], _ATS_GRIS = [238,241,244];

/* ══ EL TAMAÑO DE LA LETRA ════════════════════════════════════════
   «no se ve desde lejos… haz como el del excel, su mismo tamaño de
   letra para todo». Antes esto tenía siete tamaños distintos: 5.2 para
   las notas, 5.6 para los nombres, 5.9 para los peligros, 6.2, 6.6,
   6.8, 7.4… Los de abajo no se leían ni de cerca.
   Ahora hay UNO solo para todo el cuerpo del formato, y el contenido
   —lo que alguien escribió— va en negrita, que es lo que se lee a un
   brazo de distancia y con casco puesto. Lo único que se sale de esa
   regla es el título de arriba, que es un título.
   Como la letra crece, las filas ya no son 14 fijas: cada una mide lo
   que necesita su texto y se reparten en las hojas que hagan falta.
   Antes un control largo se cortaba en silencio — y un control de
   seguridad cortado a la mitad es peor que no ponerlo.              */
var _ATS_PT    = 7;     /* el cuerpo entero */
var _ATS_HCHK  = 4.9;   /* renglón de las listas A / NA */
var _ATS_HFILA = 5.8;   /* alto mínimo de una fila de peligro */
var _ATS_HNOTA = 4.2;   /* renglón de las notas del pie */

function _atsLH(){ return _ATS_PT*1.14*_MMPT; }
/* lo que ocupa el pie (observaciones + notas + la línea de abajo) */
function _atsPie(){ return 5.4 + ATS_NOTAS.length*_ATS_HNOTA + 3.4; }
/* dónde arranca la tabla de peligros: la cabecera es siempre igual */
function _atsArranque(M){
  var chk = Math.ceil(ATS_REQ.length/6) + Math.ceil(ATS_EPP.length/6) +
            Math.ceil(ATS_EPC.length/6) + Math.ceil(ATS_PERM.length/6);
  return M + 13 /*cabecera*/ + 6 /*proyecto*/ + 6*4 /*datos*/ +
         5.4*4 /*títulos de bloque*/ + chk*_ATS_HCHK + 5.4 /*cabecera tabla*/;
}
/* cuánto mide cada fila con la letra nueva */
function _atsMedir(doc, filas, w, cols){
  var lh = _atsLH();
  doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT);
  filas.forEach(function(f){
    var alto = 0;
    [[f.p,cols[1]],[f.r,cols[2]],[f.c,cols[3]],[f.m,cols[4]]].forEach(function(par){
      var t = String(par[0]||''); if(!t) return;
      alto = Math.max(alto, doc.splitTextToSize(t, w*par[1]-2.8).length*lh);
    });
    f.h = Math.max(_ATS_HFILA, alto + 1.6);
  });
}
/* reparte las filas en hojas sin cortar texto */
function _atsPaginar(filas, libre){
  var pags = [], act = [], usado = 0;
  filas.forEach(function(f){
    if(act.length && usado + f.h > libre){ pags.push(act); act = []; usado = 0; }
    act.push(f); usado += f.h;
  });
  if(act.length) pags.push(act);
  if(!pags.length) pags.push([]);
  return pags;
}

function _atsDibujar(){
  var W = 297, H = 210, M = 6;
  var doc = new jspdf.jsPDF({ unit:'mm', format:[W,H], orientation:'landscape' });
  var emp = (typeof empleador==='function') ? empleador() : {};
  var obra = (typeof nombreDeLaObra==='function') ? nombreDeLaObra() : '';
  var logo = null;
  if(emp.logo){
    var rr = 2.2, Lr = (typeof logoSinMarcoYa==='function') ? logoSinMarcoYa(emp.logo) : null;
    if(Lr) logo = { du: Lr.du, r: Lr.r };
    else {
      try{ var pr = doc.getImageProperties(emp.logo); if(pr && pr.height) rr = pr.width/pr.height; }catch(e){}
      logo = { du: emp.logo, r: rr };
    }
  }
  var por = {};
  (typeof trabsLocal==='function' ? trabsLocal() : []).forEach(function(t){ por[t.id]=t; });
  if(typeof _ATS_EXT==='object') for(var _k in _ATS_EXT) if(!por[_k]) por[_k]=_ATS_EXT[_k];

  /* Cada fila lleva SU actividad. Antes la actividad viajaba solo en la
     primera fila del grupo con un contador; si el grupo se partía entre
     dos hojas, la segunda quedaba huérfana y nadie sabía de qué tarea
     eran esos peligros. */
  var COLS = [0.17, 0.17, 0.15, 0.17, 0.34];
  var filas = [];
  (ATS.acts||[]).forEach(function(a){
    (a.filas||[]).forEach(function(f){
      filas.push({ act:(a.a||''), p:f.p, r:f.r, c:f.c, m:f.m });
    });
  });
  if(!filas.length) filas.push({ act:'', p:'', r:'', c:'', m:'' });

  var wTabla = W - M*2;
  _atsMedir(doc, filas, wTabla, COLS);
  var libre = (H - M - _atsPie()) - _atsArranque(M);
  var pags = _atsPaginar(filas, libre);
  var hojas = pags.length;

  for(var pg=0; pg<hojas; pg++){
    if(pg) doc.addPage([W,H],'landscape');
    _atsAnverso(doc, W, H, M, emp, obra, logo, pags[pg], pg+1, hojas, libre, COLS);
  }
  doc.addPage([W,H],'landscape');
  _atsReverso(doc, W, H, M, por);

  /* ══ LA FRANJA ROJA ═══════════════════════════════════════════
     Un ATS impreso sin el V°B° del SSOMA se ve exactamente igual a uno
     liberado: mismas casillas, mismas firmas de abajo. Si alguien lo
     saca de la impresora y lo lleva al frente, nadie nota que falta la
     firma que habilita el trabajo. Por eso cada hoja sale con una
     franja roja arriba mientras no esté completa. Cuando el SSOMA
     firma, la franja desaparece sola.                                */
  if(ATS.modo!=='modelo' && typeof atsPuedeTrabajar==='function' && !atsPuedeTrabajar(ATS)){
    var _fr = ATS.devuelto
      ? 'DEVUELTO CON OBSERVACIÓN — NO INICIAR EL TRABAJO'
      : 'SIN V°B° DEL SSOMA — ESTE ATS NO HABILITA EL INICIO DEL TRABAJO';
    var _np = doc.getNumberOfPages();
    for(var _q=1; _q<=_np; _q++){
      doc.setPage(_q);
      doc.setFillColor(217,38,28); doc.rect(0, 0.6, W, 4.6, 'F');
      doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(7.4);
      doc.text(_fr, W/2, 3.85, {align:'center'});
    }
    doc.setTextColor(30,34,40);
  }

  ATS.pdf = { blob: doc.output('blob'),
              nombre: 'ATS-'+(_senSlug(ATS.trabajo)||'trabajo')+'-'+(ATS.fecha||hoyISO())+'.pdf' };
  return { n: hojas+1, filas: filas.length };
}

function _atsAnverso(doc, W, H, M, emp, obra, logo, filas, pg, nHojas, libre, cols){
  var x = M, y = M, w = W - M*2;

  /* ── cabecera ── */
  var hC = 13;
  _atsCaja(doc, x, y, w, hC);
  if(logo && logo.du){
    var hl = hC - 3, lw = hl*logo.r; if(lw > 34){ lw = 34; hl = lw/logo.r; }
    try{ doc.addImage(logo.du, x+2, y+(hC-hl)/2, lw, hl, undefined, 'FAST'); }catch(e){}
  }
  doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.setTextColor(20,24,30);
  doc.text('ANÁLISIS DE TRABAJO SEGURO (A.T.S)', x+w/2, y+hC/2+1.6, { align:'center' });
  var cw = 44;
  _atsCaja(doc, x+w-cw, y, cw, hC/2, _ATS_AZUL);
  _atsCaja(doc, x+w-cw, y+hC/2, cw, hC/2, _ATS_AZUL);
  var _fm = (typeof formatoDe==='function') ? formatoDe('ats') : {cod:'',rev:''};
  var _cod = ATS.codigo || _fm.cod || '', _rev = ATS.rev || _fm.rev || '';
  doc.setFontSize(_ATS_PT); doc.setFont('helvetica','bold');
  doc.text('Código: '+(_cod||'________'), x+w-cw+2, y+hC/4+1.3);
  doc.text('Revisión: '+(_rev||'____'),   x+w-cw+2, y+hC*0.75+1.3);
  y += hC;

  /* ── proyecto y turno ── */
  var hP = 6;
  _atsCaja(doc, x, y, 26, hP, _ATS_AZUL);
  doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT); doc.text('PROYECTO:', x+1.6, y+4.2);
  _atsCaja(doc, x+26, y, w-26-34, hP);
  doc.setFont('helvetica','normal');
  _atsTxt(doc, obra || String(emp.razon||''), x+27.6, y+0.6, w-26-36, _ATS_PT, true, hP);
  _atsCaja(doc, x+w-34, y, 14, hP, _ATS_AZUL);
  doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT); doc.text('Turno', x+w-33, y+4.2);
  _atsCaja(doc, x+w-20, y, 10, hP, (ATS.turno!=='noche' && !_C.sinTurno) ? [252,219,0] : null);
  _atsCaja(doc, x+w-10, y, 10, hP, ATS.turno==='noche' ? [252,219,0] : null);
  doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT);
  doc.text('Día',   x+w-15, y+4.2, {align:'center'});
  doc.text('Noche', x+w-5,  y+4.2, {align:'center'});
  y += hP;

  /* ── datos del trabajo (izq) y responsables (der) ── */
  var hD = 6, anchoIzq = w*0.53;
  var izq = [['Hora de Inicio', ATS.hora||''], ['Área', ATS.area||''],
             ['Trabajo a realizar  (1)', ATS.trabajo||''], ['Ubicación del trabajo', ATS.ubic||'']];
  izq.forEach(function(f, i){
    var yy = y + i*hD;
    _atsCaja(doc, x, yy, 38, hD, _ATS_AZUL);
    doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT); doc.setTextColor(20,24,30);
    doc.text(f[0], x+1.6, yy+4.2);
    if(i===0){
      _atsCaja(doc, x+38, yy, (anchoIzq-38)/2, hD);
      doc.setFont('helvetica','bold'); doc.text(String(f[1]), x+39.6, yy+4.2);
      _atsCaja(doc, x+38+(anchoIzq-38)/2, yy, (anchoIzq-38)/2, hD, _ATS_AZUL);
      doc.setFont('helvetica','bold'); doc.text('Fecha: '+fechaLarga(ATS.fecha||''), x+39.6+(anchoIzq-38)/2, yy+4.2);
    }else{
      _atsCaja(doc, x+38, yy, anchoIzq-38, hD);
      _atsTxt(doc, f[1], x+39.6, yy+0.5, anchoIzq-41, _ATS_PT, true, hD);
    }
  });
  var xd = x + anchoIzq + 2, wd = w - anchoIzq - 2;
  _atsCaja(doc, xd, y, wd*0.32, hD, _ATS_AZUL);
  _atsCaja(doc, xd+wd*0.32, y, wd*0.44, hD, _ATS_AZUL);
  _atsCaja(doc, xd+wd*0.76, y, wd*0.24, hD, _ATS_AZUL);
  doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT);
  doc.text('Responsables del trabajo', xd+1.6, y+4.2);
  doc.text('Nombre y Apellidos', xd+wd*0.32+wd*0.22, y+4.2, {align:'center'});
  doc.text('Firma', xd+wd*0.88, y+4.2, {align:'center'});
  var _vb = ATS.vb || {};
  [['Responsable de Grupo', ATS.rGrupo, 'cap'],
   ['Supervisor / Ingeniero', ATS.rSuper, 'ing'],
   ['V°B° SST', ATS.rSST, 'sst']]
  .forEach(function(f, i){
    var yy = y + hD*(i+1);
    _atsCaja(doc, xd, yy, wd*0.32, hD);
    _atsCaja(doc, xd+wd*0.32, yy, wd*0.44, hD);
    _atsCaja(doc, xd+wd*0.76, yy, wd*0.24, hD);
    doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT);
    doc.text(f[0], xd+1.6, yy+4.2);
    var fi = _vb[f[2]];
    if(f[1]) _atsTxt(doc, f[1], xd+wd*0.32+1.6, yy+0.5, wd*0.42, _ATS_PT, true, hD);
    if(fi && fi.tr && typeof _atsFirmaPDF==='function')
      _atsFirmaPDF(doc, fi.tr, xd+wd*0.765, yy+0.5, wd*0.23, hD-1);
  });
  y += hD*4;

  /* ── las listas A/NA ── */
  function bloque(tit, lista, campo, cols){
    var hT = 5.4;
    _atsCaja(doc, x, y, w, hT, _ATS_AZUL);
    doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT); doc.setTextColor(20,24,30);
    doc.text(tit, x+1.6, y+3.8);
    y += hT;
    var filasN = Math.ceil(lista.length/cols), cw2 = w/cols, hF = _ATS_HCHK;
    for(var i=0;i<lista.length;i++){
      var col = Math.floor(i/filasN), fil = i%filasN;
      var cx = x + col*cw2, cy2 = y + fil*hF;
      var v = ATS[campo][i];
      _atsCaja(doc, cx, cy2, cw2-11, hF);
      doc.setTextColor(30,34,40);
      _atsTxt(doc, lista[i], cx+1.2, cy2+0.3, cw2-13, _ATS_PT, false, hF);
      _atsCaja(doc, cx+cw2-11, cy2, 5.5, hF, v==='A'  ? [252,219,0] : null);
      _atsCaja(doc, cx+cw2-5.5, cy2, 5.5, hF, v==='NA' ? [252,219,0] : null);
      doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT-0.6);
      doc.setTextColor(v==='A'?20:130, v==='A'?24:138, v==='A'?30:146);
      doc.text('A', cx+cw2-8.25, cy2+hF/2+1.1, {align:'center'});
      doc.setTextColor(v==='NA'?20:130, v==='NA'?24:138, v==='NA'?30:146);
      doc.text('NA', cx+cw2-2.75, cy2+hF/2+1.1, {align:'center'});
      doc.setTextColor(30,34,40);
    }
    y += filasN*hF;
  }
  bloque('Requisitos para ejecución de los trabajos — marque con una aspa:  Aplica (A)  /  No aplica (NA)  (2)', ATS_REQ, 'req', 6);
  bloque('Equipo de Protección Personal', ATS_EPP, 'epp', 6);
  bloque('Equipo de Protección Colectiva', ATS_EPC, 'epc', 6);
  bloque('Permisos Adicionales', ATS_PERM, 'perm', 6);

  /* ── la tabla: una fila = un peligro ── */
  var hT2 = 5.4, cx2 = x;
  var tit = ['Secuencia de actividades (3)','Peligros (4)','Riesgos (5)','Consecuencia (6)','Medidas de control (7)'];
  cols.forEach(function(f, i){
    _atsCaja(doc, cx2, y, w*f, hT2, _ATS_AZUL);
    doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT); doc.setTextColor(20,24,30);
    doc.text(tit[i], cx2 + w*f/2, y+3.8, {align:'center'});
    cx2 += w*f;
  });
  y += hT2;

  /* Lo que sobra de la hoja se reparte entre las filas: así el formato
     sale lleno, como el de papel, y no con media hoja en blanco. */
  var usado = 0; filas.forEach(function(f){ usado += f.h; });
  var vacias = 0, hVacia = _ATS_HFILA;
  if(usado < libre){
    vacias = Math.floor((libre-usado)/hVacia);
    var sobra = libre - usado - vacias*hVacia;
    if(filas.length + vacias > 0) hVacia += sobra/Math.max(1, vacias || 1);
    if(!vacias && filas.length){
      var extra = (libre-usado)/filas.length;
      filas.forEach(function(f){ f.h += extra; });
    }
  }

  var lh = _atsLH(), yy = y;
  filas.forEach(function(f){
    var cx3 = x + w*cols[0];
    [[f.p,cols[1]],[f.r,cols[2]],[f.c,cols[3]],[f.m,cols[4]]].forEach(function(par){
      _atsCaja(doc, cx3, yy, w*par[1], f.h);
      var t = String(par[0]||'');
      if(t){
        doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT); doc.setTextColor(24,28,34);
        var lin = doc.splitTextToSize(t, w*par[1]-2.8);
        var yb = yy + (f.h - lin.length*lh)/2 + _ATS_PT*0.74*_MMPT;
        lin.forEach(function(l){ doc.text(l, cx3+1.4, yb); yb += lh; });
      }
      cx3 += w*par[1];
    });
    yy += f.h;
  });
  for(var v0=0; v0<vacias; v0++){
    var cx4 = x + w*cols[0];
    cols.slice(1).forEach(function(fr){ _atsCaja(doc, cx4, yy, w*fr, hVacia); cx4 += w*fr; });
    yy += hVacia;
  }

  /* la columna de la actividad va en UNA sola celda alta por grupo, como
     en el formato de obra: así se ve de un vistazo que esos ocho peligros
     son de la misma tarea */
  var yg = y, i0 = 0;
  while(i0 < filas.length){
    var nom = filas[i0].act, alto = 0, i1 = i0;
    while(i1 < filas.length && filas[i1].act === nom){ alto += filas[i1].h; i1++; }
    _atsCaja(doc, x, yg, w*cols[0], alto);
    if(nom){
      doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT); doc.setTextColor(24,28,34);
      var lin2 = doc.splitTextToSize(nom, w*cols[0]-2.8);
      var yb2 = yg + (alto - lin2.length*lh)/2 + _ATS_PT*0.74*_MMPT;
      lin2.forEach(function(l){ doc.text(l, x+1.4, yb2); yb2 += lh; });
    }
    yg += alto; i0 = i1;
  }
  if(vacias) _atsCaja(doc, x, yg, w*cols[0], vacias*hVacia);
  y = yy;

  /* ── observaciones y notas ── */
  _atsCaja(doc, x, y, w, 5.4, _ATS_AZUL);
  doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT); doc.setTextColor(20,24,30);
  doc.text('OBSERVACIONES / SUGERENCIAS:'+(ATS.obs?'  '+ATS.obs:''), x+1.6, y+3.8, {maxWidth:w-3});
  y += 5.4;
  ATS_NOTAS.forEach(function(n, i){
    _atsCaja(doc, x, y, w, _ATS_HNOTA);
    doc.setFont('helvetica','normal'); doc.setFontSize(_ATS_PT-0.8); doc.setTextColor(50,56,64);
    doc.text((i+1)+'.- '+n, x+1.4, y+_ATS_HNOTA/2+1, { maxWidth: w-3 });
    y += _ATS_HNOTA;
  });
  doc.setFontSize(_ATS_PT-1.4); doc.setTextColor(150,158,166);
  doc.text((nHojas>1 ? 'Hoja '+pg+' de '+nHojas+'  ·  ' : '')+String(emp.razon||'').toUpperCase()+'  ·  OBRASST',
           W/2, Math.max(y+3.2, H-2.6), { align:'center' });
}

function _atsReverso(doc, W, H, M, por){
  var x = M, y = M, w = W - M*2;
  var hB = 52, wi = w*0.47;
  _atsCaja(doc, x, y, wi, hB);
  doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT+0.6); doc.setTextColor(20,60,120);
  doc.text('OBLIGACIONES DEL TRABAJADOR', x+2, y+4.6);
  doc.setTextColor(30,34,40);
  var yy = y+6.2;
  String(ATS_OBLIG_DEF).split('\n').forEach(function(l){
    yy += _atsTxt(doc, l, x+2, yy, wi-4, _ATS_PT-0.5, false);
  });
  var xd = x + wi + w*0.04, wd = w - wi - w*0.04;
  _atsCaja(doc, xd, y, wd, hB);
  doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT+0.6); doc.setTextColor(180,30,30);
  doc.text('REGLAS GENERALES DE SST', xd+2, y+4.4);
  doc.setTextColor(30,34,40);
  var yd = y+6.2;
  ATS_REGLAS_DEF.forEach(function(l, i){
    yd += _atsTxt(doc, (i+1)+'. '+l, xd+2, yd, wd-4, _ATS_PT-0.5, false);
  });
  y += hB + 3;

  doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT-0.4); doc.setTextColor(30,34,40);
  doc.text('Conociendo los peligros, riesgos y medidas de control a adoptar en el desarrollo de mi actividad, firmo en señal de conformidad:', x, y+3);
  y += 5;

  var c1 = w*0.34, c2 = w*0.11, c3 = w*0.11, c4 = w*0.11, c5 = w - c1 - c2 - c3 - c4;
  var hH = 5.6, hH2 = 6.4;
  _atsCaja(doc, x, y, c1, hH+hH2, _ATS_AZUL);
  _atsCaja(doc, x+c1, y, c2+c3, hH, _ATS_AZUL);
  _atsCaja(doc, x+c1, y+hH, c2, hH2, _ATS_AZUL);
  _atsCaja(doc, x+c1+c2, y+hH, c3, hH2, _ATS_AZUL);
  _atsCaja(doc, x+c1+c2+c3, y, c4, hH+hH2, _ATS_AZUL);
  _atsCaja(doc, x+c1+c2+c3+c4, y, c5, hH+hH2, _ATS_AZUL);
  doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT);
  doc.text('Nombre completo', x+c1/2, y+3.7, {align:'center'});
  doc.setFontSize(_ATS_PT-1); doc.setFont('helvetica','normal');
  doc.text('(personal que participará de la actividad)', x+c1/2, y+hH+4.2, {align:'center'});
  doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT);
  doc.text('Firma', x+c1+(c2+c3)/2, y+3.7, {align:'center'});
  doc.setFontSize(_ATS_PT-0.8);
  doc.text('Al inicio',   x+c1+c2/2, y+hH+4.2, {align:'center'});
  doc.text('Al término',  x+c1+c2+c3/2, y+hH+4.2, {align:'center'});
  doc.setFontSize(_ATS_PT-0.6);
  doc.text('Hora final', x+c1+c2+c3+c4/2, y+6.4, {align:'center'});
  doc.text('Ocurrencia — sin novedad o describa el evento', x+c1+c2+c3+c4+c5/2, y+6.4, {align:'center'});
  y += hH+hH2;

  var ids = (ATS.gente||[]).slice();
  /* Si la ficha de alguien todavía no la confirmó el supervisor, su
     firma vale igual —la cuadrilla no puede quedarse parada esperando
     un trámite— pero el papel tiene que decirlo. Un ATS que lleva un
     nombre que nadie verificó y no lo advierte es peor que uno que sí
     lo advierte. */
  var gente = ids.map(function(id){
    var t = por[id] || {};
    return (t.nombre || '') + ((t.verificado === false) ? '  (pend. verificar)' : '');
  });
  var firmas = ATS.firmas || {};
  var nF = Math.max(10, gente.length);
  var hF = Math.max(6.6, (H - M - 18 - y)/nF);
  for(var i=0;i<nF;i++){
    var yy2 = y + i*hF;
    _atsCaja(doc, x, yy2, c1, hF);
    _atsCaja(doc, x+c1, yy2, c2, hF);
    _atsCaja(doc, x+c1+c2, yy2, c3, hF);
    _atsCaja(doc, x+c1+c2+c3, yy2, c4, hF);
    _atsCaja(doc, x+c1+c2+c3+c4, yy2, c5, hF);
    doc.setFont('helvetica','normal'); doc.setFontSize(_ATS_PT-1); doc.setTextColor(150,156,162);
    doc.text(String(i+1), x+1.4, yy2+hF/2+1);
    if(gente[i]){
      doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT); doc.setTextColor(28,32,38);
      doc.text(gente[i], x+5.6, yy2+hF/2+1.2, { maxWidth: c1-7 });
      var fq = firmas[ids[i]];
      if(fq && fq.tr && typeof _atsFirmaPDF==='function')
        _atsFirmaPDF(doc, fq.tr, x+c1+0.6, yy2+0.4, c2-1.2, hF-0.8);
    }
  }
  y += nF*hF + 2;
  doc.setFont('helvetica','bold'); doc.setFontSize(_ATS_PT-1); doc.setTextColor(40,46,54);
  doc.text('NOTAS IMPORTANTES:', x, y+2.6);
  doc.setFont('helvetica','normal');
  var yn = y+2.4;
  ATS_NOTAS_REV.forEach(function(n, i){
    yn += _atsTxt(doc, (i+1)+'. '+n, x+27, yn-2.4, w-27, _ATS_PT-1, false);
  });
}
/* ── de iperc.js ── */
var _IP_PT = 7;
function _ipLH(){ return _IP_PT*1.14*_MMPT; }

function _ipDibujar(){
  var W=297, H=210, M=7;
  var doc = new jspdf.jsPDF({ unit:'mm', format:[W,H], orientation:'landscape' });
  var emp = (typeof empleador==='function') ? empleador() : {};
  /* el código y la revisión salen del registro de formatos de la
     empresa, igual que los del ATS y los del kardex: son SU numeración,
     no una que invente la app */
  var fmt = (typeof formatoDe==='function') ? formatoDe('iperc') : {cod:'',rev:'',fecha:''};
  var y = M;

  /* ── la caja de identificación del anexo ── */
  var cajaW = 64, tituloW = W-M*2-cajaW;
  _atsCaja(doc, M, y, tituloW, 15, [255,255,255]);
  if(emp.logo){
    try{ pdfLogo(doc, M+1.6, y+1.6, 22, 11.8); }catch(e){}
  }
  doc.setTextColor(16,24,32);
  _atsTxt(doc, 'ANEXO Nº 7', M+(emp.logo?26:3), y+2.2, tituloW-30, 8.6, true);
  _atsTxt(doc, 'FORMATO IPERC CONTINUO', M+(emp.logo?26:3), y+7.4, tituloW-30, 10.4, true);
  var cx = M+tituloW;
  ['Código: '+(fmt.cod||''), 'Versión: '+(fmt.rev||''),
   'Fecha: '+(typeof fechaLarga==='function'?fechaLarga(fmt.fecha||IP.fecha):''), 'Página 1 de 1'
  ].forEach(function(t,i){
    _atsCaja(doc, cx, y+i*3.75, cajaW, 3.75, i%2?[247,249,251]:[255,255,255]);
    _atsTxt(doc, t, cx+1.6, y+i*3.75+0.45, cajaW-3, 6.4, false);
  });
  y += 15 + 2.4;

  /* ── FECHA, LUGAR Y DATOS DE TRABAJADORES ── */
  _atsCaja(doc, M, y, W-M*2, 4.6, _ATS_AZUL);
  _atsTxt(doc, 'FECHA, LUGAR Y DATOS DE TRABAJADORES:', M+1.8, y+0.7, W-M*2-3, _IP_PT, true);
  y += 4.6;

  var cabC = [0.11, 0.08, 0.20, 0.36, 0.25], cabW = W-M*2;
  var cabT = ['FECHA','HORA','NIVEL/ÁREA','NOMBRES','FIRMA'];
  var cxx = M;
  cabT.forEach(function(t,i){
    _atsCaja(doc, cxx, y, cabW*cabC[i], 4.4, _ATS_GRIS);
    _atsTxt(doc, t, cxx+1.4, y+0.65, cabW*cabC[i]-2.4, _IP_PT, true);
    cxx += cabW*cabC[i];
  });
  y += 4.4;

  /* una fila por trabajador; la fecha, la hora y el nivel solo en la primera */
  var gente = (IP.gente||[]).length ? IP.gente : [{nombre:'', firma:null}];
  gente.forEach(function(g, i){
    var alto = 8.6;
    var xx = M;
    [ i?'' : (typeof fechaLarga==='function'?fechaLarga(IP.fecha):IP.fecha||''),
      i?'' : (IP.hora||''),
      i?'' : (IP.nivel||''),
      g.nombre||'', '' ].forEach(function(t, k){
      var an = cabW*cabC[k];
      _atsCaja(doc, xx, y, an, alto);
      if(k===4){ if(g.firma) _atsFirmaPDF(doc, g.firma, xx+1.2, y+0.9, an-2.4, alto-1.8); }
      else _atsTxt(doc, t, xx+1.4, y+1.1, an-2.8, _IP_PT, true, alto-1.8);
      xx += an;
    });
    y += alto;
  });
  y += 2.4;

  /* ── la tabla de peligros ── */
  var tC = [0.24, 0.16, 0.10, 0.34, 0.16];
  var tT = ['DESCRIPCIÓN DEL PELIGRO','RIESGO','EVALUACIÓN IPER',
            'MEDIDAS DE CONTROL A IMPLEMENTAR','EVALUACIÓN RIESGO RESIDUAL'];
  var xx2 = M;
  tT.forEach(function(t,i){
    _atsCaja(doc, xx2, y, cabW*tC[i], 7.2, _ATS_AZUL);
    _atsTxt(doc, t, xx2+1.4, y+0.7, cabW*tC[i]-2.6, _IP_PT, true, 6.4);
    xx2 += cabW*tC[i];
  });
  y += 7.2;

  var lh = _ipLH();
  (IP.filas||[]).forEach(function(f){
    var alto = 6.2;
    doc.setFont('helvetica','bold'); doc.setFontSize(_IP_PT);
    [[f.p,tC[0]],[f.r,tC[1]],[f.m,tC[3]]].forEach(function(par){
      var t=String(par[0]||''); if(!t) return;
      alto = Math.max(alto, doc.splitTextToSize(t, cabW*par[1]-2.8).length*lh + 1.6);
    });
    if(y + alto > H - M - 26){ doc.addPage([W,H],'landscape'); y = M; }
    var xx3 = M;
    [[f.p,0],[f.r,1],[f.ev,2],[f.m,3],[f.res,4]].forEach(function(par){
      var i = par[1], an = cabW*tC[i];
      _atsCaja(doc, xx3, y, an, alto);
      if(i===2 || i===4){
        /* La A, la M o la B grandes: es lo único de esta hoja que se lee
           de lejos y con casco puesto. Se reserva el renglón de abajo
           para la palabra y la letra se centra en lo que queda —antes
           se posicionaban desde el centro de la celda y con una fila
           corta la palabra se salía del recuadro y caía encima de la
           fila siguiente. */
        var v = String(par[0]||'');
        if(v){
          var N = IP_NIV[v]||{};
          doc.setTextColor(16,24,32);
          doc.setFont('helvetica','bold'); doc.setFontSize(9.5);
          doc.text(v, xx3+an/2, y + (alto-2)/2 + 1.6, {align:'center'});
          doc.setFontSize(5);
          doc.text(N.t||'', xx3+an/2, y + alto - 0.9, {align:'center'});
        }
      } else {
        _atsTxt(doc, par[0]||'', xx3+1.4, y+0.9, an-2.8, _IP_PT, true, alto-1.6);
      }
      xx3 += an;
    });
    y += alto;
  });
  /* Un IPERC continuo se imprime tanto lleno como EN BLANCO: el papel
     que se lleva al frente para llenarlo a mano. Si la tabla termina a
     un tercio de la hoja, quien lo imprime se queda sin dónde escribir
     y termina anotando al margen. Se rellena hasta dejar el pie pegado
     abajo.

     El pie se MIDE una sola vez y ese número manda en los tres sitios
     —cuántos renglones caben, y los dos saltos de página—. Cuando cada
     uno estimaba por su cuenta, el relleno dejaba 3 mm de menos y el
     pie se iba a una segunda hoja con la primera medio vacía. */
  var sec  = (IP.secuencia||[]).filter(function(x){ return String(x||'').trim(); });
  var sups = (IP.sup||[]).length ? IP.sup : [{hora:'',nombre:'',medida:'',firma:null}];
  var hSec = 4.4 + Math.max(1, sec.length)*4.2;
  var hSup = 4.4 + 4.4 + sups.length*9;
  var pieMide = hSec + 2.6 + hSup;

  var sobra = (H - M) - y - pieMide - 2.6;
  var enBlanco = Math.floor(sobra / 7.4);
  for(var vb=0; vb<enBlanco && vb<16; vb++){
    var xv = M;
    tC.forEach(function(an0){ _atsCaja(doc, xv, y, cabW*an0, 7.4); xv += cabW*an0; });
    y += 7.4;
  }
  y += 2.6;

  /* ── la secuencia ── */
  if(y + pieMide > H - M){ doc.addPage([W,H],'landscape'); y = M; }
  _atsCaja(doc, M, y, cabW, 4.4, _ATS_AZUL);
  _atsTxt(doc, 'SECUENCIA PARA CONTROLAR EL PELIGRO Y REDUCIR EL RIESGO.', M+1.8, y+0.7, cabW-3, _IP_PT, true);
  y += 4.4;
  (sec.length?sec:['']).forEach(function(s,i){
    _atsCaja(doc, M, y, cabW, 4.2);
    _atsTxt(doc, (i+1)+'.  '+String(s||''), M+1.8, y+0.75, cabW-3.6, _IP_PT, true, 3.6);
    y += 4.2;
  });
  y += 2.6;

  /* ── DATOS DE LOS SUPERVISORES · sin columna de fecha ── */
  if(y + hSup > H - M){ doc.addPage([W,H],'landscape'); y = M; }
  _atsCaja(doc, M, y, cabW, 4.4, _ATS_AZUL);
  _atsTxt(doc, 'DATOS DE LOS SUPERVISORES', M+1.8, y+0.7, cabW-3, _IP_PT, true);
  y += 4.4;
  var sC = [0.05, 0.09, 0.26, 0.38, 0.22];
  var sT = ['Nº','HORA','NOMBRE SUPERVISOR','MEDIDA CORRECTIVA','FIRMA'];
  var xs = M;
  sT.forEach(function(t,i){
    _atsCaja(doc, xs, y, cabW*sC[i], 4.4, _ATS_GRIS);
    _atsTxt(doc, t, xs+1.4, y+0.65, cabW*sC[i]-2.4, _IP_PT, true);
    xs += cabW*sC[i];
  });
  y += 4.4;
  sups.forEach(function(s,i){
    var alto = 9, xs2 = M;
    [(i+1)+'.-', s.hora||'', s.nombre||'', s.medida||'', ''].forEach(function(t,k){
      var an = cabW*sC[k];
      _atsCaja(doc, xs2, y, an, alto);
      if(k===4){ if(s.firma) _atsFirmaPDF(doc, s.firma, xs2+1.2, y+0.9, an-2.4, alto-1.8); }
      else _atsTxt(doc, t, xs2+1.4, y+1.1, an-2.8, _IP_PT, true, alto-1.8);
      xs2 += an;
    });
    y += alto;
  });

  /* ── la franja: un IPERC sin firmar se ve igual que uno firmado ── */
  if(!ipercListo(IP)){
    var np = doc.getNumberOfPages();
    for(var q=1;q<=np;q++){
      doc.setPage(q);
      doc.setFillColor(217,38,28); doc.rect(0, 0.6, W, 4.2, 'F');
      doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(7);
      doc.text('IPERC CONTINUO INCOMPLETO — NO HABILITA EL INICIO DE LA TAREA', W/2, 3.6, {align:'center'});
      doc.setTextColor(16,24,32);
    }
  }
  return doc;
}
  function _pon(C){
    _C = C || {}; if(_C.libre === undefined) _C.libre = true; if(_C.ipListo === undefined) _C.ipListo = true;
    /* fuera del Perú, los textos fijos pasan por la capa del país (como en la app) */
    var tx = (typeof _C.tx === 'function') ? _C.tx : function(x){ return x; };
    ATS_NOTAS = PAPD.notas.map(tx); ATS_OBLIG_DEF = tx(PAPD.oblig); ATS_REGLAS_DEF = PAPD.reglas.map(tx); ATS_NOTAS_REV = PAPD.notasRev.map(tx);
  }
  return {
    firma: _atsFirmaPDF,
    /* a: el ATS con la forma del celular (gente:[ids], firmas:{id:{tr}}); C: { emp:{razon,logo}, obra, trabs:[{id,nombre}], fmt:{ats:{cod,rev,fecha}}, logo:{du,r}, libre, tx } */
    ats: function(a, C){ _pon(C); ATS = a; try{ var r = _atsDibujar(); return { blob:ATS.pdf.blob, nombre:ATS.pdf.nombre, hojas:r.n, filas:r.filas }; } finally { ATS = null; } },
    /* o: el IPERC continuo con la forma del celular (gente:[{nombre,firma}], filas, secuencia, sup) */
    iperc: function(o, C){ _pon(C); IP = o; try{ var doc = _ipDibujar(); return { blob:doc.output('blob'), hojas:doc.getNumberOfPages() }; } finally { IP = null; } }
  };
})();
