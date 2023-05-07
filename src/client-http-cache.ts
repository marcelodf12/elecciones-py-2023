import fs from 'fs';
import path from 'path';
import cacheFetch from './cache'
import format from "string-template"
import fetch from 'isomorphic-fetch';
import { Mesa } from './mesa';

class ClientHttpCache {
  constructor(readonly endpoint: string) { }

  protected async retrive(url: string) {
    console.log('Call to ' + url);
    const response = await fetch(url);
    var txtData = await response.text();
    try {
      const jsonData = JSON.parse(txtData);
      return jsonData;
    } catch (error) {
      const jsonStartIndex = txtData.indexOf('{');
      const jsonData = JSON.parse(txtData.substring(jsonStartIndex));
      return jsonData
    }
  }
}


export class EleccionesCliente extends ClientHttpCache {
  @cacheFetch('1-elecciones')
  async call() {
    return this.retrive(this.endpoint);
  }
}

export class CandidaturaCliente extends ClientHttpCache {
  @cacheFetch('2-candidaturas')
  async call() {
    return this.retrive(this.endpoint);
  }
}

export class DepartamentoCliente extends ClientHttpCache {
  @cacheFetch('3-departamentos')
  async call() {
    return this.retrive(this.endpoint);
  }
}

export class DistritosClient extends ClientHttpCache {
  @cacheFetch('4-distritos')
  async call() {
    return this.retrive(this.endpoint);
  }
}

export class ZonasClient extends ClientHttpCache {
  @cacheFetch('5-zonas')
  async call() {
    return this.retrive(this.endpoint);
  }
}

export class LocalesClient extends ClientHttpCache {
  @cacheFetch('6-locales')
  async call() {
    return this.retrive(this.endpoint);
  }
}

export class MesasClient extends ClientHttpCache {
  @cacheFetch('7-mesas')
  async call() {
    return this.retrive(this.endpoint);
  }

  @cacheFetch('9-formateado')
  async callFormat(seguridadClient: SeguridadClient): Promise<Mesa[]> {
    const seguridad = await seguridadClient.call();
    //console.log(seguridad)
    const result = await this.call();
    const arrayResult: Mesa[] = []
    Object.keys(result).forEach(keyEleccion => {
      //console.log('result')
      const eleccion = result[keyEleccion]
      Object.keys(eleccion).forEach(keyCandidatura => {
        //console.log(' eleccion')
        const candidatura = eleccion[keyCandidatura]
        Object.keys(candidatura).forEach(keyDepartamento => {
          //console.log('  candidatura')
          const departamento = candidatura[keyDepartamento]
          Object.keys(departamento).forEach(keyDistrito => {
            //console.log('   departamento')
            const distrito = departamento[keyDistrito]
            Object.keys(distrito).forEach(keyZona => {
              //console.log('    distrito')
              const zona = distrito[keyZona]
              Object.keys(zona).forEach(keyLocalidad => {
                //console.log('     zona')
                const local = zona[keyLocalidad]
                Object.keys(local).forEach(keyMesa => {
                  const mesa = local[keyMesa]
                  let codigo = '0'
                  try {
                    codigo = seguridad[keyEleccion][keyDepartamento][keyDistrito][keyZona][keyLocalidad][keyMesa][keyCandidatura]
                  } catch (error) {

                    console.log('No se encontro', keyEleccion,
                      keyCandidatura,
                      keyDepartamento,
                      keyDistrito,
                      keyZona,
                      keyLocalidad,
                      keyMesa)
                  }
                  const mesaObj = new Mesa(
                    keyEleccion,
                    keyCandidatura,
                    keyDepartamento,
                    keyDistrito,
                    keyZona,
                    keyLocalidad,
                    keyMesa,
                    codigo
                  );
                  //console.log(mesaObj);
                  arrayResult.push(mesaObj);
                });
              });
            });
          });
        });
      });
    });
    console.log(seguridad)
    return arrayResult;
  }
}

export class SeguridadClient extends ClientHttpCache {
  @cacheFetch('8-mesas-con-seguridad')
  async call() {
    return this.retrive(this.endpoint);
  }
}

export class ResultadosClient extends ClientHttpCache {
  @cacheFetch('resultados')
  async call(mesa: Mesa) {
    const url = format(this.endpoint, Mesa.fromObj(mesa).toObj())
    const resultado = await this.retrive(url);
    const mapped = {
      "dep": resultado.cabecera.desDepartamento,
      "dist": resultado.cabecera.desDistrito,
      "zona": resultado.cabecera.desZona,
      "local": resultado.cabecera.desLocal,
      "mesa": resultado.cabecera.numMesa,
      "totProg": resultado.cabecera.totProg,
      "nocomputados": resultado.cabecera.nocomputados,
      "blancos": resultado.cabecera.blancos,
      "nulos": resultado.cabecera.nulos,
      //"desCandidatura": resultado.cabecera.desCandidatura,
      "detalles": resultado.detalle.map((d: { sigPartido: string; numLista: string; votos: string; }) => `${d.sigPartido}(${d.numLista}):${d.votos}`).join(',')
    }
    const cand = resultado.cabecera.desCandidatura.split(' ')[0]
    const dep = resultado.cabecera.desDepartamento
    const dist = resultado.cabecera.desDistrito
    const colegio = resultado.cabecera.desLocal.split('-')[0]
    const mesaNro = resultado.cabecera.numMesa
    saveJPG(resultado.jpeg, `./data/certs/${cand}/${dep}/${dist}/${colegio}/${mesaNro}.jpg`);
    return mapped
  }
}

function saveJPG (base64Image:string, outputPath:string) {
  // Creamos la carpeta
  ensureDirectoryExistence(outputPath);
  // Elimina el prefijo 'data:image/jpeg;base64,' del string base64 si está presente
  const base64Data = base64Image.replace(/^data:image\/jpeg;base64,/, '');
  // Convierte el string base64 en un buffer
  const imageBuffer = Buffer.from(base64Data, 'base64');
  // Escribe el buffer en el archivo de salida
  fs.writeFile(outputPath, imageBuffer, (error) => { });
}


function ensureDirectoryExistence(filePath: string) {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}