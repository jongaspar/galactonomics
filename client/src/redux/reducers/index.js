import { combineReducers } from 'redux'

import web3 from './web3'
import contracts from './contracts'
import view from './view'
import user from './user'

const appReducer = combineReducers({
  web3,
  contracts,
  view,
  user,
})

export default (state, action) => appReducer(state, action)