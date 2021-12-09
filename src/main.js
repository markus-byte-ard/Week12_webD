import Phaser from 'phaser'

import GameScene from './scenes/GameScene'

const config = {
	type: Phaser.AUTO,
	width: 500,
	height: 450,
	backgroundColor: 0x87ceeb,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 }
		}
	},
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},
	pixelArt: true,
	scene: [GameScene]
}

export default new Phaser.Game(config)
