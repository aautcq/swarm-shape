interface Position {
  x: number
  y: number
}

interface Particle {
  size: number
  position: Position
  destination: Position
}

type MakeOptionalUndefined<T> = {
  [K in keyof T]: T[K] | undefined
}

export interface AnimationOptions {
  particles?: {
    /**
     * Particle generation mode
     * - sides: Particles are generated on the sides of the canvas
     * - evenly: Particles are generated evenly on the canvas
     * - inside: Particles are generated inside the shape
     * @defaultValue 'inside'
     */
    mode?: 'sides' | 'evenly' | 'inside'

    /**
     * Particle size
     * @defaultValue 1
     */
    size?: number

    /**
     * Number of particles
     * @defaultValue 2_000
     */
    amount?: number
  }
  physics?: {
    /**
     * Noise factor
     * @defaultValue 1.5
     */
    noise?: number

    /**
     * Drift factor
     * @defaultValue 1
     */
    drift?: number

    /**
     * Repulsion factor
     * @defaultValue 0.01
     */
    repulsion?: number
  }
}

function createShape(pathData: Path2D | string) {
  return pathData instanceof Path2D
    ? pathData :
    new Path2D(pathData)
}

function getRandomPointInsideShape(
  shape: Path2D,
  canvas: HTMLCanvasElement | null,
  ctx: CanvasRenderingContext2D | null
) {
  if (!canvas || !ctx) {
    throw new Error('Canvas not found')
  }

  let x, y
  do {
    x = Math.random() * canvas.width
    y = Math.random() * canvas.height
  }
  while (!ctx.isPointInPath(shape, x, y, 'evenodd'))
  return { x, y }
}

function drawParticle(particle: Particle, ctx: CanvasRenderingContext2D | null) {
  if (!ctx) {
    throw new Error('Canvas not found')
  }

  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2)
  ctx.closePath()
  ctx.fill()
}

function updateParticle(
  particle: Particle,
  physics: { noise: number, drift: number, repulsion: number },
  characteristicSize: number,
  cursor: MakeOptionalUndefined<Position>
) {
  // Random noise
  particle.position.x += (Math.random() * 2 - 1) * physics.noise
  particle.position.y += (Math.random() * 2 - 1) * physics.noise

  // Distance to destination
  const ddest = Math.sqrt((particle.position.x - particle.destination.x) ** 2 + (particle.position.y - particle.destination.y) ** 2)

  // Global drift towards destination
  particle.position.x += (particle.destination.x - particle.position.x) / ddest * physics.drift
  particle.position.y += (particle.destination.y - particle.position.y) / ddest * physics.drift

  if (cursor.x && cursor.y) {
    // Distance to cursor
    const dcursor = Math.sqrt((particle.position.x - cursor.x) ** 2 + (particle.position.y - cursor.y) ** 2)

    // Cursor repulsion
    particle.position.x += (particle.position.x - cursor.x) / dcursor * (characteristicSize / dcursor) ** 2 * physics.repulsion
    particle.position.y += (particle.position.y - cursor.y) / dcursor * (characteristicSize / dcursor) ** 2 * physics.repulsion
  }
}

export function computeAnimation(
  canvas: HTMLCanvasElement | string,
  path: Path2D | string,
  options?: AnimationOptions
) {
  const canvasEl = canvas instanceof HTMLCanvasElement
    ? canvas
    : document.getElementById(canvas) as HTMLCanvasElement | null

  if (!canvasEl) {
    throw new Error('Canvas not found')
  }

  // Default options
  const particleOptions = {
    mode: options?.particles?.mode ?? 'inside',
    size: options?.particles?.size ?? 1,
    amount: options?.particles?.amount ?? 2_000,
  }

  const physicsOptions = {
    noise: options?.physics?.noise ?? 1.5,
    drift: options?.physics?.drift ?? 1,
    repulsion: options?.physics?.repulsion ?? 0.01,
  }

  const ctx = canvasEl.getContext('2d')
  const characteristicSize = (canvasEl.height + canvasEl.width) / 2

  const cursor: MakeOptionalUndefined<Position> = {
    x: undefined,
    y: undefined,
  }

  const particles: Particle[] = []

  function init() {
    if (!canvasEl) {
      throw new Error('Canvas not found')
    }

    const shape = createShape(path)

    for (let i = 0; i < particleOptions.amount; i++) {
      const destination = getRandomPointInsideShape(shape, canvasEl, ctx)

      let x, y
      if (particleOptions.mode === 'sides') {
        // Particles are generated on the sides of the canvas
        const rand = Math.random()
        const side = rand < 0.25 ? 'top' : rand < 0.5 ? 'right' : rand < 0.75 ? 'bottom' : 'left'
        x = side === 'top' || side === 'bottom' ? Math.random() * canvasEl.width : side === 'left' ? 0 : canvasEl.width
        y = side === 'left' || side === 'right' ? Math.random() * canvasEl.height : side === 'top' ? 0 : canvasEl.height
      } else if (particleOptions.mode === 'evenly') {
        // Particles are evenly distributed on the canvas
        x = Math.random() * canvasEl.width
        y = Math.random() * canvasEl.height
      } else if (particleOptions.mode === 'inside') {
        // Particles are generated inside the shape
        x = destination.x
        y = destination.y
      }
      else {
        throw new Error('Invalid particle mode')
      }

      particles.push({
        position: { x, y },
        destination,
        size: particleOptions.size,
      })
    }
  }

  function animate() {
    if (!canvasEl || !ctx) {
      throw new Error('Canvas not found')
    }

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
    particles.forEach((particle) => {
      updateParticle(particle, physicsOptions, characteristicSize, cursor)
      drawParticle(particle, ctx)
    })
    requestAnimationFrame(animate)
  }

  canvasEl.addEventListener('mousemove', ({ clientX, clientY }) => {
    cursor.x = clientX
    cursor.y = clientY
  })

  canvasEl.addEventListener('mouseleave', () => {
    cursor.x = undefined
    cursor.y = undefined
  })

  return { init, animate }
}
