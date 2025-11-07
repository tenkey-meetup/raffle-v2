import { useLocation } from "wouter"

// メニューから/editorに来た場合、/editor/participantsへリダイレクトするだけ
export function HomeView() {

  const [location, navigate] = useLocation()
  navigate('~/editor/participants')

  return (
    <>
      Home
    </>
  )

}