import React from 'react'
import { useSelector } from 'react-redux'
import isAdmin from '../../utils/isAdmin';

const AdminPermission = ({children}) => {
    const user = useSelector(state=>state.user);


  return (
    <>
    {
        isAdmin(user.role) ? children : <p className='p-4 text-red-500 bg-red-200'>Dont have permission</p>
    }
    </>
)
}

export default AdminPermission