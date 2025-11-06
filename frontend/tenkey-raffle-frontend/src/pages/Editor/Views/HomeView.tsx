import { useLocation } from "wouter"


export function HomeView() {

  const [location, navigate] = useLocation()
  navigate('/editor/participants')

  return (
    <></>
  )

}