import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchMovies } from '../redux/movieSlice'

const Home = () => {

 const dispatch = useDispatch()
 const {movies, loading, error} = useSelector((state) => state.movie)
 const navigate = useNavigate()

 console.log(movies)

 useEffect(() => {
  dispatch(fetchMovies())
 }, [dispatch])

  return (
    <div>
        <h1>Welcome to the Home Page</h1>
    </div>
  )
}

export default Home