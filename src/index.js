import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useSprings, animated, to as interpolate } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'

import * as utils from './utils'
import './styles.css'
import PHOTOS from './photos.json'

export default function Deck({ cards }) {
  const [gone] = useState(() => new Set()) // The set flags all the cards that are flicked out

  const spreadX = 100 // Horizontal spacing between cards
  const spreadY = 50  // Vertical spacing between cards
  const deckCenterX = window.innerWidth / 2
  const deckCenterY = window.innerHeight / 2

  const [props, api] = useSprings(cards.length, (i) => ({
    ...utils.to(i),
    from: {
      x: deckCenterX - (cards.length / 2) * spreadX + i * spreadX,
      y: deckCenterY - (cards.length / 2) * spreadY + i * spreadY,
      rot: 0,
      scale: 1
    }
  }))

  const bind = useDrag(({ args: [index], active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
    const trigger = vx > 0.2
    if (!active && trigger) gone.add(index)
    api.start((i) => {
      if (index !== i) return
      const isGone = gone.has(index)
      const x = isGone ? (200 + window.innerWidth) * xDir : active ? mx : 0
      const rot = mx / 100 + (isGone ? xDir * 10 * vx : 0)
      const scale = active ? 1.1 : 1
      return {
        x,
        rot,
        scale,
        delay: undefined,
        config: { friction: 50, tension: active ? 800 : isGone ? 200 : 500 }
      }
    })
    if (!active && gone.size === cards.length)
      setTimeout(() => {
        gone.clear()
        api.start((i) => utils.to(i))
      }, 600)
  })

  return (
    <div id="card-container">
      {props.map(({ x, y, rot, scale }, i) => (
        <animated.div
          key={i}
          style={{
            transform: interpolate([x, y, rot], (x, y, rot) => `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`), // Apply translation and rotation here
            scale: scale,
          }}
          className="card"
        >
          {/* The image container */}
          <animated.div
            {...bind(i)}
            style={{
		    backgroundImage: `url(${process.env.PUBLIC_URL}/img/${cards[i].url})`,
		    width: cards[i].orientation === 'portrait' ? '240px' : '320px',
		    height: cards[i].orientation === 'portrait' ? '320px' : '240px',
		    backgroundRepeat: 'no-repeat',
		    backgroundSize: 'contain', // Ensure the whole image is visible without cropping
		    transform: interpolate([scale], (scale) => `scale(${scale})`), // Apply scale here
            }}
            className="card-content"
          />
        </animated.div>
      ))}
    </div>
  )
}

const rootElement = document.getElementById('photo-deck')
const root = createRoot(rootElement)
root.render(<Deck cards={PHOTOS} />)

