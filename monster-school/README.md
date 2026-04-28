# 🧟 Monster School: Truth or Fang?

Juego educativo multijugador en tiempo real inspirado en Hombres Lobo, para practicar *subject pronouns* y el verbo *to be*.

## Requisitos
- Node.js 18+

## Cómo correr

### 1. Servidor (terminal 1)
```bash
cd monster-school/server
npm start
```
Corre en `http://localhost:3001`

### 2. Cliente (terminal 2)
```bash
cd monster-school/client
npm run dev
```
Abre `http://localhost:5173`

## Cómo jugar

1. El **profesor/host** abre el cliente, elige "Host a Game", ingresa su nombre y crea la sala.
2. Se muestra un **código de sala** y un **QR** para que los estudiantes se unan.
3. Los estudiantes escanean el QR o van a la URL e ingresan el código.
4. El host presiona **Start Game** cuando todos estén listos (mínimo 6 jugadores).
5. Cada jugador recibe su **carta de rol** en privado en su dispositivo.
6. El juego alterna entre fases de **Noche** (acciones secretas) y **Día** (debate + votación).

## Roles

| Rol | Tipo | Habilidad |
|-----|------|-----------|
| Wolfman | Monstruo | Vota para eliminar normies |
| Lord Vampire | Monstruo | Transforma normies cada 2 turnos |
| Vampire | Monstruo | Ayuda al Lord Vampire |
| Mommy | Monstruo | Silencia a 1 normie por 5 turnos |
| Monster Hunter | Normie | Elimina 1 jugador cada 2 turnos |
| The Seeker | Normie | Ve quién abre los ojos de noche |
| The Protector | Normie | Salva a 1 jugador (2 veces) |
| Siblings | Normie | Si uno muere, el otro también |
| The Shaman | Normie | Convierte vampiros de vuelta cada 3 turnos |
| Inspector Grammar | Moderador | Verifica 1 jugador por noche |
| Normie | Normie | Sin habilidad especial |

## Cartas Bonus (uso único)
- 🌕 **Full Moon** — Wolfman elimina un jugador extra
- 🛡️ **Silver Shield** — 4 fragmentos que dan inmunidad a 1 ataque
- 🧄 **Garlic Necklace** — Inmunidad contra Lord Vampire (x2)
