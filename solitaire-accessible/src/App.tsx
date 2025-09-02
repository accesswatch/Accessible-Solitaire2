import React, { useState, useEffect, useRef } from 'react';
import './App.css';


function App() {
  // Section refs for keyboard navigation
  const foundationSectionRef = useRef<HTMLHeadingElement | null>(null);
  const tableauSectionRef = useRef<HTMLHeadingElement | null>(null);
  const actionsSectionRef = useRef<HTMLHeadingElement | null>(null);

  // Track which main section is focused
  const [focusedMainSection, setFocusedMainSection] = useState<'foundation' | 'tableau' | 'actions' | null>(null);

  // Handle Tab/Shift+Tab navigation between main sections
  useEffect(() => {
    function handleSectionTab(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        if (!e.shiftKey) {
          if (focusedMainSection === null || focusedMainSection === 'actions') {
            setFocusedMainSection('foundation');
            setTimeout(() => foundationSectionRef.current?.focus(), 0);
            e.preventDefault();
          } else if (focusedMainSection === 'foundation') {
            setFocusedMainSection('tableau');
            setTimeout(() => tableauSectionRef.current?.focus(), 0);
            e.preventDefault();
          } else if (focusedMainSection === 'tableau') {
            setFocusedMainSection('actions');
            setTimeout(() => actionsSectionRef.current?.focus(), 0);
            e.preventDefault();
          }
        } else {
          // Shift+Tab
          if (focusedMainSection === null || focusedMainSection === 'foundation') {
            setFocusedMainSection('actions');
            setTimeout(() => actionsSectionRef.current?.focus(), 0);
            e.preventDefault();
          } else if (focusedMainSection === 'actions') {
            setFocusedMainSection('tableau');
            setTimeout(() => tableauSectionRef.current?.focus(), 0);
            e.preventDefault();
          } else if (focusedMainSection === 'tableau') {
            setFocusedMainSection('foundation');
            setTimeout(() => foundationSectionRef.current?.focus(), 0);
            e.preventDefault();
          }
        }
      }
    }
    window.addEventListener('keydown', handleSectionTab);
    return () => window.removeEventListener('keydown', handleSectionTab);
  }, [focusedMainSection]);
    // Foundation pile button refs
    const foundationRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track if focus was set by shortcut
  const [shortcutFocusIdx, setShortcutFocusIdx] = useState<number | null>(null);

  // Global keydown handler for Alt+1 through Alt+4
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if (e.altKey && ['1','2','3','4'].includes(e.key)) {
        const pileIdx = parseInt(e.key, 10) - 1;
        setFocusedSection('foundation');
        setFocusedIndex(pileIdx);
        setAnnouncement(`Jumped to foundation pile ${pileIdx + 1}.`);
        setShortcutFocusIdx(pileIdx);
        setTimeout(() => {
          foundationRefs.current[pileIdx]?.focus();
        }, 0);
        e.preventDefault();
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);
  // Move card from foundation to tableau
  // Move card from foundation to tableau
  // Used to skip game end check after mount
  const skipGameEndCheckOnMountRef = useRef(true);
  // Used to skip game end check after restart
  const skipGameEndCheckRef = useRef(false);
  // Color scheme state
  const [colorScheme, setColorScheme] = useState<'default' | 'dark' | 'contrast'>('default');
  // Handler for Give Up
  function handleGiveUp() {
    setGameEnded({ won: false, reason: 'You gave up. Game over.' });
    setAnnouncement('You gave up. Game over.');
    setSelectedCard(null);
  }

  // Handler for Restart
  function handleRestart() {
  setGameEnded(null);
  skipGameEndCheckRef.current = true;
  const { tableau, foundation, waste, stock } = dealGame();
  setGameState({ tableau, foundation, waste, stock });
  setAnnouncement('Game restarted.');
  setSelectedCard(null);
  }
  // Game end state
  const [gameEnded, setGameEnded] = useState<{ won: boolean; reason: string } | null>(null);

  // Card selection state
  const [selectedCard, setSelectedCard] = useState<{ section: string; pileIdx: number; cardIdx: number } | null>(null);
  // Focus management
  const [focusedSection, setFocusedSection] = useState<'stock' | 'waste' | 'foundation' | 'tableau' | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  // Add a refresh key to force re-render
  const [refreshKey, setRefreshKey] = useState(0);

  // Accessibility: ARIA live region
  const [announcement, setAnnouncement] = useState('');
  useEffect(() => {
    const region = document.getElementById('aria-live-region');
    if (region) {
      region.textContent = '';
      setTimeout(() => {
        region.textContent = announcement;
      }, 10);
    }
  }, [announcement]);

  // Keyboard handler
  function handleKeyDown(e: React.KeyboardEvent, section: 'stock' | 'waste' | 'foundation' | 'tableau', idx: number, cardIdxOverride?: number) {
  console.log('handleKeyDown', { key: e.key, section, idx, selectedCard });
    if (e.key === 'ArrowRight') {
      if (section === 'foundation' && idx < 3) setFocusedIndex(idx + 1);
      else if (section === 'tableau' && idx < 6) setFocusedIndex(idx + 1);
    } else if (e.key === 'ArrowLeft') {
      if (section === 'foundation' && idx > 0) setFocusedIndex(idx - 1);
      else if (section === 'tableau' && idx > 0) setFocusedIndex(idx - 1);
    } else if (e.key === 'ArrowDown') {
      if (section === 'foundation') { setFocusedSection('tableau'); setFocusedIndex(0); }
    } else if (e.key === 'ArrowUp') {
      if (section === 'tableau') { setFocusedSection('foundation'); setFocusedIndex(0); }
    } else if (e.key === 'Tab') {
      // Tab cycles through sections
      if (section === 'stock') { setFocusedSection('waste'); setFocusedIndex(0); }
      else if (section === 'waste') { setFocusedSection('foundation'); setFocusedIndex(0); }
      else if (section === 'foundation') { setFocusedSection('tableau'); setFocusedIndex(0); }
      else if (section === 'tableau') { setFocusedSection('stock'); setFocusedIndex(0); }
      e.preventDefault();
    } else if (e.altKey && ['1','2','3','4'].includes(e.key)) {
      // Alt+1 through Alt+4 jump to foundation piles 1-4
      const pileIdx = parseInt(e.key, 10) - 1;
      setFocusedSection('foundation');
      setFocusedIndex(pileIdx);
      setAnnouncement(`Jumped to foundation pile ${pileIdx + 1}.`);
      e.preventDefault();
    } else if (e.key === ' ') {
      setAnnouncement(announcement); // Reread live region
    } else if (e.key === 'Enter') {
      if (!selectedCard) {
        // Pick up card from tableau, waste, or foundation pile
        if (section === 'tableau' && gameState.tableau[idx].length > 0) {
          const pile = gameState.tableau[idx];
          let cardIdx = typeof cardIdxOverride === 'number' ? cardIdxOverride : -1;
          let cardInfo = '';
          if (cardIdx === -1) {
            for (let i = pile.length - 1; i >= 0; i--) {
              if (pile[i].faceUp) {
                cardIdx = i;
                cardInfo = `${pile[i].value} ${pile[i].suit}`;
                break;
              }
            }
          } else {
            cardInfo = `${pile[cardIdx].value} ${pile[cardIdx].suit}`;
          }
          if (cardIdx !== -1) {
            setSelectedCard({ section: 'tableau', pileIdx: idx, cardIdx });
            setTimeout(() => setAnnouncement(`Picked up ${cardInfo} from tableau pile ${idx + 1}. Move to a foundation or tableau pile and press Enter to drop.`), 0);
          } else {
            setTimeout(() => setAnnouncement('No face-up card to pick up.'), 0);
          }
        } else if (section === 'waste' && gameState.waste.length > 0) {
          const cardIdx = gameState.waste.length - 1;
          const card = gameState.waste[cardIdx];
          setSelectedCard({ section: 'waste', pileIdx: 0, cardIdx });
          setTimeout(() => setAnnouncement(`Picked up ${card.value} ${card.suit} from waste pile. Move to a foundation or tableau pile and press Enter to drop.`), 0);
        } else if (section === 'foundation' && gameState.foundation[idx].length > 0) {
          const cardIdx = gameState.foundation[idx].length - 1;
          const card = gameState.foundation[idx][cardIdx];
          setSelectedCard({ section: 'foundation', pileIdx: idx, cardIdx });
          setTimeout(() => setAnnouncement(`Picked up ${card.value} ${card.suit} from foundation pile ${idx + 1}. Move to a tableau pile and press Enter to drop.`), 0);
        } else {
          setTimeout(() => setAnnouncement('No card to pick up in this pile.'), 0);
        }
      } else {
        // Drop card on foundation or tableau pile
        if (selectedCard.section === 'tableau' && section === 'foundation') {
          setSelectedCard(null);
          handleTableauToFoundation(selectedCard.pileIdx, idx, success => {
            setAnnouncement(success ? `Dropped card on foundation pile ${idx + 1}.` : 'Invalid move: Cannot move tableau card to foundation.');
          });
        } else if (selectedCard.section === 'tableau' && section === 'tableau' && selectedCard.pileIdx !== idx) {
          setSelectedCard(null);
          handleTableauToTableau(selectedCard.pileIdx, idx, success => {
            setAnnouncement(success ? `Dropped card on tableau pile ${idx + 1}.` : 'Invalid move: Cannot move tableau card to tableau pile.');
          });
        } else if (selectedCard.section === 'waste' && section === 'foundation') {
          setSelectedCard(null);
          handleWasteToFoundation(idx, success => {
            setAnnouncement(success ? `Dropped card on foundation pile ${idx + 1}.` : 'Invalid move: Cannot move waste card to foundation.');
          });
        } else if (selectedCard.section === 'waste' && section === 'tableau') {
          setSelectedCard(null);
          handleWasteToTableau(idx, success => {
            setAnnouncement(success ? `Dropped card on tableau pile ${idx + 1}.` : 'Invalid move: Cannot move waste card to tableau pile.');
          });
        } else if (selectedCard.section === 'foundation' && section === 'tableau') {
          setSelectedCard(null);
          handleFoundationToTableau(selectedCard.pileIdx, idx, success => {
            setAnnouncement(success ? `Dropped card on tableau pile ${idx + 1}.` : 'Invalid move: Cannot move foundation card to tableau pile.');
          });
        } else {
          setAnnouncement('Invalid move. You can only drop tableau, waste, or foundation cards on valid piles.');
          setSelectedCard(null);
        }
  // Move card from foundation to tableau
      }
    }
  }
  // Card and pile types
  type Suit = '♠' | '♥' | '♦' | '♣';
  type Color = 'red' | 'black';
  type SuitText = 'Spades' | 'Hearts' | 'Diamonds' | 'Clubs';
  type Card = {
    suit: SuitText;
    value: string;
    color: Color;
    faceUp: boolean;
  };

  // Unified game state
  type GameState = {
    tableau: Card[][];
    foundation: Card[][];
    waste: Card[];
    stock: Card[];
  };
  const [gameState, setGameState] = useState<GameState>({
    tableau: [],
    foundation: [[], [], [], []],
    waste: [],
    stock: [],
  });

  // Helper: create a deck
  function createDeck(): Card[] {
    const suits: SuitText[] = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    return suits.flatMap(suit =>
      values.map(value => ({
        suit,
        value,
        color: suit === 'Spades' || suit === 'Clubs' ? 'black' : 'red',
        faceUp: false,
      }))
    );
  }

  // Shuffle helper
  function shuffle(deck: Card[]): Card[] {
    const d = [...deck];
    for (let i = d.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
  }

  // Initial game state
  function dealGame(): {
    tableau: Card[][];
    foundation: Card[][];
    waste: Card[];
    stock: Card[];
  } {
    const deck = shuffle(createDeck());
    const tableau: Card[][] = [];
    let deckIdx = 0;
    for (let i = 0; i < 7; i++) {
      const pile: Card[] = [];
      for (let j = 0; j <= i; j++) {
        const card = deck[deckIdx++];
        pile.push({ ...card, faceUp: j === i });
      }
      tableau.push(pile);
    }
    const stock = deck.slice(deckIdx);
    return {
      tableau,
      foundation: [[], [], [], []],
      waste: [],
      stock,
    };
  }

  // On mount, deal game
  useEffect(() => {
  skipGameEndCheckOnMountRef.current = true;
  const { tableau, foundation, waste, stock } = dealGame();
  setGameState({ tableau, foundation, waste, stock });
  setGameEnded(null);
  }, []);

  // Render a single card with Pick Up/Drop buttons
  function renderCard(card: Card, idx: number, pileType: 'tableau' | 'foundation' | 'waste' | 'stock', pileIdx: number, isTopFaceUp?: boolean) {
    const isSelected = selectedCard && selectedCard.section === pileType && selectedCard.pileIdx === pileIdx && selectedCard.cardIdx === idx;
    if (!card.faceUp) {
      // Face-down cards are not interactive
      return (
        <div
          className={`card-container face-down ${card.color}`}
          tabIndex={-1}
          aria-label={'Face-down card'}
        >
          <span className={`card-visual`}>🂠</span>
        </div>
      );
    }
    // Only top face-up card is focusable and a button
    if (pileType === 'tableau' && !isTopFaceUp) {
      return (
        <div
          className={`card-container face-up ${card.color}`}
          tabIndex={-1}
          aria-label={`${card.value} of ${card.suit}`}
        >
          <span className={`card-visual`}>
            {`${card.value} ${card.suit}`}
          </span>
        </div>
      );
    }
    // All face-up tableau cards are actionable for multi-card moves
    if (pileType === 'tableau' && card.faceUp) {
      return (
        <div
          className={`card-container face-up ${card.color}`}
          tabIndex={0}
          aria-label={`${card.value} of ${card.suit}`}
          role="button"
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleKeyDown(e, pileType, pileIdx, idx);
            }
          }}
          onClick={() => handleKeyDown({ key: 'Enter', preventDefault: () => {} } as any, pileType, pileIdx, idx)}
        >
          <span className={`card-visual`}>
            {`${card.value} ${card.suit}`}
          </span>
          {isSelected && (
            <span className="picked-up-indicator" aria-live="polite">Picked up {card.value} of {card.suit}</span>
          )}
        </div>
      );
    }
    // Top face-up tableau card is a button
    return (
      <div
        className={`card-container face-up ${card.color}`}
        tabIndex={0}
        aria-label={`${card.value} of ${card.suit}`}
        role="button"
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleKeyDown(e, pileType, pileIdx);
          }
        }}
        onClick={() => handleKeyDown({ key: 'Enter', preventDefault: () => {} } as any, pileType, pileIdx)}
      >
        <span className={`card-visual`}>
          {`${card.value} ${card.suit}`}
        </span>
        {isSelected && (
          <span className="picked-up-indicator" aria-live="polite">Picked up {card.value} of {card.suit}</span>
        )}
      </div>
    );
  }

  // Solitaire rules helpers
  // Check for win (all foundation piles have 13 cards)
  useEffect(() => {
    if (skipGameEndCheckRef.current) {
      skipGameEndCheckRef.current = false;
      return;
    }
    if (skipGameEndCheckOnMountRef.current) {
      skipGameEndCheckOnMountRef.current = false;
      return;
    }
    if (gameState.foundation.every(pile => pile.length === 13)) {
      setGameEnded({ won: true, reason: 'Congratulations! You have won the game.' });
      setAnnouncement('Congratulations! You have won the game.');
    } else {
      // Check for no more moves
      const canMove = (() => {
        // Can draw from stock
        if (gameState.stock.length > 0) return true;
        // Can recycle waste
        if (gameState.stock.length === 0 && gameState.waste.length > 0) return true;
        // Can move waste to foundation or tableau
        if (gameState.waste.length > 0) {
          const card = gameState.waste[gameState.waste.length - 1];
          if (gameState.foundation.some(pile => canMoveToFoundation(card, pile))) return true;
          if (gameState.tableau.some(pile => canMoveToTableau(card, pile))) return true;
        }
        // Can move tableau to foundation or tableau
        for (let i = 0; i < gameState.tableau.length; i++) {
          const pile = gameState.tableau[i];
          for (let j = 0; j < pile.length; j++) {
            if (!pile[j].faceUp) continue;
            // Move to foundation
            if (gameState.foundation.some(f => canMoveToFoundation(pile[j], f))) return true;
            // Move to another tableau
            for (let k = 0; k < gameState.tableau.length; k++) {
              if (k === i) continue;
              if (canMoveToTableau(pile[j], gameState.tableau[k])) return true;
              if (gameState.tableau[k].length === 0 && pile[j].value === 'K') return true;
            }
          }
        }
        return false;
      })();
      if (!canMove && !gameEnded) {
        setGameEnded({ won: false, reason: 'No more moves available. Game over.' });
        setAnnouncement('No more moves available. Game over.');
      }
    }
  }, [gameState]);
  const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  function canMoveToTableau(card: Card, destPile: Card[]): boolean {
    if (!card) return false;
    // Allow King to empty tableau pile
    if (destPile.length === 0) return card.value === 'K';
    const top = destPile[destPile.length - 1];
    return top && top.faceUp && top.color !== card.color && rankOrder.indexOf(card.value) === rankOrder.indexOf(top.value) - 1;
  }
  function canMoveToFoundation(card: Card, destPile: Card[]): boolean {
    if (!card) return false;
    // Allow Ace to empty foundation pile
    if (destPile.length === 0) return card.value === 'A';
    const top = destPile[destPile.length - 1];
    return top && top.suit === card.suit && rankOrder.indexOf(card.value) === rankOrder.indexOf(top.value) + 1;
  }

  // Draw from stock to waste
  function handleDrawStock() {
    setGameState(prev => {
      if (prev.stock.length === 0) {
        setAnnouncement('Stock reset from waste.');
        return {
          ...prev,
          stock: prev.waste.map(card => ({ ...card, faceUp: false })).reverse(),
          waste: [],
        };
      }
      const card = { ...prev.stock[prev.stock.length - 1], faceUp: true };
  setAnnouncement(`Drew ${card.value} ${card.suit} from stock.`);
      return {
        ...prev,
        stock: prev.stock.slice(0, -1),
        waste: [...prev.waste, card],
      };
    });
  }

  // Move logic
  function handleWasteToFoundation(foundationIdx: number, announce: (success: boolean) => void) {
    setGameState(prev => {
      if (prev.waste.length === 0) {
        setTimeout(() => announce(false), 0);
        return prev;
      }
      const card = prev.waste[prev.waste.length - 1];
      const destPile = prev.foundation[foundationIdx];
      if ((destPile.length === 0 && card.value === 'A') || canMoveToFoundation(card, destPile)) {
        setTimeout(() => announce(true), 0);
        return {
          ...prev,
          waste: prev.waste.slice(0, -1),
          foundation: prev.foundation.map((pile, i) => i === foundationIdx ? [...pile, card] : pile),
        };
      }
      setTimeout(() => announce(false), 0);
      return prev;
    });
  }
  function handleWasteToTableau(tableauIdx: number, announce: (success: boolean) => void) {
    let didMove = false;
    setGameState(prev => {
      if (prev.waste.length === 0) {
        setTimeout(() => announce(false), 0);
        return prev;
      }
      const card = prev.waste[prev.waste.length - 1];
      const destPile = prev.tableau[tableauIdx];
      if ((destPile.length === 0 && card.value === 'K') || canMoveToTableau(card, destPile)) {
        didMove = true;
        setTimeout(() => announce(true), 0);
        return {
          ...prev,
          waste: prev.waste.slice(0, -1),
          tableau: prev.tableau.map((pile, i) => i === tableauIdx ? [...pile, card] : pile),
        };
      }
      setTimeout(() => announce(false), 0);
      return prev;
    });
  }
  function handleTableauToFoundation(tableauIdx: number, foundationIdx: number, announce: (success: boolean) => void) {
    setGameState(prev => {
      const pile = prev.tableau[tableauIdx];
      if (pile.length === 0) { setTimeout(() => announce(false), 0); return prev; }
      const card = pile[pile.length - 1];
      const destPile = prev.foundation[foundationIdx];
      if ((destPile.length === 0 && card.value === 'A') || (card.faceUp && canMoveToFoundation(card, destPile))) {
        setTimeout(() => announce(true), 0);
        const newTableauPile = pile.slice(0, -1);
        // Flip next card if needed
        if (newTableauPile.length > 0 && !newTableauPile[newTableauPile.length - 1].faceUp) {
          newTableauPile[newTableauPile.length - 1] = { ...newTableauPile[newTableauPile.length - 1], faceUp: true };
        }
        return {
          ...prev,
          tableau: prev.tableau.map((t, i) => i === tableauIdx ? newTableauPile : t),
          foundation: prev.foundation.map((f, i) => i === foundationIdx ? [...f, card] : f),
        };
      }
      setTimeout(() => announce(false), 0);
      return prev;
    });
  }
  function handleTableauToTableau(fromIdx: number, toIdx: number, announce: (success: boolean) => void) {
    setGameState(prev => {
      const fromPile = prev.tableau[fromIdx];
      if (fromPile.length === 0) { setTimeout(() => announce(false), 0); return prev; }
      // Always use selectedCard.cardIdx for multi-card moves
      let startIdx = selectedCard ? selectedCard.cardIdx : fromPile.findIndex(card => card.faceUp);
      if (startIdx < 0 || startIdx >= fromPile.length) startIdx = fromPile.findIndex(card => card.faceUp);
      if (startIdx === -1) startIdx = fromPile.length - 1;
      const movingCards = fromPile.slice(startIdx);
      if (!movingCards.every(card => card.faceUp)) { setTimeout(() => announce(false), 0); return prev; }
      const toPile = prev.tableau[toIdx];
      if ((toPile.length === 0 && movingCards[0].value === 'K') || canMoveToTableau(movingCards[0], toPile)) {
        setTimeout(() => announce(true), 0);
        const newFromPile = fromPile.slice(0, startIdx);
        // Flip next card if needed
        if (newFromPile.length > 0 && !newFromPile[newFromPile.length - 1].faceUp) {
          newFromPile[newFromPile.length - 1] = { ...newFromPile[newFromPile.length - 1], faceUp: true };
        }
        return {
          ...prev,
          tableau: prev.tableau.map((pile, i) => {
            if (i === fromIdx) return newFromPile;
            if (i === toIdx) return [...pile, ...movingCards];
            return pile;
          }),
          foundation: prev.foundation,
          waste: prev.waste,
          stock: prev.stock,
        };
      }
      setTimeout(() => announce(false), 0);
      return prev;
    });
  }
  // Move card from foundation to tableau
  const handleFoundationToTableau = (
    foundationIdx: number,
    tableauIdx: number,
    announce: (success: boolean) => void
  ) => {
    setGameState(prev => {
      const fromPile = prev.foundation[foundationIdx];
      if (fromPile.length === 0) { setTimeout(() => announce(false), 0); return prev; }
      const card = fromPile[fromPile.length - 1];
      const toPile = prev.tableau[tableauIdx];
      if ((toPile.length === 0 && card.value === 'K') || canMoveToTableau(card, toPile)) {
        setTimeout(() => announce(true), 0);
        return {
          ...prev,
          foundation: prev.foundation.map((pile, i) => i === foundationIdx ? pile.slice(0, -1) : pile),
          tableau: prev.tableau.map((pile, i) => i === tableauIdx ? [...pile, card] : pile),
        };
      }
      setTimeout(() => announce(false), 0);
      return prev;
    });
  };

  // Main render
  return (
  <main className={`App color-scheme-${colorScheme}`} aria-label="Accessible Solitaire Game" role="main">
  <h1 tabIndex={0} aria-label="Accessible Solitaire">Accessible Solitaire</h1>
      {/* Accessible instructions/help text */}
      <section aria-label="Game Instructions" className="instructions" tabIndex={0}>
        <h2>How to Play Accessible Solitaire</h2>
        <p>
          Use <strong>Tab</strong> to jump between the three main areas: Foundation, Tableau, and Actions. Use <strong>Shift+Tab</strong> to move backwards through these areas.
        </p>
        <p>
          You can also use your screen reader or braille device's heading navigation commands to quickly move between major sections of the game. Each main area is marked with a heading for fast navigation.
        </p>
        <ul>
          <li>Press Enter or Space on a face-up card to pick it up (multi-card moves supported).</li>
          <li>Move to a valid destination pile and press Enter or Space to drop the card(s).</li>
          <li>Press Enter or Space on the Stock pile to draw a card.</li>
          <li>Press Enter or Space on the Waste pile to recycle it to Stock when empty.</li>
          <li>Use the Restart and Give Up buttons to start a new game or end the current one.</li>
        </ul>
        <p>
          Cards are announced as "Value of Suit" (e.g., "Ace of Spades"). Only valid moves are allowed according to standard Solitaire rules.
        </p>
        <p>
          All features are fully accessible for screen readers and braille displays.
        </p>
      </section>
      {/* Color scheme selection */}
  <div className="color-scheme-select">
        <button onClick={() => setColorScheme('default')} aria-label="Default color scheme" tabIndex={0} disabled={colorScheme === 'default'}>Default</button>
        <button onClick={() => setColorScheme('dark')} aria-label="Dark mode color scheme" tabIndex={0} disabled={colorScheme === 'dark'}>Dark Mode</button>
        <button onClick={() => setColorScheme('contrast')} aria-label="High contrast color scheme" tabIndex={0} disabled={colorScheme === 'contrast'}>High Contrast</button>
      </div>
  <div className="game-container" aria-label="Solitaire Board" role="region">
        {gameEnded && (
          <div className="game-end-message" aria-live="assertive" role="alert" tabIndex={0}>
            {gameEnded.reason}
          </div>
        )}
        {/* Foundation navigation heading */}
        <h2
          className="foundation-heading"
          tabIndex={0}
          ref={foundationSectionRef}
          aria-label="Foundation Piles Section"
          onFocus={() => setFocusedMainSection('foundation')}
        >
          Foundation Piles
        </h2>
        <div className="foundation-row" aria-label="Foundation piles" role="region">
          {gameState.foundation.map((pile, i) => (
            <div
              key={i}
              ref={el => { foundationRefs.current[i] = el; }}
              role="button"
              tabIndex={focusedSection === 'foundation' && focusedIndex === i ? 0 : -1}
              onFocus={() => {
                if (shortcutFocusIdx === i) setShortcutFocusIdx(null);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleKeyDown(e, 'foundation', i);
                }
              }}
              onClick={() => handleKeyDown({ key: 'Enter', preventDefault: () => {} } as any, 'foundation', i)}
            >
              {pile.length > 0
                ? shortcutFocusIdx === i
                  ? <span className="card">{renderCard(pile[pile.length - 1], pile.length - 1, 'foundation', i)}</span>
                  : renderCard(pile[pile.length - 1], pile.length - 1, 'foundation', i)
                : shortcutFocusIdx === i
                  ? <span className="card empty">Empty</span>
                  : <span className="card empty" aria-label={`Empty foundation pile ${i + 1}`}>Empty</span>
              }
            </div>
          ))}
        </div>
        {/* Tableau piles */}
        <div className="tableau-row" aria-label="Tableau piles" role="region">
          <h2
            className="tableau-main-heading"
            tabIndex={0}
            ref={tableauSectionRef}
            aria-label="Tableau Section"
            onFocus={() => setFocusedMainSection('tableau')}
          >
            Tableau
          </h2>
          {gameState.tableau.map((pile, i) => {
            return (
              <div
                key={i}
                aria-label={pile.length > 0 ? `Tableau pile ${i + 1}, top card is ${pile[pile.length-1].value} ${pile[pile.length-1].suit}` : `Empty tableau pile ${i + 1}`}
                className="tableau-pile"
                role="region"
              >
                <h3 className="tableau-heading" tabIndex={-1}>Tableau {i + 1}</h3>
                <div className="tableau-cards">
                  {pile.length > 0
                    ? pile.map((card, idx) => renderCard(card, idx, 'tableau', i, true))
                    : (
                        <div
                          className="card empty"
                          aria-label="Empty tableau pile"
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => {
                            if ((e.key === 'Enter' || e.key === ' ') && selectedCard) {
                              if (selectedCard.section === 'tableau' && selectedCard.pileIdx !== i) {
                                handleTableauToTableau(selectedCard.pileIdx, i, success => {
                                  setAnnouncement(success ? `Dropped card on empty tableau pile ${i + 1}.` : 'Invalid move: Cannot move tableau card to empty tableau pile.');
                                });
                                setSelectedCard(null);
                              } else if (selectedCard.section === 'waste') {
                                handleWasteToTableau(i, success => {
                                  setAnnouncement(success ? `Dropped card on empty tableau pile ${i + 1}.` : 'Invalid move: Cannot move waste card to empty tableau pile.');
                                });
                                setSelectedCard(null);
                              }
                            }
                          }}
                          onClick={() => {
                            if (selectedCard) {
                              if (selectedCard.section === 'tableau' && selectedCard.pileIdx !== i) {
                                handleTableauToTableau(selectedCard.pileIdx, i, success => {
                                  setAnnouncement(success ? `Dropped card on empty tableau pile ${i + 1}.` : 'Invalid move: Cannot move tableau card to empty tableau pile.');
                                });
                                setSelectedCard(null);
                              } else if (selectedCard.section === 'waste') {
                                handleWasteToTableau(i, success => {
                                  setAnnouncement(success ? `Dropped card on empty tableau pile ${i + 1}.` : 'Invalid move: Cannot move waste card to empty tableau pile.');
                                });
                                setSelectedCard(null);
                              }
                            }
                          }}
                        >
                          Empty
                        </div>
                      )
                  }
                </div>
              </div>
            );
          })}
        <h2 className="after-tableau-heading" tabIndex={-1}>Actions</h2>
        </div>
        <h2
          className="after-tableau-heading"
          tabIndex={0}
          ref={actionsSectionRef}
          aria-label="Actions Section"
          onFocus={() => setFocusedMainSection('actions')}
        >
          Actions
        </h2>
        <h2
          className="after-tableau-heading"
          tabIndex={0}
          ref={actionsSectionRef}
          aria-label="Actions Section"
          onFocus={() => setFocusedMainSection('actions')}
        >
          Actions
        </h2>
        {/* Stock pile (moved to bottom) */}
        <div
          aria-label={`Stock pile with ${gameState.stock.length} cards`}
          className="stock-pile"
        >
          <button
            onClick={handleDrawStock}
            disabled={gameState.stock.length === 0 && gameState.waste.length === 0}
            aria-label={gameState.stock.length > 0 ? "Draw from stock" : (gameState.waste.length > 0 ? "Recycle waste to stock" : "Empty stock")}
            tabIndex={0}
          >
            {gameState.stock.length > 0
              ? `${gameState.stock.length} cards`
              : (gameState.waste.length > 0 ? "Recycle" : "Empty")}
          </button>
        </div>
        {/* Waste pile (moved to bottom) */}
        <div
          aria-label={gameState.waste.length > 0 ? `Waste pile, top card is ${gameState.waste[gameState.waste.length-1].value} ${gameState.waste[gameState.waste.length-1].suit}` : 'Empty waste pile'}
          className="waste-pile"
        >
          {gameState.waste.length > 0
            ? renderCard(gameState.waste[gameState.waste.length - 1], gameState.waste.length - 1, 'waste', 0)
            : <span className="card empty" aria-label="Empty waste pile">Empty</span>
          }
        </div>
        {/* Action buttons below stock and waste */}
  <div className="action-buttons">
          <button onClick={handleGiveUp} aria-label="Give up and end the game" tabIndex={0} disabled={!!gameEnded}>Give Up</button>
          <button onClick={handleRestart} aria-label="Restart the game" tabIndex={0}>Restart</button>
        </div>
        {/* ARIA live region */}
        <div id="aria-live-region" aria-live="polite" className="sr-only" role="status">
          {announcement}
        </div>
      </div>
    </main>
  );
}

export default App;
