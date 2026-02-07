// console.log(window.location)
// const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS || "http://localhost:6001"
const backendAddress = `${window.location.protocol}//${window.location.hostname}:6001`
console.log(backendAddress)
export const API_BASE_URL = `${backendAddress}/api`

export const API_ROUTE_ALL_PARTICIPANTS = API_BASE_URL + "/v1/participants"
export const API_ROUTE_ALL_PRIZES = API_BASE_URL + "/v1/prizes"
export const API_ROUTE_MAPPINGS = API_BASE_URL + "/v1/mappings"
export const API_ROUTE_RAFFLE = API_BASE_URL + "/v1/raffle"
export const API_ROUTE_ALL_CANCELS = API_BASE_URL + "/v1/participants/cancels/all"
export const API_ROUTE_EDIT_CANCELS = API_BASE_URL + "/v1/participants/cancels/edit"

export const WINDOW_HEADER_COLOR = "#85D68B"
export const TRANSITION_PANE_COLOR = "#A4E8A9"
export const TRANSITION_OVERLAY_TEXT_COLOR = "#3D6F45"
export const FOREGROUND_TEXT_COLOR = "#3D6F45"
export const BUTTON_PRIMARY_BACKGROUND_COLOR = "#C4F5CE"
export const BUTTON_PRIMARY_BORDER_COLOR = "#3D6F45"

export const BUTTON_SECONDARY_BACKGROUND_COLOR = "#E6FFD0"
export const BUTTON_SECONDARY_BORDER_COLOR = "#70915F"

export const SECONDARY_CONTAINER_BACKGROUND_COLOR = "#A4E8A9"