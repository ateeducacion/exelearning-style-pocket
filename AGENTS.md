# Pocket

- `theme/` es la fuente del estilo; la raíz es el ejemplo ELPX descomprimido.
- No modificar eXeLearning ni los otros repositorios de estilos para arreglar Pocket.
- Los menús deben salir del `#siteNav` y de los `.idevice_node` del documento exportado.
- Mover los nodos originales; no clonar ni reescribir iDevices, ni interceptar sus respuestas.
- B vuelve hasta la portada; encender abre la portada. La pantalla apagada oculta también pseudoelementos.
- Si una página tiene un solo iDevice, abrirlo sin un menú intermedio.
- Conservar el fondo azul claro, los controles táctiles, el teclado nativo en formularios y AMPLIAR.
- El botón «Edit with eXeLearning» es solo del ejemplo publicado: vive en `edit-in-exelearning.js`
  (raíz) y `package.py` lo añade al HTML. Nunca en `theme/`, o saldría en los recursos exportados.
- `python3 scripts/package.py` reconstruye ambos paquetes, el manifiesto de descarga y el enlace anterior.
- Validar con `python3 scripts/check.py` y `NODE_PATH=/ruta/a/exelearning/node_modules node scripts/check-browser.cjs`.
- Para validar una reexportación real, usar el CLI de eXeLearning desde su propio directorio:
  `bun dist/cli.js elp:export /ruta/al/ciclo-del-agua.elpx /tmp/pocket-roundtrip elpx`.
- El tema es GPL-3.0; el material didáctico reutilizado es CC0 y VT323 conserva OFL.
