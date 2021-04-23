import React from 'react'

export default function({type}){
    if(type === 'table'){
        return (<tbody className="text-center"><tr><td><img className="spinner" alt="Loading..." src="../logo.svg"></img></td></tr></tbody>)
    }else{
        return(<div className="text-center"><img className="spinner" alt="Loading..." src="../logo.svg"></img> </div>)
    }
}