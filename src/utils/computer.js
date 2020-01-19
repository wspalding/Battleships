import Player from './player.js'

class Computer extends Player
{
  constructor(name)
  {
    super(name)
  }

  autoMove(game)
  {
    switch (game.getCurrentPhase())
    {
      case "setup":
        console.log("CP setup");
        while(this.unplaced_ships.length > 0)
        {
          var x = Math.round(Math.random() * (this.board.size - 1))
          var y = Math.round(Math.random() * (this.board.size - 1))
          this.boardPressed(x,y)
          var currShip = this.unplaced_ships[this.unplaced_ships.length - 1]
          var valid_points = this.board.getValidPlacements(currShip, x, y)
          if(valid_points.length > 0)
          {
            var choice = Math.round(Math.random() * (valid_points.length - 1))

            this.boardPressed(...valid_points[choice])
          }
        }
        game.swapTurns()
        break;
      case "attacking":
        var x, y;
        do
        {
          x = Math.round(Math.random() * (this.board.size - 1))
          y = Math.round(Math.random() * (this.board.size - 1))
        } while(this.alreadyAttacked(x,y))

        game.attack(x,y)
        // console.log(this.name + " attacking");
        break
      case "game over":
        // console.log("CP gameOver");
        break
      default:

    }
  }
}

export default Computer;
