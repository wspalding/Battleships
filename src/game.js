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
    this.squares = makeArray(size, size, 0)
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


//TODO get attacking working, get computer to make its own moves


class Ship
{
  constructor(size)
  {
    this.size = size
    this.isDestroyed = false
    const names = ["","","submarine", "destroyer", "cruiser", "carrier"]
    this.name = names[size]
    this.indexes = []
    this.damage = new Array(size).fill(1)
  }

  setIndecies(indecies)
  {
    if(indecies.length != this.size)
    {
      return Error('wrong size')
    }
    this.indexes = indecies
  }

  contains(x,y)
  {
    for(var i = 0; i <  this.indexes.length; i++)
    {
      if(this.indexes[i][0] === x && this.indexes[i][1] === y)
      {
        return true
      }
    }
    return false
  }

  recieveHit(x,y)
  {
    for(var i = 0; i <  this.indexes.length; i++)
    {
      if(this.damage[i] === 0)
      {
        continue
      }
      if(this.indexes[i][0] === x && this.indexes[i][1] === y)
      {
        this.damage[i] = 0
        var d = true
        for(var j = 0; j < this.damage.length; j++)
        {
          if(this.damage[j] === 1)
          {
            d = false
            break
          }
        }
        this.isDestroyed = d
        return true
      }
    }
    return false
  }
}







class Player
{
  constructor(name)
  {
    this.name = name
    this.isTurn = false
    this.unplaced_ships = [new Ship(2),new Ship(3),new Ship(4),new Ship(5)]
    this.attacked_squares = []
    this.ships = []
    this.board = null
    this.highlightedSpace = []
    // this.board = board
  }

  placeCurrShip(i,j)
  {
    // TODO: Move a bunch of functions to plyer class
    // console.log("called");
    if(this.unplaced_ships.length <= 0)
    {
      console.error('no ships to place');
      return Error('no ships to place');
    }
    var x = this.highlightedSpace[0]
    var y = this.highlightedSpace[1]
    if(this.board.squares[x][y] !== 4)
    {
      console.error('the highlighted square was set wrong, this will not work');
      return Error('the highlighted square was set wrong, this will not work');
    }
    var h_dir = i - x
    var v_dir = j - y
    if(!(h_dir === 0 || v_dir === 0))
    {
      console.error('the highlighted square was set wrong, this will not work');
      return Error('the highlighted square was set wrong, this will not work');
    }
    var currShip = this.unplaced_ships.pop()
    h_dir = (h_dir === 0) ? 0 : h_dir/Math.abs(h_dir)
    v_dir = (v_dir === 0) ? 0 : v_dir/Math.abs(v_dir)
    var h_end = x + (h_dir * currShip.size)
    var v_end = y + (v_dir * currShip.size)

    // console.log(h_end, v_end);
    var m,n;
    var new_indexes = []
    for(m = x,n = y; !(m === h_end && n === v_end) ; m += h_dir, n += v_dir)
    {
      // console.log("in loop", m , n);
      new_indexes.push([m,n]);
      this.board.squares[m][n] = 2;
    }
    currShip.setIndecies(new_indexes)
    this.ships.push(currShip)
    this.board.placedShips = this.ships
    // console.log(currShip.indexes);
  }

  checkHit(pos)
  {
    for(var i = 0; i < this.ships.length; i++)
    {
      if(this.ships[i].indecies.includes(pos))
      {
        return this.ship[i]
      }
    }
    return false
  }

  currShip()
  {
    return this.unplaced_ships[this.unplaced_ships.length-1]
  }

  getHitBoard(enemyBoard)
  {
    var b = makeArray(this.board.size, this.board.size, 0)
    for(var i = 0; i < this.attacked_squares.length; i++)
    {
      var j = this.attacked_squares[i]
      var enemySquare = enemyBoard.squares[j[0]][j[1]]
      switch (enemySquare)
      {
        case 0:
          b[j[0]][j[1]] = "miss"
          break;
        case 1:
          b[j[0]][j[1]] = "miss"
          break;
        case 2:
          b[j[0]][j[1]] = "hit"
          break;
        default:
          b[j[0]][j[1]] = "hit"
      }
      // b[j[0]][j[1]] = (enemySquare === 0) ? "miss" : "hit"
    }
    return b
  }

  boardPressed(i,j)
  {
    // console.log("clicked", i, j);
    if(!this.isTurn)
    {
      console.error("its not your turn");
      return Error("its not your turn")
    }
    if(this.unplaced_ships.length <= 0)
    {
      console.error("all ships have been placed");
      return Error("all ships have been placed")
    }

    // console.log(this.board.squares[i][j]);
    switch (this.board.squares[i][j])
    {
      case 0:
        // highlight possible directions
        this.clearBoard()
        this.highlightedSpace = [i,j]
        this.board.squares[i][j] = 4
        var valid = this.board.getValidPlacements(this.currShip(),i,j)
        for(var i = 0; i < valid.length; i++)
        {
          var index = valid[i]
          this.board.squares[index[0]][index[1]] = 5
        }
        break;
      case 1:
        //ship there do nothing
        break;
      case 2:
        //ship there do nothing
        break;
      case 3:
        //i forgot what 3 was supposed to be so do nothing
        break;
      case 4:
        //just clicked there do nothing
        break;
      case 5:
        //place ship
        this.placeCurrShip(i,j)
        this.clearBoard()
        break;
      default:
        console.error("this should not be on the board");
        Error("this should not be on the board");
    }
    if(this.unplaced_ships.length <= 0)
    {
      return "turn over"
    }
  }

  clearBoard()
  {
    for(var i = 0; i < this.board.squares.length; i++)
    {
      for(var j = 0; j < this.board.squares[i].length; j++)
      {
        if(this.board.squares[i][j] === 4 || this.board.squares[i][j] === 5)
        {
          this.board.squares[i][j] = 0
        }
      }
    }
  }

  alreadyAttacked(x,y)
  {
    for(var i = 0; i <  this.attacked_squares.length; i++)
    {
      if(this.attacked_squares[i][0] === x && this.attacked_squares[i][1] === y)
      {
        return true
      }
    }
    return false
  }

  autoMove(game)
  {

  }
}

class Human extends Player
{
  constructor(name)
  {
    super(name)
  }
}

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



function makeArray(w, h, val)
{
  var arr = [];
  for(let i = 0; i < h; i++) {
      arr[i] = [];
      for(let j = 0; j < w; j++) {
          arr[i][j] = val;
      }
  }
  return arr;
}


exports.BattleShips = BattleShips
exports.Human = Human
exports.Computer = Computer
