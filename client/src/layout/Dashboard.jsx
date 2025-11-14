import React from 'react'
import UserMenu from '../../components/UserMenu'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'


const Dashboard = () => {

    const user = useSelector(state=>state.user)
    // console.log(user)
  return (
      <section className='bg-white'>
        <div className='container mx-auto p-3 grid lg:grid-cols-[200px_1fr] '>
            {/* left */}
            <div className="py-4 sticky top-24 max-h-[calc(100vh - 96px)] overflow-y-auto hidden border-r border-slate-400 lg:block">
                <UserMenu/>
            </div>


            {/* right */}
            <div className="bg-white min-h-[79vh]">
                <Outlet/>
            </div>
            
            
            
            
            </div>
        </section>
  )
}

export default Dashboard