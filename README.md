# @aautcq/swarm-shape

![Image](https://github.com/user-attachments/assets/cde98d2f-dd9c-44ac-89fa-b0389da30adf)

Canvas 2D path made out of a particles swarm.

## Install

```bash
npm i @aautcq/swarm-shape
```

## Usage

### Basic

```ts
import { computeAnimation } from '@aautcq/swarm-shape'

const { init, animate } = computeAnimation(
  document.getElementById('my-canvas'), // HTML canvas element or id
  new Path2D('Your path data'), // Path data or Path2D object
  options
)

// Creates the 2D shape on the canvas and creates particles
init()

// Launches the animation
animate()
```

### Options

The 3rd argument to the `computeAnimation` function is a facultative options object. Here are the default values:

```ts
const options = {
  particles: {
    /**
     * Particle generation mode
     * - sides: Particles are generated on the sides of the canvas
     * - evenly: Particles are generated evenly on the canvas
     * - inside: Particles are generated inside the shape
     */
    mode: 'inside',

    /** Particle size */
    size: 1,

    /** Number of particles */
    amount: 2000,
  },
  physics: {
    /** Noise factor */
    noise: 1.5,

    /** Drift factor */
    drift: 1,

    /** Repulsion factor */
    repulsion: 0.01,
  },
}
```
