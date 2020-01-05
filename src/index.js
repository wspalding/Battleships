import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
const game = require('./utils/game.js');
const player = require('./utils/player.js');

class ViewController extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
      game: null,
      gameOver: true,
      player1: null,
      player2: null,
      p1name: "",
      p2name: "",
    }
    this.startGame = this.startGame.bind(this)
    this.handleP1name = this.handleP1name.bind(this)
    this.handleP2name = this.handleP2name.bind(this)
    this.handleP1type = this.handleP1type.bind(this)
    this.handleP2type = this.handleP2type.bind(this)
  }

  render()
  {
    if(!this.state.gameOver)
    {
      return(
        <div class="page">
          <Game game={this.state.game} />
        </div>
      )
    }
    else
    {
      return(
        <div class="page">
          <Menu startFunc={this.startGame}
              handleP1name={this.handleP1name}
              handleP2name={this.handleP2name}
              handleP1type={this.handleP1type}
              handleP2type={this.handleP2type} />
        </div>
      )
    }
  }

  startGame(event)
  {
    // console.log("starting game", event);
    // var player1 = "p1"
    // var player2 = "p2"
    var n1 = (this.state.p1name === "") ? "player 1" : this.state.p1name
    var n2 = (this.state.p2name === "") ? "player 2" : this.state.p2name
    var player1 = (this.state.p1type === "human") ? new player.Human(n1) : new player.Computer(n1);
    var player2 = (this.state.p2type === "human") ? new player.Human(n2) : new player.Computer(n2);
    this.setState({
      game: new game.BattleShips(player1, player2),
      gameOver: false,
    })
    event.preventDefault()
  }

  handleP1name(event)
  {
    this.setState({
      p1name: event.target.value
    })
  }

  handleP2name(event)
  {
    this.setState({
      p2name: event.target.value
    })
  }

  handleP1type(event)
  {
    this.setState({
      p1type: event.target.value
    })
  }

  handleP2type(event)
  {
    this.setState({
      p2type: event.target.value
    })
  }

}

class Menu extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
      gameOver: true,
    }

  }

  render()
  {

      return(
        <div class="col menu_body">

          {header()}

          <div class="row">

            <form onSubmit={this.props.startFunc} class="options">
                <div class="row player_options">
                  <label>
                    Player 1:
                    <input type="text" placeholder="Player 1 Name" value={this.props.p1name} onChange={this.props.handleP1name}/>
                    Human <input type="radio" name="p1_type" value="human" onChange={this.props.handleP1type}  required/>
                    Computer <input type="radio" name="p1_type" value="computer" onChange={this.props.handleP1type}  required/>
                  </label>
              </div>

              <div class="row player_options">
                <label>
                  Player 2:
                  <input type="text" placeholder="Player 2 Name" value={this.props.p2name} onChange={this.props.handleP2name}/>
                  Human <input type="radio" name="p2_type" value="human" onChange={this.props.handleP2type}  required/>
                  Computer <input type="radio" name="p2_type" value="computer" onChange={this.props.handleP2type}  required/>
                </label>
              </div>

              <div class="row submit_line">
                <div class="col">
                  <input type="submit" value="Start Game" />
                </div>
              </div>

            </form>

          </div>

        </div>
      )
  }
}


