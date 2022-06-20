const battleBackgroundImage = new Image();
battleBackgroundImage.src = "./assets/battleBackground.png";

const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: battleBackgroundImage,
});

let battlerAnimationId;
let draggle;
let emby;
let queue;
let renderedSprites;

function initBattle() {
  document.querySelector("#battleInterface").style.display = "block";
  document.querySelector("#dialogBox").style.display = "none";
  document.querySelector("#enemyHealthBar").style.width = "100%";
  document.querySelector("#playerHealthBar").style.width = "100%";
  document.querySelector("#attacksBox").replaceChildren();

  queue = [];
  draggle = new Monster(monsters.Draggle);
  emby = new Monster(monsters.Emby);
  renderedSprites = [draggle, emby];

  emby.attacks.forEach((attack) => {
    const button = document.createElement("button");
    button.innerHTML = attack.name;
    document.querySelector("#attacksBox").append(button);
  });

  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", (event) => {
      const attack = attacks[event.currentTarget.innerHTML];
      emby.attack({
        attack,
        recipient: draggle,
        renderedSprites,
      });

      if (draggle.health <= 0) {
        queue.push(() => {
          draggle.faint();
        });
        queue.push(() => {
          gsap.to("#overlappingDiv", {
            opacity: 1,
            onComplete() {
              cancelAnimationFrame(battlerAnimationId);
              animate();
              document.querySelector("#battleInterface").style.display = "none";
              gsap.to("#overlappingDiv", {
                opacity: 0,
              });
              battle.initiated = false;
              audio.Map.play();
              audio.battle.stop();
            },
          });
        });
        return;
      }

      console.log("draggle", draggle.health);
      console.log("emby", emby.health);
      const randAttack =
        draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)];

      queue.push(() => {
        draggle.attack({
          attack: randAttack,
          recipient: emby,
          renderedSprites,
        });
        if (emby.health <= 0) {
          queue.push(() => {
            emby.faint();
          });
          queue.push(() => {
            gsap.to("#overlappingDiv", {
              opacity: 1,
              onComplete() {
                cancelAnimationFrame(battlerAnimationId);
                animate();
                document.querySelector("#battleInterface").style.display =
                  "none";
                gsap.to("#overlappingDiv", {
                  opacity: 0,
                });
                battle.initiated = false;
                audio.Map.play();
                audio.battle.stop();
              },
            });
          });
          return;
        }
      });
    });

    button.addEventListener("mousemove", (event) => {
      const attack = attacks[event.currentTarget.innerHTML];
      document.querySelector("#attackType").innerHTML = attack.type;
      document.querySelector("#attackType").style.color = attack.color;
    });
  });
}

function animateBattle() {
  battlerAnimationId = requestAnimationFrame(animateBattle);

  battleBackground.draw();
  renderedSprites.forEach((sprite) => {
    sprite.draw();
  });
}

document.querySelector("#dialogBox").addEventListener("click", (e) => {
  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else {
    e.currentTarget.style.display = "none";
  }
});
