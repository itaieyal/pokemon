const monsters = {
  Emby: {
    position: {
      x: 280,
      y: 325,
    },
    frames: {
      x: 4,
      y: 1,
      hold: 30,
    },
    image: {
      src: "./assets/embySprite.png",
    },
    animate: true,
    name: "emby",
    attacks: [attacks.Tackle, attacks.Fireball],
  },
  Draggle: {
    position: {
      x: 800,
      y: 100,
    },
    image: {
      src: "./assets/draggleSprite.png",
    },
    frames: {
      x: 4,
      y: 1,
      hold: 30,
    },
    animate: true,
    isEnemy: true,
    name: "draggle",
    attacks: [attacks.Tackle, attacks.Fireball],
  },
};
