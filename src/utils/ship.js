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





module.exports.Ship = Ship
