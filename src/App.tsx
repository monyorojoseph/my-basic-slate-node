import { Descendant } from "slate"
import SlateNode from "./components/SlateNode/SlateNode"

const initialValue = [] as Descendant[]

function App() {

  return (
    <>
      <section className="h-screen w-full">
        <div className="w-10/12 mx-auto mt-7">
          <SlateNode initialValue={initialValue} readOnly={false}/>
        </div>        
      </section>
    </>
  )
}

export default App
