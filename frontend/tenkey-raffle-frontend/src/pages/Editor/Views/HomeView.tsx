import { useLocation } from "preact-iso"

export function HomeView() {

  const location = useLocation()
  location.route('/editor/participants')

  return (
    <></>
  )

}