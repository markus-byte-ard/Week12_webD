import Phaser from 'phaser'
import ScoreLabel from '../ui/ScoreLabel';

const gameOptions = {
    heroGravity: 800,
    heroSpeed: 300
}

export default class GameScene extends Phaser.Scene {
	constructor() {
		super('game-scene');
        this.triggerTimer = Phaser.Time.TimerEvent;
        this.scoreLabel = undefined;
        this.hero = undefined;
        this.cursors = undefined;
	}

	preload() {
        // Sprites

        // By La Red Games https://laredgames.itch.io/gems-coins-free
        this.load.spritesheet("money", "assets/MonedaD.png", {frameWidth: 16, frameHeight: 16});

        // By ansimuz https://ansimuz.itch.io/gothicvania-cemetery
        this.load.spritesheet("hero-idle", "assets/hero-idle.png", {frameWidth: 100, frameHeight: 59});
        this.load.spritesheet("hero-jump", "assets/hero-jump.png", {frameWidth: 100, frameHeight: 59});
        //this.load.spritesheet("hero-attack", "assets/hero-attack.png", {frameWidth: 100, frameHeight: 59});
        this.load.spritesheet("hero-run", "assets/hero-run.png", {frameWidth: 100, frameHeight: 59});

        // Environment
        // By ansimuz https://ansimuz.itch.io/magic-cliffs-environment
        this.load.image("tiles", "assets/tileset.png")
        this.load.tilemapTiledJSON("map", "assets/map.json");

        // Sounds
        // By ArcOfDream https://arcofdream.itch.io/monolith-ost
        this.load.audio('music', 'assets/EndofMonolith.mp3');
        // By NenadSimic https://opengameart.org/content/picked-coin-echo
        this.load.audio('coin', 'assets/PickedCoinEcho.wav');
        // By dklon https://opengameart.org/content/platformer-jumping-sounds
        this.load.audio('jump', 'assets/jump_01.wav');
        // By hosch https://hosch.itch.io
        this.load.audio('damage', 'assets/sfx_explosionGoo.ogg');
	}

	create() {
        // Misc
        this.cameras.main.setBounds(0, 0, 1600, 720);
		this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.canDoubleJump = true;

        // Sounds
        this.music = this.sound.add("music", {loop: true, volume: 0.2});
        this.coinSound = this.sound.add("coin", {loop: false, volume: 1});
        this.jumpSound = this.sound.add("jump", {loop: false, volume: 0.2});
        this.deathSound = this.sound.add("damage", {loop: false, volume: 1});
        this.music.play();

        // Creating map hopefully
        const map = this.make.tilemap({ key: "map", tileWidth: 16, tileHeight: 16})
        const tileset = map.addTilesetImage("tiles", "tiles");
        const groundLayer = map.createLayer("Ground", tileset, 0, 0);
        const treeLayer = map.createLayer("Trees", tileset, 0, 0);

        // Coin spin animation
        this.anims.create({
            key: "spin",
            frames: this.anims.generateFrameNumbers("money", {start: 0, end: 4}),
            frameRate: 12,
            repeat: -1
        });

        this.moneyGroup = this.physics.add.group({});

        // Creating player
        this.hero = this.createHero();
        this.cameras.main.startFollow(this.hero, true, 0.8, 0.8);

        //this.physics.add.collider(this.hero, this.platforms);
        this.physics.add.collider(this.hero, groundLayer);
        groundLayer.setCollisionByProperty({ collides: true});
        this.physics.world.setBounds(0, 0, groundLayer.width, groundLayer.height);

        this.physics.add.collider(this.moneyGroup, groundLayer);

        this.physics.add.overlap(this.hero, this.moneyGroup, this.collectMoney, null, this);

        this.add.image(16,16, "money").setScrollFactor(0);
        this.scoreLabel = this.createScoreLabel(32, 2, 0).setScrollFactor(0);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.triggerTimer = this.time.addEvent({
            callback: this.addMoney,
            callbackScope: this,
            delay: 700,
            loop: true

        });
	}

