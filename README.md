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
| `C`       | Cambiar skin de la nave |

## Puntuación

| Asteroide | Puntos |
| --------- | ------ |
| Grande    | 20     |
| Mediano   | 50     |
| Pequeño   | 100    |

Con la skin **Titán** activa, cada valor se multiplica por 2 (40 / 100 / 200).

## Power-ups

| Power-up     | Efecto                                                     |
| ------------ | ---------------------------------------------------------- |
| ⚡ Velocidad  | Moverse el doble de velocidad durante 5 segundos           |
| 🛡 Escudo     | Inmune a los impactos durante 5 segundos                   |
| ∴ Triple      | Disparar 3 balas en abanico estrecho (±4°) durante 5 segundos |

- Caen con ~20 % de probabilidad total al destruir un asteroide (incluidos los fragmentos); el tipo es aleatorio por igual entre los tres.
- ⚡ solo aumenta el empuje: aceleración y velocidad máxima ×2 (el giro no cambia).
- 🛡 anula el daño de asteroides y estrellas fugaces: el impacto repele al asteroide (no lo destruye ni suma puntos) y la burbuja brilla al absorberlo.
- ∴ añade 2 balas extra por disparo con ±4° de dispersión desde la nariz (el cooldown no cambia).
- Todos duran 5 s; recoger otro del mismo tipo reinicia el contador. Si nadie lo toma, desaparece a los 10 s.
- El tiempo restante de cada power-up activo se muestra en el HUD.

## Estrella fugaz

Asteroide especial de color ámbar con estela que recorre el campo:

- Aparece cada 6–12 s en un punto seguro para la nave (un poco más frecuente en niveles altos).
- Se mueve a ~300 px/s, mucho más rápido que cualquier asteroide normal.
- Desaparece a los 6 s: se desvanece y parpadea durante el último segundo.
- Se destruye como cualquier asteroide (50 pts por la original, 100 por fragmento) y se parte en dos fragmentos igual de rápidos que heredan el tiempo restante.
- No bloquea el cambio de nivel: si queda una estrella viva, el nivel avanza igual.

## Skins

Piel de la nave: cambia la silueta, el color de la línea y la llama del propulsor (los iconos de vida del HUD también se adaptan). Casi todas son pura cosmética; **Titán** es la excepción (ver abajo).

| Tecla | Efecto |
| ----- | ------ |
| `C`   | Cambia a la siguiente skin y muestra su nombre brevemente en el HUD |

| # | Skin | Línea | Forma |
| - | ---- | ----- | ----- |
| 0 | Clásica | blanca | Triángulo con muesca trasera (la original) |
| 1 | Bisturí | cian | Nariz alargada y estrecha |
| 2 | Cuña | ámbar | Alas anchas en flecha |
| 3 | Cometa | rosa | Cuerpo corto con doble aleta trasera |
| 4 | Trueno | violeta | Rombo partido |
| 5 | Titán | morada | Delta ancho y robusto |

- La mayoría es pura cosmética: comparten física, velocidad de disparo y radio de colisión.
- **Titán** mide el **doble** que la nave original (dibujo, nariz y radio de colisión ×2 → 24 px; la burbuja del escudo y los iconos de vida también se amplían), pero a cambio otorga el **doble de puntos** por cada asteroide destruido. El HUD muestra `×2` junto a la puntuación y el aviso de skin muestra `×2 PTS`. El mayor tamaño implica un objetivo más grande para los asteroides.
- Se puede cambiar en cualquier momento (durante la partida o en el game over).
- La skin elegida se guarda en `localStorage` y persiste al recargar la página.

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- Power-ups ⚡ Velocidad, 🛡 Escudo y ∴ Triple con indicador en el HUD
- Escudo con burbuja visible que repele asteroides y estrellas fugaces
- Estrella fugaz: asteroide rápido con estela que se desvanece con el tiempo
- 6 skins de nave seleccionables con `C`, guardadas en el navegador (Titán: 2× de tamaño y puntos dobles)
