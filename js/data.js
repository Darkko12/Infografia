window.APP_DATA = {
  n1: {
    chatgptModels: [
      { id:'gpt35', label:'GPT-3.5', date:'2022', title:'GPT-3.5', body:'Texto final pendiente de reemplazar por la versión exacta de Figma.' },
      { id:'gpt4', label:'GPT-4', date:'2023', title:'GPT-4', body:'Texto final pendiente de reemplazar por la versión exacta de Figma.' },
      { id:'gpt4o', label:'GPT-4o', date:'2024', title:'GPT-4o', body:'Texto final pendiente de reemplazar por la versión exacta de Figma.' },
      { id:'o1', label:'o1', date:'2024', title:'o1', body:'Texto final pendiente de reemplazar por la versión exacta de Figma.' },
      { id:'gpt5', label:'GPT-5', date:'2025', title:'GPT-5', body:'Texto final pendiente de reemplazar por la versión exacta de Figma.' }
    ],
    openaiPeople: [
      { name:'Sam Altman', role:'Referente de OpenAI', image:'assets/sam-altman.jpg', facts:['Empresario, inversionista, programador y bloguero estadounidense.','Director ejecutivo de OpenAI y expresidente de Y Combinator.','Figura principal en el desarrollo de la inteligencia artificial.'] },
      { name:'Greg Brockman', role:'Referente de OpenAI', image:'assets/greg-brockman.jpg', facts:['Emprendedor e ingeniero de software estadounidense.','Cofundador y presidente de OpenAI.','Dejó Stripe en 2015 para cofundar OpenAI.'] },
      { name:'Ilya Sutskever', role:'Referente histórico de OpenAI', image:'assets/ilya-sutskever.jpg', facts:['Informático teórico israelí-canadiense que trabaja en aprendizaje automático.','Cofundador y exjefe científico de OpenAI. Abandonó la compañía en 2024.','Ha realizado varias contribuciones importantes al campo del aprendizaje profundo.'] }
    ],
    competitors: {
      years:['2022','2023','2024','2025','2026'],
      series:[
        { key:'chatgpt', label:'ChatGPT', color:'#F7F7F7', values:[267,16553,31850,64019,16655], display:['267M','16.553M','31.850M','64.019M','16.655M'] },
        { key:'gemini', label:'Gemini', color:'#65C466', values:[null,800,4575,11820,3545], display:['-','800M','4575M','11.820M','3545M'] },
        { key:'perplexity', label:'Perplexity', color:'#E43D3D', values:[6,349,1355,2054,558], display:['6M','349M','1355M','2054M','558M'] },
        { key:'claude', label:'Claude', color:'#E8CC22', values:[null,60,640,2010,900], display:['-','60M','640M','2010M','900M'] },
        { key:'deepseek', label:'DeepSeek', color:'#D452A9', values:[null,null,97,2842,740], display:['-','-','97M','2842M','740M'] },
        { key:'grok', label:'Grok', color:'#D28224', values:[null,40,875,2892,858], display:['-','40M','875M','2892M','858M'] },
        { key:'copilot', label:'Copilot', color:'#6C42D9', values:[null,630,2335,3932,781], display:['-','630M','2335','3932M','781M'] }
      ]
    },
    similarModels:[
      { name:'Grok', brand:'grok', description:'Integrada principalmente con X. Se caracteriza por respuestas conversacionales, acceso a información actual y un tono más informal.' },
      { name:'Claude', brand:'claude', description:'Destaca por su enfoque en la seguridad, su precisión para seguir instrucciones complejas y su capacidad para procesar grandes volúmenes de texto.' },
      { name:'Gemini', brand:'gemini', description:'Funciona tanto como un asistente personal inteligente para usuarios cotidianos como una familia de modelos avanzados de lenguaje orientados la programación y la automatización.' },
      { name:'Perplexity', brand:'perplexity', description:'Diseñado para transformar la manera en que buscamos e interactuamos con la información en internet. Ofrece respuestas directas, detalladas y estructuradas en lenguaje natural.' },
      { name:'Copilot', brand:'copilot', description:'Un asistente virtual de inteligencia artificial desarrollado por Microsoft que ayuda a crear, buscar información, programar y automatizar tareas cotidianas mediante lenguaje natural.' }
    ],
    growth: {
      // Valores provisionales: la estructura ya funciona y se reemplaza por los números exactos de Figma.
      annual:[
        {label:'2022', value:1, note:'Texto anual exacto pendiente.'},
        {label:'2023', value:100, note:'Texto anual exacto pendiente.'},
        {label:'2024', value:300, note:'Texto anual exacto pendiente.'},
        {label:'2025', value:800, note:'Texto anual exacto pendiente.'},
        {label:'2026', value:1000, note:'Texto anual exacto pendiente.'}
      ],
      monthly:[
        {label:'Enero', value:875}, {label:'Febrero', value:888}, {label:'Marzo', value:890}, {label:'Abril', value:894},
        {label:'Mayo', value:898}, {label:'Junio', value:901}, {label:'Julio', value:904}, {label:'Agosto', value:1000}
      ]
    },
    usage:[
      {key:'practice', label:'Guía práctica', value:28.3, color:'#65C466', detail:'Información detallada pendiente de la versión final del panel.'},
      {key:'writing', label:'Escritura', value:28.1, color:'#CC53A5', detail:'Información detallada pendiente de la versión final del panel.'},
      {key:'search', label:'Búsqueda de información', value:21.3, color:'#E63B3F', detail:'Información detallada pendiente de la versión final del panel.'},
      {key:'technical', label:'Ayuda técnica', value:7.5, color:'#E5C91F', detail:'Información detallada pendiente de la versión final del panel.'},
      {key:'multimedia', label:'Multimedia', value:6.0, color:'#5B86C8', detail:'Información detallada pendiente de la versión final del panel.'},
      {key:'other', label:'Otro/desconocido', value:4.6, color:'#D98724', detail:'Información detallada pendiente de la versión final del panel.'},
      {key:'self', label:'Autoexpresión', value:4.3, color:'#8740C6', detail:'Información detallada pendiente de la versión final del panel.'}
    ]
  },
  n2: {
    agreementTabs:[
      {key:'advice', label:'Consejos personales', description:'Se analizaron las respuestas en base a 3.027 preguntas abiertas de consejos personales (Reddit y columnas de consejeros profesionales).', human:39, ai:91},
      {key:'aita', label:'“¿Soy yo el forr*?”', description:'Sobre 2.000 publicaciones de la comunidad de Reddit “AmITheAssh*le?” donde la comunidad ya votó, por consenso, que el usuario estaba equivocado.', human:0, ai:51},
      {key:'risk', label:'Acciones riesgosas.', description:'Sobre 6.560 frases que describen una acción riesgosa (mentir, autolesión, violencia, etc.).', human:0, ai:67}
    ],
    perspective:[
      {turn:'T2', non:25, comp:5}, {turn:'T3', non:35, comp:5}, {turn:'T4', non:45, comp:7},
      {turn:'T5', non:55, comp:7}, {turn:'T6', non:62, comp:9}, {turn:'T7', non:67, comp:7}
    ],
    paradox:[
      {title:'Calidad percibida de respuesta', leftLabel:'No complaciente', rightLabel:'Complaciente', left:5.1, right:5.6, delta:'+9%'},
      {title:'Confianza en el asistente', leftLabel:'No complaciente', rightLabel:'Complaciente', left:5.2, right:5.6, delta:'+8%'},
      {title:'Disposición a volver a usarlo', leftLabel:'No complaciente', rightLabel:'Complaciente', left:4.7, right:5.3, delta:'+13%'}
    ],
    references:[
      'Plataforma de inteligencia de búsqueda en IA',
      'Estadísticas de ingresos y uso de ChatGPT (2026)',
      'Análisis de tráfico, clasificación y audiencia de claude.ai',
      'Análisis de tráfico, clasificación y audiencia de chatgpt.com',
      'Análisis de tráfico, clasificación y audiencia de perplexity.ai',
      'Los 100 sitios web más visitados en EE. UU. (mayo de 2026)',
      'El liderazgo de ChatGPT se reduce a medida que Gemini asciende en la guerra de tráfico de la IA',
      'Análisis de la dependencia de los chatbots de IA: un modelo de doble vía de mecanismos cognitivos y afectivos',
      'Investigación sobre el uso afectivo y el bienestar emocional en ChatGPT',
      'La IA aduladora disminuye las intenciones prosociales y promueve la dependencia.',
      'Greg Brockman – Wikipedia',
      'Presentamos ChatGPT – OpenAI',
      'Notas de lanzamiento de modelos',
      'Sam Altman – Wikipedia, la enciclopedia libre',
      'Ilya Sutskever – Wikipedia, la enciclopedia libre',
      'Estadísticas de uso de ChatGPT: septiembre de 2026',
      'Cuota de mercado de chatbots de IA en todo el mundo',
      'El tráfico web de ChatGPT disminuye mientras Google Gemini gana terreno',
      'Cómo la IA y el comportamiento humano moldean los efectos psicosociales del uso prolongado de chatbots: un estudio longitudinal controlado aleatorizado'
    ]
  }
};