class Game extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
      game: props.game
    };
    props.game.p1.autoMove(props.game)
  }

  render()
  {

    return(

      <div>
        {header()}
        <div class="row">
          <div class="col phase">
            {this.state.game.getPhaseString()}
          </div>
        </div>
        <div class="row game_display">

          <div class="col board_col">
            <div class={(this.state.game.turn === this.state.game.p1) ? "":"hidden"}>
              {this.state.game.p1.name}
              {this.renderBoard(this.state.game.p1)}
            </div>
          </div>
          <div class="col board_col">
            <div class={(this.state.game.turn === this.state.game.p2) ? "":"hidden"}>
              {this.state.game.p2.name}
              {this.renderBoard(this.state.game.p2)}
            </div>
          </div>
          <div class="col-sm-3 hist_col">
            {this.gameHistory(this.state.game.getEvents())}
          </div>

        </div>
      </div>
    )
  }

  renderBoard(player)
  {

    // console.log(player);

    var topBoard = player.getHitBoard(this.state.game.otherPlayer(player).board)
    // console.log(topBoard);
    var botBoard = player.board


    var topRows = topBoard.map((item, i) =>
    {
      var entry = item.map((element, j) =>
      {
        // var value = (element) ? "hit/miss" : String.fromCharCode(97 + i) + (j+1)
        return (
          <td class="topBoard_table_cell" key={j}> {this.renderTopBoard(element,i,j)} </td>
        );
      });

      return (
            <tr key={i}> {entry} </tr>
      );
    })

    var botRows = botBoard.squares.map((item, i) =>
    {
      var entry = item.map((element, j) =>
      {
        var value = this.renderBotSquare(player,i,j)
        return (
          <td class="botBoard_table_cell" key={j}> {value} </td>
        );
      });

      return (
            <tr key={i}> {entry}</tr>
      );
    })



    return(
      <div class="board">

          <div class="row topBoard">
            <table class="top_board_table_body">
              <tbody>
              {topRows}
              </tbody>
            </table>
          </div>

          <br/>

          <div class="row botBoard">
            <table class="bot_board_table_body">
              <tbody>
                {botRows}
              </tbody>
            </table>
          </div>

          <div class="row ship_box">

          </div>

      </div>
    )
  }

  handleBotClick(player,i,j)
  {
    if(player.boardPressed(i,j) === "turn over")
    this.state.game.swapTurns()
    this.forceUpdate()
  }

  renderBotSquare(player,i,j)
  {
      var value = this.state.game.getBoardValue(player, i, j)
      var img = " "
      var button_class = "square "
      switch (value) {
        case 0:
          button_class += "empty_square"
          break;
        case 1:
          button_class += "miss"
          img = missImg()
          break;
        case 2:
          button_class += "ship"
          break;
        case 3:
          button_class += "hit"
          img = explosionImg()
          break;
        case 4:
          button_class += "selected"
          break;
        case 5:
          button_class += "highlighted"
          break;
        default:

      }
      return(
        <button
        className={button_class}
        onClick={()=>this.handleBotClick(player,i,j)}>
          {img}
        </button>
      )
  }

  handleTopClick(i,j)
  {
    this.state.game.attack(i,j)
    this.forceUpdate()
  }

  handleAlreadyAttacked(value)
  {
    this.state.game.sendMessage("already attacked " + value)
    this.forceUpdate()
  }

  renderTopBoard(element,i,j)
  {
    var button_class = ""
    switch (element) {
      case 0:
        // button_class = "empty_square"
        break;
      case "miss":
        button_class = "top_miss"
        break;
      case "hit":
        button_class = "top_hit"
        break;
      default:
    }
    var value = String.fromCharCode(97 + i) + (j+1)
    var class_name = "square " + button_class
    var func = (button_class === "") ? ()=>this.handleTopClick(i,j) : ()=>this.handleAlreadyAttacked(value)
    return(
      <button
      className={class_name}
      onClick={func}>
        {value}
      </button>
    )
  }

  gameHistory(events)
  {
    // console.log(events);
    return(
      <div class="history">
        {events.map((i,key) => {
          return <div class="history_message" key={key}>{i}</div>;
        })}
      </div>
    )
  }

  startGame(numPlayers)
  {
    this.setState({
      game: new game.BattleShips("p1", "p2"),
      gameOver: false,
    })
  }
}

function explosionImg()
{
  const path = process.env.PUBLIC_URL + 'imgs/Explosion-PNG-HD.png'
  return(
      <img src={path} class="button_img"></img>
  )
}

function missImg()
{
  const path = process.env.PUBLIC_URL + 'imgs/miss-explosion.png'
  return(
      <img src={path} class="button_img"></img>
  )
}

function header()
{
  const title_path = process.env.PUBLIC_URL + 'imgs/battleship-png-6.png'
  return(
    <div class="col header">
      <img class="header_img" src={title_path}></img>
      <h1 class="title">
        BATTLESHIPS
      </h1>
    </div>
  )
}




ReactDOM.render
(
  <ViewController />,
  document.getElementById('root')
);
