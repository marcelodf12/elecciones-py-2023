## Resultados
Los resultados se generan en la carpeta data

### data/cache
Se almacenan las llamadas a los servicios de TSJE

### data/certs/candidatura/departamento/distrito/id-colegio/
Se almacenan los certificados digitalizados. Solo para presidencia necesitará 2GB aproximadamente.

### data/result
Se almacenan los resultados en csv agrupado por candidatura
- PRESIDENTE.csv
- SENADORES.csv
- DIPUTADOS.csv
- GOBERNADOR.csv
- JUNTA.csv

### data/cache/presidencia-py-2023.xlsx
Datos extraidos para presidencia para el que no desee descargar todo.


## Running the app

```
# install dependencies
npm install

# run in dev mode
npm run dev

# generate build
npm run build

```