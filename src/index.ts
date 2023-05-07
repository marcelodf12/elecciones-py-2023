import fs from 'fs';
import { SingleBar } from 'cli-progress';
import * as client from './client-http-cache'
import * as dotenv from 'dotenv'
import { Mesa } from './mesa';
dotenv.config()

const endpoints = {
    elecciones: process.env.URL_ELECCIONES || '' ,
    candidaturas: process.env.URL_CANDIDATURAS || '' ,
    departamentos: process.env.URL_DEPARTAMENTOS || '' ,
    distritos: process.env.URL_DISTRITOS || '' ,
    zonas: process.env.URL_ZONAS || '' ,
    locales: process.env.URL_LOCALES || '' ,
    mesas: process.env.URL_MESAS || '' ,
    resultados: process.env.URL_RESULTADOS || '',
    seguridad: process.env.URL_SEGURIDAD || '',
}

const progressBar = new SingleBar({
    format: 'Progreso |{bar}| {percentage}% || Tiempo restantes aprox: {estimatedTimeRemaining} || {value}/{total}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

const eleccionesClient = new client.EleccionesCliente(endpoints.elecciones);
const candidaturasClient = new client.CandidaturaCliente(endpoints.candidaturas);
const departamentosClient = new client.DepartamentoCliente(endpoints.departamentos);
const distritosClient = new client.DistritosClient(endpoints.distritos);
const zonasClient = new client.ZonasClient(endpoints.zonas);
const localesClient = new client.LocalesClient(endpoints.locales);
const mesasClient = new client.MesasClient(endpoints.mesas);
const seguridadClient = new client.SeguridadClient(endpoints.seguridad);
const resultadosClient = new client.ResultadosClient(endpoints.resultados);
(async ()=>{
    const eleccionesResult = await eleccionesClient.call();
    const candidaturasResult = await candidaturasClient.call();
    const departamentosResult = await departamentosClient.call();
    const distritosResult = await distritosClient.call();
    const zonasResult = await zonasClient.call();
    const localesResult = await localesClient.call();
    const mesasResult = await mesasClient.callFormat(seguridadClient);
    const resultado = await resultadosClient.call(mesasResult[0]);
    // Filtrar solo presidencia
    const mesasPresidencia = mesasResult.filter(m => m.candidatura === '1');
    const resultadoPresidencia = []
    let currentValue = 0
    let total = mesasPresidencia.length
    let totalTimeDown = 0
    let downloads = 0
    console.log(`Descargando actas de presidencia`);
    let lastTime = new Date().getTime();
    progressBar.start(total, 0);
    for(let m of mesasPresidencia){
        currentValue++;
        let currentTime = new Date().getTime();
        const elapsedTime = (currentTime - lastTime); // Ultimo tiempo transcurrido en millisegundos
        if(elapsedTime>200){
            totalTimeDown=totalTimeDown+elapsedTime
            downloads++
        }
        const estimatedTimeRemaining = (totalTimeDown / downloads) * (total - currentValue)  / 1000; // Tiempo restante estimado en segundos
        progressBar.update(currentValue, {estimatedTimeRemaining: formatTime(estimatedTimeRemaining)});
        const r = await resultadosClient.call(m);
        resultadoPresidencia.push(r);
        lastTime = currentTime;
    }
    generateCsv(resultadoPresidencia,'presidencia')
})();

function formatTime (segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = Math.floor(segundos % 60);
  
    const tiempoFormateado = [horas, minutos, segs]
      .map((unidad) => unidad.toString().padStart(2, '0'))
      .join(':');
  
    return tiempoFormateado;
  }

function generateCsv(mesas: any[], file:string) {
    const headers = Object.keys(mesas[0]);
    const csvHeader = headers.join(',') + '\n';
    const csvLines = mesas.map(obj => headers.map(header => obj[header]).join(',')).join('\n');
    const csvContent = csvHeader + csvLines;
    fs.writeFileSync(`./data/result/${file}.csv`, csvContent, 'utf8');
}