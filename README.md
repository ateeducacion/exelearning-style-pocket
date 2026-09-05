# eXeLearning Pocket

Estilo de eXeLearning con una consola portátil, pantalla verde y botones funcionales.
El ejemplo incluye las 11 páginas de **El ciclo del agua**, con actividades de ordenar
las fases y verdadero/falso.

[Descargar estilo Pocket](https://github.com/ateeducacion/exelearning-style-pocket/raw/refs/heads/main/content/resources/pocket.zip) · [Abrir el ejemplo en eXeLearning](https://static.exelearning.dev/?url=https://github-proxy.exelearning.dev/?repo=ateeducacion/exelearning-style-pocket&branch=main)

Importa `pocket.zip` desde el gestor de estilos de eXeLearning 3 o posterior.
La raíz del repositorio es el ejemplo ELPX descomprimido; `theme/` contiene el estilo.
Los menús se generan desde las páginas y los iDevices de cada recurso, sin nombres
ni direcciones del ejemplo escritos en el JavaScript del tema.

## Controles

- **START**: menú de páginas.
- **↑↓**: seleccionar una opción o desplazar el contenido.
- **A / Enter**: entrar. Dentro de un iDevice, A enfoca el primer control y después lo pulsa.
- **←→** dentro del iDevice: recorrer enlaces, respuestas y botones. También puedes usar Tab.
- **B / Escape**: volver hasta la portada. Las páginas con un único iDevice se abren directamente.
- **SELECT**: activar o desactivar el sonido.
- **OFF / ON**: apagar la pantalla y volver a la portada al encender.
- **AMPLIAR**: aumentar la pantalla para leer y hacer actividades. Recupera el color de las imágenes.

Los iDevices conservan sus nodos y respuestas al entrar y salir del menú.
El teclado mantiene su comportamiento normal al escribir en un campo. Las páginas
se cargan con la navegación nativa de eXeLearning. Sin JavaScript, el contenido
sigue disponible en el formato de lectura normal.

## Vista previa y paquetes

```sh
python3 -m http.server 1314 --bind 127.0.0.1
python3 scripts/package.py
python3 scripts/check.py
```

Abre <http://localhost:1314/>. Los paquetes quedan en `dist/pocket.zip` y
`dist/ciclo-del-agua.elpx`; el ZIP del estilo también se copia a `content/resources/`
para descargarlo desde el ejemplo.

Las comprobaciones de navegador usan Chrome y el Playwright que ya incluye eXeLearning:

```sh
NODE_PATH=/ruta/a/exelearning/node_modules node scripts/check-browser.cjs
```

Comprueban las 11 páginas, los iDevices originales, los ejercicios completos,
el regreso a portada, el apagado, el contraste de selección y los tamaños móviles.
Para regenerar la miniatura, añade `POCKET_SCREENSHOT=theme/screenshot.png` al comando.

## Créditos y licencias

Carcasa adaptada del portfolio de Ernesto Serrano; tema bajo [GPL-3.0](theme/LICENSE).
Unidad didáctica, ilustraciones e iconos reutilizados del estilo Spectrum 128K del
Área de Tecnología Educativa del Gobierno de Canarias, bajo CC0 1.0.
VT323, de Peter Hull, bajo [SIL OFL 1.1](theme/fonts/VT323-LICENSE.txt).
Los archivos de eXeLearning y sus bibliotecas conservan sus licencias originales.
