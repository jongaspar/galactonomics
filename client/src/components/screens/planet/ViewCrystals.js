import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import MPIContainer from 'components/screens/planet/MPIContainer'
import handleChange from 'utils/handleChange'
import uuid from 'utils/uuid'
import Dialog from 'components/reusables/Dialog'
import SellOrder from 'components/reusables/SellOrder'
import getPlayerInfo from 'utils/getPlayerInfo'
import Loader from 'components/reusables/Loader'
import * as THREE from 'three'

const styles = {
  crystal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    '& > div': {
      border: '1px solid grey',
      padding: 8,
    }
  }
}

class ViewCrystals extends Component {
  constructor() {
    super()
    this.state = {
      crystals: [],
      sellAmount: '',
      sellPrice: '',
      isSellBoxVisible: false,
      isLoading: false,
      selectedCrystalId: null,
    }
    this.handleChange = handleChange.bind(this)
  }

  componentDidMount = () => {
    this.crystalsOfOwner()
  }

  componentDidUpdate = (_, prevState) => {
    if (prevState.crystals.length !== this.state.crystals.length) {
      this.state.crystals.forEach((crystal, i) => this.renderCrystal(i, crystal.uri))
    }
  }

  renderCrystal = (id, uri) => {
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(100, window.innerWidth/window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(90, 120);

    const div = document.getElementById(id)
    div.appendChild(renderer.domElement);

    var box = new THREE.SphereGeometry(2, 6, 1);
    var mesh = new THREE.MeshLambertMaterial({
      reflectivity: 1000,
    });
    var cube = new THREE.Mesh(box, mesh);
    scene.add(cube);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
    scene.add(directionalLight);

    // Take first 6 characters of URI string and use for the colour
    const color = eval('0x' + uri.substr(0, 6))
    var light = new THREE.PointLight(color, 25, 100);
    light.position.set(50, 50, 50);
    scene.add(light);

    cam.position.z = 2.75;
    cube.rotation.x = 0.05;
    var render = function() {
      requestAnimationFrame(render);
      cube.rotation.y += 0.01;
      renderer.render(scene, cam);
    };

    render();
  }

  crystalsOfOwner = async () => {
    const { contracts, user } = this.props
    const crystals = []

    try {
      const crystalIds = await contracts.temple.crystalsOfOwner(user.address, { from: user.address })
      if (crystalIds && crystalIds.length) {
        for (let id of crystalIds) {
          crystals.push({
            id: id.toString(),
            uri: await contracts.temple.crystalURI(id, { from:user.address })
          })
        }
      }
    } catch (e) {
      console.error(e)
    }

    this.setState({ crystals })
  }

  onClickSell = () => {
    this.setState({ isSellBoxVisible: true })
  }

  sell = async () => {
    const { contracts, user } = this.props
    const { selectedCrystalId, sellPrice } = this.state

    try {
      await contracts.temple.sell(selectedCrystalId, sellPrice, { from: user.address })
    } catch (e) {
      console.error(e)
    }

    this.crystalsOfOwner()
    this.setState({ isSellBoxVisible: false })
  }

  render() {
    const { classes } = this.props
    const {
      crystals,
      sellAmount,
      sellPrice,
      isSellBoxVisible,
      isLoading,
      selectedCrystalId,
    } = this.state

    const sideButtons = [
      { fn: this.onClickSell, label: 'Sell' },
    ]

    return (
      <MPIContainer sideButtons={sideButtons}>
        <div className={classes.container}>
          {crystals.map((crystal, i) =>
            <div
              key={i}
              className={classes.crystal}
              onClick={() => this.setState({ selectedCrystalId: crystal.id })}
            >
              <div style={{
                backgroundColor: selectedCrystalId === crystal.id ? '#fff' : null,
                color: selectedCrystalId === crystal.id ? '#000' : null,
              }}>
                {crystal.id}
              </div>
              <div>
                {crystal.uri}
              </div>
              <div id={i}>
              </div>
            </div>
          )}
        </div>

        {/* Sell box */}
        <Dialog type="status" isVisible={isSellBoxVisible}>
          <div>
            Sell crystal with id {selectedCrystalId}
          </div>
          <label htmlFor="sellPrice">
            Price
            <input name="sellPrice" defaultValue={sellPrice} type="number" onChange={this.handleChange}></input>
          </label>
          <Rect
            type="status"
            isButton
            onClick={this.sell}
          >Ok</Rect>
        </Dialog>
      </MPIContainer>
    )
  }
}

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    user: state.user,
    web3: state.web3,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setAlertBoxContent: content => dispatch({ type: 'SET_ALERT_BOX_CONTENT', content }),
  }
}

ViewCrystals = connect(mapStateToProps, mapDispatchToProps)(ViewCrystals)
ViewCrystals = injectSheet(styles)(ViewCrystals)
export default ViewCrystals;
