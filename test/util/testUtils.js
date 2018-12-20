const sha256 = require('js-sha256');

function fillUpCargoByMining(commodities, transitAuthority, player, commodityId) {
  /* Fills cargo up by investments (will stop when another investment would be too much cargo) */
  return new Promise(async (resolve, reject) => {
    let maxCargo, currentCargo, miningReward

    do {
      try {
        const miningData = await commodities.getCommodity(commodityId, { from: player })
        const miningTarget = miningData[2]
        const prevHash = miningData[3]

        let nonce = 0
        let hash
        do {
          nonce++
          hash = sha256(
            nonce.toString() +
            commodityId.toString() +
            prevHash +
            player.substring(2)
          )

        } while (parseInt(hash, 16) >= parseInt(miningTarget, 16))

        await commodities.mine(String(nonce), { from: player })

      } catch (e) {
        reject(e)
      }

      maxCargo = (await transitAuthority.addressToSpaceship(player))[2]
      currentCargo = await commodities.getCurrentCargo(player)
      miningReward = await commodities.getMiningReward(commodityId)

    } while (maxCargo.sub(currentCargo).gt(miningReward))

    resolve()
  })
}

function mineCommodityXTimes(commodities, numTimes, player, commodityId) {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < numTimes; i++) {
      try {
        const miningData = await commodities.getCommodity(commodityId, { from: player })
        const miningTarget = miningData[2]
        const prevHash = miningData[3]

        let nonce = 0
        let hash
        do {
          nonce++
          hash = sha256(
            nonce.toString() +
            commodityId.toString() +
            prevHash +
            player.substring(2)
          )
        } while (parseInt(hash, 16) >= parseInt(miningTarget, 16))

        await commodities.mine(String(nonce), { from: player })

      } catch (e) {
        reject(e)
      }
    }
    resolve()
  })
}

async function getCommoditiesTraded(economicAuthority) {
  /*
    Returns promise that resolves with array of arrays
    containing ids of commodities traded on each planet.
    Parent array of returned 2d-array is indexed by planetId
  */
  return new Promise(async (resolve, reject) => {
    try {
      const tradedOnPlanet = []
      for (let p = 0; p < 7; p++) {
        const traded = (await economicAuthority.getCommoditiesTraded(p))
          .toString()
          .split(',')
          .map(string => Number(string))
        tradedOnPlanet.push(traded)
      }
      resolve(tradedOnPlanet)
    } catch (e) {
      reject(e)
    }
  })
}

function getRandomPlanetToSell(commodityId, tradedOnPlanet) {
  const planetsTradedOn = []
  tradedOnPlanet.forEach((planet, i) => {
    if (planet.includes(commodityId)) {
      planetsTradedOn.push(i)
    }
  })

  const randomIndex = Math.floor(Math.random() * planetsTradedOn.length)
  return planetsTradedOn[randomIndex]
}

module.exports = {
  fillUpCargoByMining,
  mineCommodityXTimes,
  getCommoditiesTraded,
  getRandomPlanetToSell,
}