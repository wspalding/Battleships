const player = require('./player.js');
const misc = require('./misc.js');


class BattleShips
{
  constructor(player1, player2)
  {
    this.p1 = player1;
    this.p2 = player2;
    this.history = []
    this.boardHeight = 8
    this.boardWidth = 8

    this.p1Board = new Board(this.boardHeight)
    this.p2Board = new Board(this.boardHeight)

    this.p1.board = this.p1Board
    this.p2.board = this.p2Board

    this.phase = 0
    this.phases = ["setup", "attacking", "game over"]

    this.turn = player1
    player1.isTurn = true
    this.gameOver = false
    this.winner = null
    // this.turn.autoMove()
  }

  getEvents()
  {
    return this.history;
  }

  getCurrentPhase()
  {
    return this.phases[this.phase]
  }

  getPhaseString()
  {
    return this.turn.name + " : " + this.getCurrentPhase()
  }

  swapTurns()
  {
    console.log("next players turn");
    if(this.turn === this.p1)
    {
      this.turn = this.p2
      this.p2.isTurn = true
      this.p1.isTurn = false
    }
    else
    {
      this.turn = this.p1
      this.p1.isTurn = true
      this.p2.isTurn = false
      if(this.getCurrentPhase() === "setup")
      {
        this.history.unshift("setup phase over")
        this.phase += 1
      }
    }
    if(this.gameOver)
    {
      this.phase += 1
      this.turn = this.winner
    }
    this.turn.autoMove(this)
  }

  getPlayer(i)
  {
    switch (i) {
      case 1:
        return this.p1
      case 2:
        return this.p2
      default:
        return null

    }
  }

  getBoardValue(player, i, j)
  {
    return player.board.valueAtIndex(i,j)
  }

  attack(i,j)
  {
    if(this.phase !== 1)
    {
      console.error("wrong phase");
      return Error("wrong phase")
    }
    var attacker = this.turn
    var attacked = this.otherPlayer(attacker)
    var space = String.fromCharCode(97 + i) + (j+1)
    var message = attacker.name + " attacked " + space
    var miss = true
    for(var k = 0; k < attacked.ships.length; k++)
    {
      if(attacked.ships[k].recieveHit(i,j))
      {
        attacked.board.squares[i][j] = 3
        miss = false
        message += "\nHIT"
        if(attacked.ships[k].isDestroyed)
        {
          message += "\ndestroyed " + attacked.ships[k].name
          var win = true
          for(var l = 0; l < attacked.ships.length; l++)
          {
            if(!attacked.ships[l].isDestroyed)
            {
              win = false
              break
            }
          }
          if(win)
          {
            message += "\n" + attacker.name + " WINS!"
            this.gameOver = true
            this.winner = attacker
          }
        }
      }
    }
    if(miss)
    {
      attacked.board.squares[i][j] = 1
      message += "\nMISS"
    }
    attacker.attacked_squares.push([i,j])
    this.history.unshift(message)
    this.swapTurns()
    // return Error("not implamented yet")
  }

  otherPlayer(player)
  {
    if(player === this.p1)
    {
      return this.p2
    }
    return this.p1
  }

  sendMessage(m)
  {
    this.history.unshift(m)
  }

}




class Board
{
  constructor(size)
  {
    this.size = size
    this.squares = misc.makeArray(size, size, 0)
    this.placedShips = []
  }

  valueAtIndex(x,y)
  {
    return this.squares[x][y];
  }

  isTaken(x,y)
  {
    // console.log("num ships placed:", this.placedShips.length, "checking space \n", x,y);
    for(var i = 0; i < this.placedShips.length; i++)
    {
      // console.log("ship:", this.placedShips[i]);
      if(this.placedShips[i].contains(x,y))
      {
        // console.log("space is taken", x, y);
        return true
      }
    }
    return false
  }

  getValidPlacements(ship, x, y)
  {
    // console.log(ship.size);
    var valid = []
    var pos_up = []
    if(x-ship.size >= -1)
    {
      for(var i = x-1; i > x-ship.size; i--)
      {
        if(this.isTaken(i,y))
        {
          pos_up = []
          break
        }
        else
        {
          pos_up.push([i,y])
        }
      }
    }

    var pos_down = []
    if(x+ship.size <= this.size)
    {
      for(var i = x+1; i < x+ship.size; i++)
      {
        if(this.isTaken(i,y))
        {
          pos_down = []
          break
        }
        else
        {
          pos_down.push([i,y])
        }
      }
    }

    var pos_left = []
    if(y-ship.size >= -1)
    {
      for(var i = y-1; i > y-ship.size; i--)
      {
        if(this.isTaken(x,i))
        {
          pos_left = []
          break
        }
        else
        {
          pos_left.push([x,i])
        }
      }
    }

    var pos_right = []
    if(y+ship.size <= this.size)
    {
      for(var i = y+1; i < y+ship.size; i++)
      {
        if(this.isTaken(x,i))
        {
          pos_right = []
          break
        }
        else
        {
          pos_right.push([x,i])
        }
      }
    }


    valid.push(...pos_up)
    valid.push(...pos_down)
    valid.push(...pos_left)
    valid.push(...pos_right)
    // console.log(pos_down);
    return valid
  }

}


exports.BattleShips = BattleShips
// exports.Human = Human
// exports.Computer = Computer
