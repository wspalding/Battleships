const ship = require('./ship.js');
const misc = require('./misc.js');

class Player
{
  constructor(name)
  {
    this.name = name
    this.isTurn = false
    this.unplaced_ships = [new ship.Ship(2),new ship.Ship(3),new ship.Ship(4),new ship.Ship(5)]
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
    var b = misc.makeArray(this.board.size, this.board.size, 0)
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



exports.Human = Human
exports.Computer = Computer
