class Boundary {
  static width = 48;
  static height = 48;
  constructor({ position }) {
    this.position = position;
    this.width = Boundary.width;
    this.height = Boundary.height;
  }

  draw() {
    c.fillStyle = "rgba(255, 0, 0, 0";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class Sprite {
  constructor({
    position,
    image,
    frames = { x: 1, y: 1 },
    offset = { x: 0, y: 0 },
    scale = 1,
    sprites = [],
    animate = false,
    rotation = 0,
  }) {
    this.position = position;
    this.image = new Image();
    this.offset = offset;
    this.scale = scale;
    this.frames = {
      ...frames,
      max: frames.x * frames.y,
      val: 0,
      elapsed: 0,
    };
    this.image.onload = () => {
      this.width = this.image.width / frames.x;
      this.height = this.image.height / frames.y;
    };
    this.image.src = image.src;
    this.animate = animate;
    this.sprites = sprites;
    this.opacity = 1;
    this.rotation = rotation;
  }

  #getFrame(frameNumber) {
    let sourcePosition;

    if (this.frames.y > 1) {
      switch (frameNumber) {
        case 0:
          sourcePosition = { x: 0, y: 0 };
          break;
        case 1:
          sourcePosition = { x: this.width, y: 0 };
          break;
        case 2:
          sourcePosition = { x: 0, y: this.height };
          break;
        case 3:
          sourcePosition = { x: this.width, y: this.height };
          break;
      }
    } else {
      sourcePosition = { x: this.width * frameNumber, y: 0 };
    }

    return {
      sx: sourcePosition.x,
      sy: sourcePosition.y,
      dw: (this.image.width / this.frames.x) * this.scale,
      dh: (this.image.height / this.frames.y) * this.scale,
    };
  }

  draw() {
    const frameProps = this.#getFrame(this.frames.val);
    c.save();
    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
    c.rotate(this.rotation);
    c.translate(
      -(this.position.x + this.width / 2),
      -(this.position.y + this.height / 2)
    );
    c.globalAlpha = this.opacity;
    c.drawImage(
      this.image,
      frameProps.sx,
      frameProps.sy,
      this.width,
      this.height,
      this.position.x - this.offset.x,
      this.position.y - this.offset.y,
      frameProps.dw,
      frameProps.dh
    );
    c.restore();

    if (this.animate) {
      if (this.frames.max > 1) {
        this.frames.elapsed++;
      }
      if (this.frames.elapsed % this.frames.hold === 0) {
        if (this.frames.val < this.frames.max - 1) {
          this.frames.val++;
        } else {
          this.frames.val = 0;
        }
      }
    }
  }
}

class Monster extends Sprite {
  constructor({
    position,
    image,
    frames = { x: 1, y: 1 },
    offset = { x: 0, y: 0 },
    scale = 1,
    sprites = [],
    animate = false,
    rotation = 0,
    isEnemy = false,
    name,
    attacks,
  }) {
    super({
      position,
      image,
      frames,
      offset,
      scale,
      sprites,
      animate,
      rotation,
    });
    this.health = 100;
    this.isEnemy = isEnemy;
    this.name = name;
    this.attacks = attacks;
  }
  attack({ attack, recipient, renderedSprites }) {
    document.querySelector("#dialogBox").style.display = "block";
    document.querySelector(
      "#dialogBox"
    ).innerHTML = `${this.name} used ${attack.name}`;
    let healthBar = "#enemyHealthBar";
    if (this.isEnemy) {
      healthBar = "#playerHealthBar";
    }
    recipient.health -= attack.damage;
    let movmentDistance = 20;
    let rotation = 1;

    if (this.isEnemy) {
      rotation = -2.2;
      movmentDistance = -20;
    }
    switch (attack.name) {
      case "Tackle":
        const tl = gsap.timeline();

        tl.to(this.position, {
          x: this.position.x - movmentDistance,
        })
          .to(this.position, {
            x: this.position.x + movmentDistance * 2,
            duration: 0.1,
            onComplete: () => {
              audio.tackleHit.play();
              gsap.to(healthBar, {
                width: recipient.health + "%",
              });
              gsap.to(recipient.position, {
                x: recipient.position.x + 10,
                yoyo: true,
                repeat: 5,
                duration: 0.08,
              });
              gsap.to(recipient, {
                opacity: 0,
                yoyo: true,
                repeat: 5,
                duration: 0.08,
              });
            },
          })
          .to(this.position, {
            x: this.position.x,
          });
        break;
      case "Fireball":
        audio.initFireball.play();
        const fireballImage = new Image();
        fireballImage.src = "./assets/fireball.png";
        const fireball = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y,
          },
          image: fireballImage,
          frames: {
            x: 4,
            y: 1,
            hold: 10,
          },
          animate: true,
          rotation,
        });
        renderedSprites.splice(1, 0, fireball);

        gsap.to(fireball.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          onComplete: () => {
            audio.fireballHit.play();
            renderedSprites.splice(1, 1);
            gsap.to(healthBar, {
              width: recipient.health + "%",
            });
            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });
            gsap.to(recipient, {
              opacity: 0,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });
          },
        });
        break;
    }
  }

  faint() {
    document.querySelector("#dialogBox").style.display = "block";
    document.querySelector("#dialogBox").innerHTML = `${this.name} fainted!`;
    gsap.to(this.position, {
      y: this.position.y + 20,
    });
    gsap.to(this, {
      opacity: 0,
    });
    audio.victory.play();
  }
}
