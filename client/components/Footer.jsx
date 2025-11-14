import React from 'react'
import { FaInstagramSquare } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className='border-t-[0.2px]'>
        <div className="container mx-auto p-4 text-center flex flex-col lg:flex-row lg:justify-between gap-2 ">
            <p>© All Rights Reserved 2024-2025</p>
            <div className='flex items-center gap-5 justify-center text-3xl'>
                <a href="http://" >
                    <FaInstagramSquare className='hover:text-[#b55dbb]'/>
                </a>
                <a href="http://">
                    <FaLinkedin className='hover:text-[#b55dbb]'/>
                </a>
                <a href="http://">
                    <FaGithub className='hover:text-[#b55dbb]'/>
                </a>
            </div>
        </div>

    </footer>
  )
}

export default Footer