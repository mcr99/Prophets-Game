import React, { use, useState } from 'react'
import { useEffect } from 'react'
export default function Card() {
    const [color ,setColor]=useState(true)
    useEffect(()=>{
        return ()=>{
            console.log("se ha desmontado")
        }
    },[])
  return (
    <div className={`border-2 ${color? "border-red-500":"border-blue-500"} p-10 gap-4 flex flex-col`}>
      card
      <button onClick={()=>{setColor(!color)}}>cambiar</button>
    </div>
  )
}
