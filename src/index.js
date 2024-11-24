import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

import * as utils from './utils';
import './styles.css';
import PHOTOS from './photos.json';

const FETCHING_SPEED = 4000;

const GRID_COLS = 6;
const GRID_ROWS = 2;
const TOTAL_TILES = GRID_COLS * GRID_ROWS;
const tileWidth = window.innerWidth / GRID_COLS;
const tileHeight = window.innerHeight / GRID_ROWS;
let occupiedTiles = []; // Track which tiles are occupied


// Main Deck component that renders a collection of draggable cards
export default function Deck({ initialCards }) {
  // State to keep track of cards that have been flicked out and current cards
  const [gone] = useState(() => new Set());
  const [cards, setCards] = useState(initialCards); // State to manage the current cards

  // Define the spacing and center position for the deck
  const spreadX = 100; // Horizontal spacing between cards
  const spreadY = 50;  // Vertical spacing between cards
  const deckCenterX = window.innerWidth / 2;
  const deckCenterY = window.innerHeight / 2;
  // Set screen dimensions and vertical offset
  // const screenHeight = window.innerHeight;
  // const verticalOffset = 50;

  //var { new_x, new_y } = getRandomTilePosition();
  // Set up spring animations for the cards
  const [props, api] = useSprings(cards.length, (i) => ({
    ...utils.to(i),
    from: {
      x: deckCenterX - (cards.length / 2) * spreadX + i * spreadX,  /// 200
      y: deckCenterY - (cards.length / 2) * spreadY + i * spreadY,
      // > (deckCenterY*2 - cards.length)
      // ? deckCenterY
      // : deckCenterY - (cards.length / 2) * spreadY + i * spreadY,
      // y: (deckCenterY - (prevCards.length / 2) * spreadY + (prevCards.length) * spreadY) > (h - cards.length)
      // ? deckCenterY // Reset y if it exceeds the specified limit
      // : deckCenterY - (prevCards.length / 2) * spreadY + (prevCards.length) * spreadY,
      rot: 0,
      scale: 1,
    },
  }));

  function getRandomEmptyTile() {
    const availableTiles = Array.from({ length: TOTAL_TILES }, (_, i) => i).filter(i => !occupiedTiles.includes(i));
    if (availableTiles.length === 0) {
      // Reset occupied tiles if all are filled
      occupiedTiles = [];
    }
    const randomTile = availableTiles[Math.floor(Math.random() * availableTiles.length)];
    occupiedTiles.push(randomTile); // Mark tile as occupied
    return randomTile;
  }

  function getTilePosition(tileIndex) {
    const x = (tileIndex % GRID_COLS) * tileWidth;
    const y = Math.floor(tileIndex / GRID_COLS) * tileHeight;
    return { x, y };
  }

  function getRandomTilePosition() {
    const tileIndex = getRandomEmptyTile();
    return getTilePosition(tileIndex);
  }

  // const handleNewImage = (imageUrl) => {
  //   const newCard = { url: imageUrl, orientation: 'portrait' };
    
  //   // Use the callback parameter in setCards to access prevCards safely
  //   setCards((prevCards) => {
  //     // Calculate the Y position for the next card
  //     const nextCardY = deckCenterY - (prevCards.length / 2) * spreadY + (prevCards.length) * spreadY;
  
  //     // Check if the next card exceeds screen height
  //     const shouldResetStack = nextCardY + 200 > screenHeight; // Adjust 200 if card height is different
  
  //     // Trigger animation for the new card
  //     api.start((i) => ({
  //       ...utils.to(i),
  //       from: {
  //         x: shouldResetStack
  //           ? deckCenterX // Reset to deck center X if out of bounds
  //           : deckCenterX - (prevCards.length / 2) * spreadX + (prevCards.length) * spreadX,
  //         y: shouldResetStack
  //           ? deckCenterY + (prevCards.length % 2 === 0 ? verticalOffset : 0) // Apply offset every other time
  //           : nextCardY,
  //         rot: 0,
  //         scale: 1,
  //       },
  //     }));
  
  //     // Return the updated cards array with the new card added
  //     return [...prevCards, newCard];
  //   });
  // };
  
// 
  // Function to handle new image arrival
  // const handleNewImage = (imageUrl) => {
  //   // Add the new image to the current cards
  //   const newCard = { url: imageUrl, orientation: 'landscape' }; // Adjust orientation as needed
  //   setCards((prevCards) => [...prevCards, newCard]); // Append new card to the existing cards
  //   //var { new_x, new_y } = getRandomTilePosition();
  //   // Trigger animation for the new card
  //   // const w = window.innerWidth;
  //   // const h = window.innerHeight; 

  //   api.start((i) => ({
  //     ...utils.to(i),
      
  //     from: {
  //       x: deckCenterX - (cards.length / 2) * spreadX + (prevCards.length) * spreadX, // Calculate x position
  //       y: deckCenterY - (cards.length / 2) * spreadY + (prevCards.length) * spreadY > (deckCenterY*2 - cards.length)
  //         ? deckCenterY // Reset y if it exceeds the specified limit
  //         : deckCenterY - (cards.length / 2) * spreadY + (prevCards.length) * spreadY,

  //       rot: 0,
  //       scale: 1,
  //     },
  //   }));
  // };

  const handleNewImage = (imageUrl) => {
    const newCard = { url: imageUrl, orientation: 'landscape' }; // Adjust orientation as needed
  
    setCards((prevCards) => {
      const updatedCards = [...prevCards, newCard]; // Append the new card to the cards array
  
      api.start((i) => {
        // Calculate the new x and y positions with a modulo reset after 15 images
        const resetIndex = i % 15; // Reset positions after every 15 images
        const x = deckCenterX - (15 / 2) * spreadX + resetIndex * spreadX; // Use modulo index for x
        const y = deckCenterY - (15 / 2) * spreadY + resetIndex * spreadY; // Use modulo index for y
  
        return {
          ...utils.to(i),
          from: {
            x, // Use calculated x position
            y, // Use calculated y position
            rot: 0,
            scale: 1,
          },
        };
      });
  
      return updatedCards; // Update the cards state
    });
  };
  


  useEffect(() => {
    const checkForNewImages = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/check-for-new-images');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const newImages = await response.json(); // Get the list of uploaded images
  
        // Only update if there are new images
        if (newImages.length > 0) {
          newImages.forEach(imageUrl => handleNewImage(imageUrl)); // Add each new image
        }
      } catch (error) {
        console.error('Error fetching new images:', error);
      }
    };
  
    const interval = setInterval(checkForNewImages, FETCHING_SPEED); // Check every X mseconds
    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);
  


  // Bind drag event handler to the cards
  const bind = useDrag(({ args: [index], active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
    const trigger = vx > 0.2;
    if (!active && trigger) gone.add(index);

    // Update the spring animation properties based on drag state
    api.start((i) => {
      if (index !== i) return;
      const isGone = gone.has(index);
      const x = isGone ? (200 + window.innerWidth) * xDir : active ? mx : 0;
      const rot = mx / 100 + (isGone ? xDir * 10 * vx : 0);
      const scale = active ? 1.1 : 1;
      return {
        x,
        rot,
        scale,
        delay: undefined,
        config: { friction: 50, tension: active ? 800 : isGone ? 200 : 500 },
      };
    });

    // Reset the gone set and restart animations if all cards are flicked out
    if (!active && gone.size === cards.length)
      setTimeout(() => {
        gone.clear();
        api.start((i) => utils.to(i));
      }, 600);
  });

  // Render the card container with animated cards
  return (
    <div id="card-container">
      {props.map(({ x, y, rot, scale }, i) => (
        <animated.div
          key={i}
          style={{
            transform: interpolate([x, y, rot], (x, y, rot) => `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`),
            scale: scale,
          }}
          className="card"
        >
          <animated.div
            {...bind(i)} // Bind drag events to the card
            style={{
              backgroundImage: `url(${process.env.PUBLIC_URL}/img/${cards[i].url})`,
              width: cards[i].orientation === 'portrait' ? '240px' : '320px',
              height: cards[i].orientation === 'portrait' ? '320px' : '240px',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              transform: interpolate([scale], (scale) => `scale(${scale})`),
            }}
            className="card-content"
          />
        </animated.div>
      ))}
    </div>
  );
}

// Render the Deck component into the root element
const rootElement = document.getElementById('photo-deck');
const root = createRoot(rootElement);
root.render(<Deck initialCards={PHOTOS} />);
