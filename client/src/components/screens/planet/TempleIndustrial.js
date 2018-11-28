import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import LaserFrame from 'components/reusables/LaserFrame'
import MPIContainer from 'components/screens/planet/MPIContainer'
import getPlayerInfo from 'utils/getPlayerInfo'
import Loader from 'components/reusables/Loader'
import Crystal from 'components/reusables/Crystal'
import Sound from 'react-sound';
import aCrystalWasForged from 'assets/sounds/aCrystalWasForged.wav'

const styles = {
  acceptDecline: {
    flexDirection: 'row',
  }
}

class TempleIndustrial extends Component {
  constructor() {
    super()
    this.state = {
      isForging: false,
      isDialogVisible: false,
      playSound: false,
    }
  }

  forge = async () => {
    const { contracts, user } = this.props
    this.setState({ isForging: true })

    try {
      await contracts.temple.forge({ from: user.address })
    } catch (e) {
      console.error(e)
    }

    this.getLatestCrystalURI()
    this.setState({
      isForging: false,
    })
    await getPlayerInfo()
  }

  getLatestCrystalURI = async () => {
    const { contracts, user } = this.props
    let lastURI

    this.setState({ isLoading: true })

    try {
      const crystalIds = await contracts.temple.crystalsOfOwner(user.address, { from: user.address })
      const lastId = crystalIds[crystalIds.length - 1]
      lastURI = await contracts.temple.crystalURI(lastId, { from:user.address })
    } catch (e) {
      console.error(e)
    }

    this.setState({
      crystalURI: lastURI,
      isLoading: false,
      playSound: true,
    }, () => {
      this.props.setDialogBox(
        <Fragment>
          You have forged a new crystal:
          {lastURI && <Crystal uri={lastURI} />}
        </Fragment>,
        'good',
      )
    })
  }

  render() {
    const { classes } = this.props
    const { isForging, isDialogVisible, crystalURI, playSound } = this.state

    return (
      <MPIContainer>
        <LaserFrame
          size="wide"
        >
          <div>Would like to forge a crystal?</div>
          <div>(Requires 10,000 kg of all 7 commodities)</div>
          <div className={classes.acceptDecline}>
            {isForging ?
              <Loader />
              :
              <Fragment>
                <LaserFrame
                  isButton
                  flavour="bad"
                >Decline</LaserFrame>
                <LaserFrame
                  isButton
                  flavour="good"
                  onClick={this.forge}
                >Accept</LaserFrame>
              </Fragment>
            }
          </div>
        </LaserFrame>
        <Sound
          url={aCrystalWasForged}
          playStatus={playSound && Sound.status.PLAYING}
          volume={25}
          onFinishedPlaying={() => this.setState({ playSound: false })}
        />
      </MPIContainer>
    )
  }
}

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    user: state.user,
    web3: state.web3,
    industrial: state.industrial,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setDialogBox: (content, flavour)=> dispatch({ type: 'SET_DIALOG_BOX', content, flavour }),
    setIndustrialState: industrialState => dispatch({ type: 'SET_INDUSTRIAL_STATE', industrialState }),
  }
}

TempleIndustrial = connect(mapStateToProps, mapDispatchToProps)(TempleIndustrial)
TempleIndustrial = injectSheet(styles)(TempleIndustrial)
export default TempleIndustrial;
