# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. Incluye power-ups que caen al destruir asteroides.

## Tecnologías

- **HTML5 Canvas** — renderizado 2D
- **JavaScript (ES6+)** — lógica del juego en un solo archivo `game.js`
- Sin frameworks, sin bundler, sin dependencias

## Cómo correr

Abre `index.html` directamente en el navegador (doble clic), o usa un servidor local:

```bash
npx serve .
```

Luego visita `http://localhost:3000`.

## Controles

| Tecla     | Acción     |
| --------- | ---------- |
| `←` `→`   | Rotar nave |
| `↑`       | Propulsar  |
| `Espacio` | Disparar   |

## Puntuación

| Asteroide | Puntos |
| --------- | ------ |
| Grande    | 20     |
| Mediano   | 50     |
| Pequeño   | 100    |

## Power-ups

| Power-up    | Efecto                                            |
| ----------- | ------------------------------------------------- |
| ⚡ Velocidad | Moverse el doble de velocidad durante 5 segundos |

- Caen con ~20 % de probabilidad al destruir un asteroide (incluidos los fragmentos).
- Solo aumenta el empuje: aceleración y velocidad máxima ×2 (el giro no cambia).
- Dura 5 s; recoger otro reinicia el contador. Si nadie lo toma, desaparece a los 10 s.
- El tiempo restante se muestra en el HUD mientras está activo.

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- Power-up ⚡ Velocidad con indicador en el HUD
