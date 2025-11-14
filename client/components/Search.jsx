import React, { useEffect, useState } from 'react'
import { IoSearch } from "react-icons/io5";
import { useLocation, useNavigate ,Link} from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import SearchPage from '../src/pages/SearchPage';
import { FaArrowLeft } from "react-icons/fa";
import useMobile from '../src/hooks/useMobile';



const Search = () => {
    const navigate = useNavigate();//used to redirect
    const location = useLocation();//used to retrieve the location
    const [isSearchPage,setIsSearchPage] = useState(false);
    const [isMobile] = useMobile()
    const params = useLocation() 
    const searchParams = new URLSearchParams(params.search)
    const searchText = searchParams.get('q') || ''
    //to know if in search page
    useEffect(()=>{
        const isSearch = location.pathname === "/search";
        setIsSearchPage(isSearch)
    },[location])

    const handleOnChange =(e)=>{
        const value = e.target.value;
        const url = `/search?q=${encodeURIComponent(value)}`
        navigate(url)
        // console.log(value)
    }
    const redirectToSearch=()=>{
        navigate("/search")
    }

  return (
    <div className=" focus-within:border-[1.5px] focus-within:border-violet-500 w-full min-w-[300px] lg:min-w-[420px] h-11 lg:h-12  rounded-lg border-[.1px] overflow-hidden flex items-center  text-neutral-400 bg-slate-100" >
        <div className='flex justify-between'>
            
            {
                (isMobile && isSearchPage)
                ?<Link to={"/"} className='flex justify-center items-center h-full w-full p-3 mr-5 bg-white rounded-xl shadow-2xl'>
                <FaArrowLeft size={22}/>
                </Link>
                :<button className='flex justify-center items-center h-full p-3 ' >
                <IoSearch size={25}/>
                 </button>

            }

            
        
        </div>
        <div className='w-full h-full '>
            {
                !isSearchPage ?(
                    //not in search
                    <div onClick={redirectToSearch} className='w-full h-full  flex  items-center'>
                    <TypeAnimation
                    sequence={[
                // Same substring at the start will only be typed out once, initially
                'Search for "milk"',
                2000, // wait 1s before replacing "Mice" with "Hamsters"
                'Search for "chocolate"',
                2000,
                'Search for "eggs"',
                2000,
                'Search for "biskut"',
                2000,

                'Search for "rice"',
                2000,
                'Search for "real madrid Jersey"',
                2000,
                'Search for "hala madrid"',
                2000,
                'Search for "chips"',
                2000,
                'Search for "bread"',
                2000,

            ]}
            wrapper="span"
            speed={30}
            style={{ fontSize: '1.15rem', display: 'inline-block' }}
                    repeat={Infinity}
                    />
                    </div>
                ):(
                    //when in search
                    <div className='w-full h-full '>
                        <input type="text"
                                placeholder='Search for eggs,milk and more.....'
                                onChange={handleOnChange}
                                defaultValue={searchText}
                                autoFocus={true}
                                className='bg-transparent w-full h-full outline-none  text-neutral-500 text-[1.15rem]' 
                        />
                    </div>
                )
            }
        </div>
        
    </div>
        
  )
}

export default Search