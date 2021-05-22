module.exports.hasWon = function (activeIndexList) {
  const virtGamefield = []
  for (let i = 0; i < 25; i++) {
    virtGamefield[i] = { clicked: activeIndexList.includes(i) }
  }
  const offset = 5
  // horizontal
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (!virtGamefield[i * offset + j].clicked) {
        break
      }

      if (j === 4) {
        return true
      }
    }
  }

  // vertical
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (!virtGamefield[j * offset + i].clicked) {
        break
      }

      if (j === 4) {
        return true
      }
    }
  }

  // top-left to bottom-right
  for (let i = 0; i < 5; i++) {
    if (!virtGamefield[i * (offset + 1)].clicked) {
      break
    }

    if (i === 4) {
      return true
    }
  }

  // top-right to bottom-left
  for (let i = 1; i < 6; i++) {
    if (!virtGamefield[i * (offset - 1)].clicked) {
      break
    }

    if (i === 5) {
      return true
    }
  }
  return false
}
