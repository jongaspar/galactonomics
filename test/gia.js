const GalacticCentralAuthority = artifacts.require("./GalacticCentralAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const Commodity = artifacts.require("./Commodity.sol")

contract("GalacticIndustrialAuthority", accounts => {
  let gia, commodities
  const owner = accounts[0]
  const alice = accounts[1]
  const bob = accounts[2]
  const eve = accounts[3]

  beforeEach(async() => {
    commodities = [
      await Commodity.new("Fermented Gookala Eggs", "FGE", 0),
      await Commodity.new("Mufasta Goop", "MFG", 0),
      await Commodity.new("Byzantimum Crystals", "BZC", 0),
      await Commodity.new("Superalloy Sprockets", "SAS", 0),
      await Commodity.new("Arrakian Worm Milk", "AWM", 0),
      await Commodity.new("Auxilliary Omnireceptors", "AOR", 0),
      await Commodity.new("L-337 Nanobulators", "L3N", 0)
    ]

    const commodityAddresses = commodities.map(commodity => commodity.address)

    gia = await GalacticIndustrialAuthority.new(commodityAddresses)
  })

  it("should store all the commodities", async () => {
    for (let i = 0; i < commodities.length; i++) {
      const commodity = await gia.getCommodity(i)
      assert.equal(commodity[0], await commodities[i].name(), 'not stored')
    }
  })

  it("should allow owner to mint commodities for another account", async () => {
    const amount = 95421
    await commodities[0].mint(bob, amount)
    const balanceBob = await commodities[0].balanceOf(bob)
    assert.equal(amount, balanceBob, 'could not mint')
  })

  it("should not allow a non-owner to mint commodities", async () => {
    const amount = 95421
    try {
      await commodities[0].mint(bob, amount, { from: eve })
    } catch(e) {
      return assert(true)
    }
    assert(false, 'was able to mint')
  })
})