    addMoney() {
        console.log("Adding a new Money");

        if(Phaser.Math.Between(0, 1)) {
            this.moneyGroup.create(Phaser.Math.Between(0, 1600), 0, "money").setScale(0.5);
            this.moneyGroup.playAnimation("spin", 0);
            this.moneyGroup.setVelocityY(gameOptions.heroSpeed);
        }

    }
    
    collectMoney(hero, money) {
        money.disableBody(true, true);
        this.scoreLabel.add(10)
        this.coinSound.play();
    }

    createHero() {
        const hero = this.physics.add.sprite(50, 620, "hero-idle");
        hero.body.gravity.y = gameOptions.heroGravity;

        //animations
        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNumbers("hero-run", {start: 0, end: 5}),
            frameRate: 12,
            repeat: -1
        });
        /* Not used
        this.anims.create({
            key: "attack",
            frames: this.anims.generateFrameNumbers("hero-attack", {start: 0, end: 4}),
            frameRate: 10
        });
        */ 
        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers("hero-idle", {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: "jump",
            frames: this.anims.generateFrameNumbers("hero-jump", {start: 0, end: 3}),
            frameRate: 12,
        });

        this.anims.create({
            key: "falling",
            frames: this.anims.generateFrameNumbers("hero-jump", {start: 2, end: 3}),
            frameRate: 12,
            repeat: -1
        });

        //hero.setCollideWorldBounds(true);
        hero.setScale(0.75);
        return hero
    }

    createScoreLabel(x, y, score) {
		const style = { fontSize: '32px', fill: '#000' }
		const label = new ScoreLabel(this, x, y, score, style)

		this.add.existing(label)

		return label
	}

    update() {
        const didPressJump = Phaser.Input.Keyboard.JustDown(this.cursors.up);
        //const didPressX = Phaser.Input.Keyboard.JustDown(this.keyX);

        if(this.cursors.left.isDown) {
            this.hero.body.velocity.x = -gameOptions.heroSpeed;          
            this.hero.anims.play("walk", true);
            this.hero.flipX = true;
        }
        else if(this.cursors.right.isDown) {
            this.hero.body.velocity.x = gameOptions.heroSpeed;
            this.hero.anims.play("walk", true);
            this.hero.flipX = false;
        }
        else {
            this.hero.body.velocity.x = 0;
            if (this.hero.anims.isPlaying && this.hero.anims.currentAnim.key === 'attack') {
                this.hero.anims.play("idle", false);
            } else {
                this.hero.anims.play("idle", true);
            }
        }
        // This double jump is kinda scuffed, but it works sometimes
        if(didPressJump) {
            if (this.hero.body.onFloor()) {
                // player can only double jump if it is on the floor
                this.canDoubleJump = true;
                this.hero.body.setVelocityY(-gameOptions.heroGravity/1.6);
                this.hero.anims.play("jump", true);
                this.jumpSound.play();
                console.log("Double jump: ",this.canDoubleJump);
                console.log("Pressed jump button: ",didPressJump);
                return;
            } else if (this.canDoubleJump === true) {
                // player can only jump 2x (double jump)
                this.canDoubleJump = false;
                this.hero.body.setVelocityY(-gameOptions.heroGravity/1.6);
                this.hero.anims.play("jump", true);
                this.jumpSound.play();
                console.log("double jump");
            }
        }


        else if(!this.hero.body.onFloor()) {
            //this.hero.anims.play("idle", false);
            this.hero.anims.play("falling", true);
        }

        if (this.hero.body.onFloor()) {
            this.canDoubleJump = false;
        }
        
        if(this.hero.y > 800) {
            this.music.stop();
            this.deathSound.play();
            this.scene.start("game-scene");
        }
        /* Doesn't work for some reason
        if(didPressX) {
            this.hero.body.setVelocityX(0);
            this.hero.anims.play("idle", false);
            this.hero.anims.play("attack", true);
            console.log("attacking");
        }
        */
    }
}