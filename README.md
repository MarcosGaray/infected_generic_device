# Red interna infectada — Simulador educativo GPON

Simulación 3D interactiva y guía genérica para entender cómo un dispositivo comprometido en un hogar puede afectar una red de fibra GPON y qué medidas ayudan a mitigarlo.

> **Contenido ilustrativo y educativo.** No contiene datos reales de empresas, clientes, redes, herramientas internas ni capturas de sistemas productivos. Las cifras y los procedimientos son ejemplos.

## Módulos

- **Guía (vista inicial):** resumen de uso, alcance, módulos y disclaimer.
- **Simulador 3D:** casa, barrio y red GPON con escenas guiadas, telemetría y pruebas de mitigación.
- **Presentación:** 9 diapositivas genéricas sobre el problema, el impacto, la detección y las soluciones.
- **Diagrama de flujo:** flujo general de detección, acompañamiento y resolución.

## Desarrollo

```bash
npm install
npm run dev
```

## Build y verificación

```bash
npm run build
npm run preview
npm run typecheck
```

El build se genera en `dist/`.

## Abrir sin servidor

No abras `dist/index.html` con doble clic: los navegadores bloquean los módulos ES, el CSS y el JavaScript por CORS cuando se usa `file://`.

Opciones:

- **Recomendado:** `npm run preview` y abrir la URL HTTP que muestra la terminal.
- **Archivo único:** `npm run build:offline` y abrir `dist/offline.html`. Ese archivo tiene CSS, JavaScript, fuente y favicon embebidos.

## Estructura

```text
src/
  components/
    flowchart/       Diagrama interactivo
    layout/          Topbar y guía
    presentation/    Plantillas de diapositivas
    simulator/       Simulador 3D y telemetría
    visuals/         Ilustraciones SVG genéricas
  data/              Contenido de diapositivas, flujo y simulación
  styles/            Estilos globales y por módulo
  assets/            Fuente Raleway
public/              Favicon y archivos estáticos
scripts/             Build offline opcional
```

## Política de contenido

- No agregar nombres de empresas, clientes, herramientas internas, proveedores, modelos de equipos, IPs, MACs, seriales ni capturas reales.
- Usar ejemplos genéricos y rangos ilustrativos.
- Mantener el aviso de contenido ilustrativo visible en la interfaz.
- No incluir credenciales, tokens ni archivos `.env`.

## Créditos

- [Three.js](https://threejs.org/) — licencia MIT.
- Raleway — SIL Open Font License.
- [Vite](https://vite.dev/) y [TypeScript](https://www.typescriptlang.org/).

## Despliegue

Sitio publicado en GitHub Pages: <https://marcosgaray.github.io/infected_generic_device/>

El workflow `.github/workflows/deploy.yml` compila con Vite y publica `dist/` en cada push a `main`.
