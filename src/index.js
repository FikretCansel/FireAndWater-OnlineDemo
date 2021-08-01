import Phaser from "phaser";
import skyImg from "./assets/sky.png";
import platformImg from "./assets/platform.png";
import starImg from "./assets/star.png";
import bombImg from "./assets/bomb.png";
import dudeImg from "./assets/dude.png";

var platforms;
var player;
var player2;
var cursors;
var stars;
var score = 0;
var scoreText;
var bombs;
const userId=Math.floor(Math.random() * 50);


class MyGame extends Phaser.Scene {
  constructor() {
    super();
  }

  preload() {
    this.load.image("sky", skyImg);
    this.load.image("ground", platformImg);
    this.load.image("star", starImg);
    this.load.image("bomb", bombImg);
    this.load.spritesheet("dude", dudeImg, { frameWidth: 32, frameHeight: 48 });
  }
  update() {
    if (cursors.left.isDown) {
      player.setVelocityX(-160);
      player.anims.play("left", true);
      sendMyLoc("LEFT");
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);

      player.anims.play("right", true);
      sendMyLoc("RIGHT");
    } else {
      player.setVelocityX(0);

      player.anims.play("turn");
    }
    if (cursors.up.isDown && player.body.touching.down) {
      player.setVelocityY(-330);
      sendJumpInfo();
    }

    //getItsLoc();
    //player 2 gelen dataya göre haraket ettir
    

  }
  
  animationCreate(){
    this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1,
      });
  
      this.anims.create({
        key: "turn",
        frames: [{ key: "dude", frame: 4 }],
        frameRate: 20,
      });
  
      this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1,
      });
  }
  starCreate(){
    stars = this.physics.add.group({
        key: "star",
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 },
      });
  
      stars.children.iterate(function (child) {
        child.setBounceY(0.6);
      });
  }

  create() {
    //Objects
    this.add.image(400, 300, "sky");
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, "ground").setScale(2).refreshBody();
    platforms.create(600, 400, "ground");
    platforms.create(50, 250, "ground");
    platforms.create(750, 220, "ground");



    //Player Create
    player = this.physics.add.sprite(100, 450, "dude");
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //Player 2 Create
    player2 = this.physics.add.sprite(200, 450, "dude");
    player2.setBounce(0.2);
    player2.setCollideWorldBounds(true);

    this.animationCreate();
    this.starCreate();
    cursors = this.input.keyboard.createCursorKeys();


    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player2, platforms);
    this.physics.add.collider(stars, platforms);
    

    //Yıldız Aldıgında
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.overlap(player2, stars, collectStar, null, this);
    function collectStar(player, star) {
      star.disableBody(true, true);
      score += 10;
      scoreText.setText(`score : ${score}`);

      //Tümü alındı
      if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
          child.enableBody(true, child.x, 0, true, true);
        });

        var x =417;
            
        this.bombCreate(x);
      }
    }





    scoreText = this.add.text(16, 16, `score : 0`, {
      fontSize: "32px",
      fill: "#000",
    });

    //Bomba Özellikleri
    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);

    this.dead();
  }
  bombCreate(x){
    var bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(300);
  }

  dead(){
    this.physics.add.collider(player, bombs, hitBomb, null, this);
    this.physics.add.collider(player2, bombs, hitBomb, null, this);
    function hitBomb(player, bomb) {
      this.physics.pause();

      player.setTint(0xff0000);

      player.anims.play("turn");

      this.gameOver = true;

      sendDeadData();
    }
  }

}

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  scene: MyGame,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
};

const game = new Phaser.Game(config);



const socket = io('ws://localhost:8080');



socket.on('message', socketItsLoc => {
  if(socketItsLoc.event==="DEAD"){
    window.location.reload(1);
  }

    if(socketItsLoc.id!==userId){
        if(socketItsLoc.event==="JUMP"){
            player2.setVelocityY(-330);
            player2.anims.play("turn");
        }else{
            if(socketItsLoc.anim==="LEFT"){
              player2.anims.play("left", true);
            }
            else if(socketItsLoc.anim==="RIGHT"){
              player2.anims.play("right", true);
            }
            player2.x=socketItsLoc.xLoc;
            player2.y=socketItsLoc.yLoc;
        }
    }
});

function sendMyLoc(direction){
    socket.emit('message', {id:userId,xLoc:player.x,yLoc:player.y,anim:direction})
}
function sendJumpInfo() {
    socket.emit('message', {id:userId,event:"JUMP"})
}

function sendDeadData() {
  socket.emit('message', {id:userId,event:"DEAD"})
}


