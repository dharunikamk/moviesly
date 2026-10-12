import { useEffect, useMemo, useState } from 'react'
import {
  Clapperboard, Search, Compass, Bookmark, CalendarDays, Sparkles, Sun, Moon,
  ChevronRight, Clock3, Star, Play, House, Ticket, Utensils, TrainFront,
  Users, Heart, Trash2, ArrowLeft, CalendarCheck, CheckCircle2, X, SlidersHorizontal,
} from 'lucide-react'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const API = 'https://api.themoviedb.org/3'
const IMAGE = 'https://image.tmdb.org/t/p/w500'

const CATEGORIES = [
  { id: 'movies', label: 'Feature Movies', kind: 'movie' },
  { id: 'shorts', label: 'Short Films', kind: 'movie' },
  { id: 'documentaries', label: 'Documentaries', kind: 'movie' },
  { id: 'animation', label: 'Animation & Anime', kind: 'movie' },
  { id: 'series', label: 'TV Series & Mini-Series', kind: 'tv' },
]

const LANGUAGES = [
  ['Any language', ''], ['English', 'en'], ['Tamil', 'ta'], ['Hindi', 'hi'], ['Telugu', 'te'],
  ['Malayalam', 'ml'], ['Kannada', 'kn'], ['Bengali', 'bn'], ['Marathi', 'mr'], ['Korean', 'ko'],
  ['Japanese', 'ja'], ['Chinese', 'zh'], ['Spanish', 'es'], ['French', 'fr'], ['German', 'de'],
  ['Italian', 'it'], ['Portuguese', 'pt'], ['Arabic', 'ar'], ['Thai', 'th'], ['Turkish', 'tr'],
  ['Indonesian', 'id'], ['Russian', 'ru'], ['Persian', 'fa'], ['Dutch', 'nl'], ['Polish', 'pl'],
]

const GENRES = [
  ['Action', 28], ['Adventure', 12], ['Animation', 16], ['Comedy', 35], ['Crime', 80],
  ['Documentary', 99], ['Drama', 18], ['Family', 10751], ['Fantasy', 14], ['History', 36],
  ['Horror', 27], ['Music', 10402], ['Mystery', 9648], ['Romance', 10749], ['Science Fiction', 878],
  ['TV Movie', 10770], ['Thriller', 53], ['War', 10752], ['Western', 37],
]

const MOODS = ['Happy', 'Relaxed', 'Romantic', 'Adventurous', 'Emotional', 'Excited']
const COMPANIONS = ['Alone', 'Couple', 'Friends', 'Family']
const SNACKS = ['Popcorn', 'Pizza', 'Burger', 'Nachos', 'Drinks', 'Homemade snacks']

const SAMPLE_MOVIES = [
  {
    id: 'sample-1',
    title: 'Interstellar',
    year: '2014',
    rating: '8.7',
    duration: 169,
    overview: 'A science-fiction adventure across space and time.',
    genreIds: [878, 12, 18],
    language: 'en',
    poster: null,
    mediaType: 'movie',
  },
  {
    id: 'sample-2',
    title: 'The Grand Budapest Hotel',
    year: '2014',
    rating: '8.1',
    duration: 99,
    overview: 'A whimsical comedy of an extraordinary hotel concierge.',
    genreIds: [35, 18],
    language: 'en',
    poster: null,
    mediaType: 'movie',
  },
  {
    id: 'sample-3',
    title: 'Spider-Man: Into the Spider-Verse',
    year: '2018',
    rating: '8.4',
    duration: 117,
    overview: 'An animated superhero adventure across dimensions.',
    genreIds: [16, 28, 12],
    language: 'en',
    poster: null,
    mediaType: 'movie',
  },
  {
    id: 'sample-4',
    title: 'La La Land',
    year: '2016',
    rating: '8.0',
    duration: 128,
    overview: 'A musician and an actor pursue their dreams in Los Angeles.',
    genreIds: [35, 18, 10749, 10402],
    language: 'en',
    poster: null,
    mediaType: 'movie',
  },
]

const NAV_ITEMS = [
  { label: 'Home', icon: Compass },
  { label: 'Discover', icon: Search },
  { label: 'Mood Matcher', icon: Sparkles },
  { label: 'Movie Night', icon: CalendarDays },
  { label: 'Watchlist', icon: Bookmark },
  { label: 'My Plans', icon: CalendarCheck },
]

function readStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`MOVIESLY could not save ${key} in this browser.`, error)
  }
}

function PosterArt({ movie, className = '' }) {
  const [failed, setFailed] = useState(false)
  const poster = movie?.poster

  if (poster && !failed) {
    return (
      <img
        src={poster}
        alt={`${movie.title} poster`}
        loading="lazy"
        onError={() => setFailed(true)}
        className={className}
      />
    )
  }

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#F5D8CC] via-[#EADCE8] to-[#292522] p-4 text-center text-[#292522] ${className}`}
      role="img"
      aria-label={`${movie?.title || 'Movie'} poster unavailable`}
    >
      <span className="text-4xl" aria-hidden="true">🎬</span>
      <span className="line-clamp-3 text-sm font-black leading-snug">
        {movie?.title || 'MOVIESLY'}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
        Poster unavailable
      </span>
    </div>
  )
}

function formatTime(date) {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateTime(date) {
  return date.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + Number(minutes || 0) * 60000)
}

function getMinutes(date, time) {
  const [hours, minutes] = (time || '19:00').split(':').map(Number)
  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

function normalize(item, mediaType = 'movie') {
  return {
    id: item.id,
    title: item.title || item.name || 'Untitled',
    year: (item.release_date || item.first_air_date || '').slice(0, 4) || 'Unknown',
    rating: Number(item.vote_average || 0).toFixed(1),
    duration: item.runtime || null,
    overview: item.overview || 'No description available.',
    genreIds: item.genre_ids || [],
    language: item.original_language || '',
    poster: item.poster_path ? `${IMAGE}${item.poster_path}` : null,
    mediaType,
  }
}

async function apiRequest(path, params = {}) {
  if (!API_KEY) {
    throw new Error(
      'TMDB API key is missing. Add VITE_TMDB_API_KEY to the root .env.local file.'
    )
  }

  const query = new URLSearchParams({
    api_key: API_KEY,
    language: 'en-US',
    ...params,
  })

  const response = await fetch(`${API}${path}?${query}`)

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status})`)
  }

  return response.json()
}

function App() {
  const [dark, setDark] = useState(
    () => readStorage('moviesly-theme', 'ivory') === 'midnight'
  )
  const [page, setPage] = useState('Home')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('movies')
  const [language, setLanguage] = useState('')
  const [selectedGenres, setSelectedGenres] = useState([])
  const [genreMode, setGenreMode] = useState('any')
  const [movies, setMovies] = useState(SAMPLE_MOVIES)
  const [apiStatus, setApiStatus] = useState('Loading catalogue…')
  const [apiConnected, setApiConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [watchlist, setWatchlist] = useState(
    () => readStorage('moviesly-watchlist', [])
  )
  const [savedPlans, setSavedPlans] = useState(
    () => readStorage('moviesly-plans', [])
  )
  const [editingPlanId, setEditingPlanId] = useState(null)
  const [mood, setMood] = useState('Happy')
  const [companions, setCompanions] = useState('Friends')

  const [plan, setPlan] = useState({
    date: new Date().toLocaleDateString('en-CA'),
    location: 'home',
    startTime: '19:00',
    availableUntil: '23:00',
    nextDayTime: '08:00',
    bedtime: '23:00',
    snackMode: 'prepare',
    snackMinutes: '30',
    deliveryMinutes: '40',
    breakMinutes: '30',
    transport: 'public',
    travelTo: '30',
    travelBack: '30',
    boardingBuffer: '10',
    arrivalBuffer: '10',
    showtime: '18:00',
    intervalMinutes: '15',
    cinema: '',
    budget: '1000',
    snacks: ['Popcorn', 'Drinks'],
  })

  useEffect(() => {
    writeStorage('moviesly-theme', dark ? 'midnight' : 'ivory')
  }, [dark])

  useEffect(() => {
    writeStorage('moviesly-watchlist', watchlist)
  }, [watchlist])

  useEffect(() => {
    writeStorage('moviesly-plans', savedPlans)
  }, [savedPlans])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      try {
        let path = '/discover/movie'
        const params = {
          include_adult: 'false',
          sort_by: 'popularity.desc',
          page: '1',
        }

        if (category === 'series') path = '/discover/tv'
        if (category === 'documentaries') params.with_genres = '99'
        if (category === 'animation') params.with_genres = '16'

        if (category === 'shorts') {
          params['with_runtime.lte'] = '40'
          params.sort_by = 'vote_count.desc'
        }

        if (language) params.with_original_language = language

        if (selectedGenres.length) {
          const genreIds = selectedGenres.join(',')

          params.with_genres =
            category === 'documentaries'
              ? `99,${genreIds}`
              : category === 'animation'
                ? `16,${genreIds}`
                : genreIds

          if (genreMode === 'all' && selectedGenres.length > 1) {
            params.with_genres = selectedGenres.join(',')
          }
        }

        const data = await apiRequest(path, params)

        let results = (data.results || []).map((item) =>
          normalize(item, category === 'series' ? 'tv' : 'movie')
        )

        if (category === 'documentaries') {
          results = results.filter((item) => item.genreIds.includes(99))
        }

        if (category === 'animation') {
          results = results.filter((item) => item.genreIds.includes(16))
        }

        if (category === 'shorts') {
          results = results.filter(
            (item) => item.duration == null || item.duration <= 40
          )
        }

        if (selectedGenres.length && genreMode === 'all') {
          results = results.filter((item) =>
            selectedGenres.every((id) => item.genreIds.includes(Number(id)))
          )
        }

        if (!cancelled) {
          setMovies(results)
          setApiConnected(true)
          setApiStatus(
            `Connected to TMDB · ${results.length} ${category === 'series' ? 'series' : 'titles'} loaded`
          )
        }
      } catch (error) {
        if (!cancelled) {
          setApiConnected(false)
          setMovies(
            SAMPLE_MOVIES.filter(
              (item) => category === 'movies' || category === 'animation'
            )
          )
          setApiStatus(`${error.message} Showing sample titles where available.`)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [category, language, selectedGenres, genreMode])

  const visibleMovies = useMemo(() => {
    const query = search.trim().toLowerCase()

    let result = movies.filter((movie) =>
      `${movie.title} ${movie.overview}`.toLowerCase().includes(query)
    )

    if (page === 'Watchlist') {
      result = result.filter((movie) =>
        watchlist.some((saved) => saved.id === movie.id)
      )
    }

    if (page === 'Mood Matcher') {
      const words = {
        Happy: [35, 16, 12, 10751],
        Relaxed: [18, 10402, 10749],
        Romantic: [10749, 18],
        Adventurous: [12, 28, 14, 878],
        Emotional: [18, 36, 10749],
        Excited: [28, 53, 12],
      }

      const matches = result.filter((movie) =>
        movie.genreIds.some((id) => (words[mood] || []).includes(id))
      )

      if (matches.length) result = matches
    }

    return result
  }, [movies, search, page, watchlist, mood])

  const updatePlan = (key, value) => {
    setPlan((current) => ({ ...current, [key]: value }))
  }

  const toggleSnack = (snack) => {
    setPlan((current) => ({
      ...current,
      snacks: current.snacks.includes(snack)
        ? current.snacks.filter((item) => item !== snack)
        : [...current.snacks, snack],
    }))
  }

  const isSaved = (movie) =>
    watchlist.some((item) => item.id === movie.id)

  const toggleWatchlist = (movie) => {
    setWatchlist((current) =>
      current.some((item) => item.id === movie.id)
        ? current.filter((item) => item.id !== movie.id)
        : [...current, movie]
    )
  }

  const toggleGenre = (id) => {
    setSelectedGenres((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    )
  }

  const goTo = (destination) => {
    setPage(destination)
    setSelectedMovie(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // The "Surprise" button chooses one random title from the loaded catalogue.
  function surpriseMovie() {
    const pool = movies.filter((movie) => movie && movie.id != null)

    if (!pool.length) {
      window.alert(
        'No titles are available yet. Please wait for the catalogue to load, then try again.'
      )
      return
    }

    const pick = pool[Math.floor(Math.random() * pool.length)]
    setSelectedMovie(pick)
  }

  function editSavedPlan(saved) {
    setEditingPlanId(saved.id)
    setSelectedMovie(saved.movie)
    setCompanions(saved.companions || 'Friends')
    setMood(saved.mood || 'Happy')

    if (saved.planSettings) {
      setPlan((current) => ({
        ...current,
        ...saved.planSettings,
        snacks: Array.isArray(saved.planSettings.snacks)
          ? [...saved.planSettings.snacks]
          : [...current.snacks],
      }))
    } else {
      setPlan((current) => ({
        ...current,
        date: saved.date || current.date,
        location: saved.location || 'home',
        cinema: saved.cinema || '',
        budget: String(saved.budget ?? current.budget),
        snacks: Array.isArray(saved.snacks)
          ? [...saved.snacks]
          : [...current.snacks],
      }))
    }

    setPage('Movie Night')
    setSelectedMovie(saved.movie)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function makeTimeline() {
    if (!selectedMovie) {
      window.alert('Please select a title first.')
      setPage('Discover')
      return
    }

    const startDate = new Date(`${plan.date}T12:00:00`)

    if (Number.isNaN(startDate.getTime())) {
      window.alert('Please choose a valid date.')
      return
    }

    const events = []
    const addEvent = (title, time, details = '') =>
      events.push({ title, time, details })

    let finish
    let homeArrival
    const runtime = Number(selectedMovie.duration || 120)

    if (plan.location === 'home') {
      const start = getMinutes(startDate, plan.startTime)
      const prep = Number(
        plan.snackMode === 'delivery' ? plan.deliveryMinutes : plan.snackMinutes
      )

      addEvent(
        plan.snackMode === 'delivery' ? 'Order and receive snacks' : 'Prepare snacks',
        addMinutes(start, -prep),
        `${prep} minutes allocated`
      )
      addEvent('Start watching', start, selectedMovie.title)

      const half = Math.floor(runtime / 2)

      if (Number(plan.breakMinutes) > 0) {
        addEvent(
          'Movie break',
          addMinutes(start, half),
          `${plan.breakMinutes} minutes`
        )
      }

      finish = addMinutes(start, runtime + Number(plan.breakMinutes || 0))
      addEvent('Estimated finish', finish, `Runtime estimate: ${runtime} minutes`)
      homeArrival = finish
    } else {
      const showtime = getMinutes(startDate, plan.showtime)
      const travel = Number(plan.travelTo)
      const arrivalBuffer = Math.max(5, Number(plan.arrivalBuffer))
      const arrival = addMinutes(showtime, -arrivalBuffer)
      const leave = addMinutes(arrival, -travel)

      addEvent('Leave for cinema', leave, `Estimated travel: ${travel} minutes`)

      if (plan.transport === 'public') {
        addEvent(
          'Board bus/train',
          addMinutes(leave, Number(plan.boardingBuffer)),
          'Confirm the actual service timetable'
        )
      }

      addEvent('Arrive at cinema', arrival, 'Target arrival before the show')
      addEvent(
        'Ticket and snack check',
        addMinutes(showtime, -5),
        'Allow time for entry and queues'
      )
      addEvent(
        'Movie starts',
        showtime,
        `${plan.cinema || 'Selected cinema'} · ${selectedMovie.title}`
      )

      if (Number(plan.intervalMinutes) > 0) {
        addEvent(
          'Estimated interval',
          addMinutes(showtime, Math.floor(runtime / 2)),
          `${plan.intervalMinutes} minutes; actual interval may differ`
        )
      }

      finish = addMinutes(showtime, runtime + Number(plan.intervalMinutes || 0))
      addEvent(
        'Estimated movie end',
        finish,
        'Check the cinema listing for the confirmed end time'
      )

      homeArrival = addMinutes(finish, Number(plan.travelBack))
      addEvent('Arrive home', homeArrival, `Return travel: ${plan.travelBack} minutes`)
    }

    events.sort((a, b) => a.time - b.time)

    const endLimit = getMinutes(startDate, plan.availableUntil)
    const bedtime = getMinutes(startDate, plan.bedtime)
    const late = homeArrival > endLimit
    const pastBedtime = homeArrival > bedtime

    const newPlan = {
      id: editingPlanId ?? Date.now(),
      movie: selectedMovie,
      date: plan.date,
      location: plan.location,
      companions,
      mood,
      cinema: plan.cinema,
      snacks: [...plan.snacks],
      budget: plan.budget,
      planSettings: { ...plan, snacks: [...plan.snacks] },
      events: events.map((event) => ({
        ...event,
        time: event.time.toISOString(),
      })),
      ending: homeArrival.toISOString(),
      late,
      pastBedtime,
      createdAt: new Date().toISOString(),
    }

    setSavedPlans((current) =>
      editingPlanId === null
        ? [newPlan, ...current]
        : current.map((item) => (item.id === editingPlanId ? newPlan : item))
    )

    setEditingPlanId(null)
    setPage('My Plans')
  }

  const light = {
    page: 'bg-[#F8F4ED] text-[#292522]',
    header: 'border-[#E6D9CF] bg-[#F8F4ED]/90',
    card: 'border-[#E6D9CF] bg-[#FFFCF8]',
    muted: 'text-[#756A63]',
    accent: 'bg-[#F5D8CC] text-[#292522] hover:bg-[#EEC5B6]',
    soft: 'bg-[#F5D8CC]/50 text-[#5B4039]',
    field: 'border-[#E6D9CF] bg-[#FFFCF8] text-[#292522]',
    line: 'border-[#E6D9CF]',
    badge: 'bg-[#F5D8CC] text-[#5B4039]',
  }

  const night = {
    page: 'bg-[#101014] text-[#F6F0EA]',
    header: 'border-[#35323B] bg-[#101014]/90',
    card: 'border-[#35323B] bg-[#1B1A20]',
    muted: 'text-[#B9B0BC]',
    accent: 'bg-[#D8B4FE] text-[#21152B] hover:bg-[#C69AF3]',
    soft: 'bg-[#29242D] text-[#F2C7B8]',
    field: 'border-[#35323B] bg-[#1B1A20] text-[#F6F0EA]',
    line: 'border-[#35323B]',
    badge: 'bg-[#29242D] text-[#F2C7B8]',
  }

  const theme = dark ? night : light
  const inputClass = `mt-1 w-full rounded-xl border px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#B76E79]/40 ${theme.field}`
  const labelClass = `block text-sm font-semibold ${theme.muted}`
  const currentCategory = CATEGORIES.find((item) => item.id === category)?.label || 'Feature Movies'

  function MovieCard({ movie }) {
    const genreNames = GENRES
      .filter((item) => movie.genreIds.includes(item[1]))
      .map((item) => item[0])
      .slice(0, 3)

    return (
      <article className={`group overflow-hidden rounded-2xl border transition hover:-translate-y-1 hover:shadow-xl ${theme.card}`}>
        <button
          className="relative flex h-64 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#F5D8CC] via-[#D8B4FE]/40 to-[#292522] text-7xl"
          onClick={() => setSelectedMovie(movie)}
          aria-label={`View ${movie.title}`}
        >
          <PosterArt
            movie={movie}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-lg bg-black/70 px-2.5 py-1 text-xs font-bold text-white">
            {movie.year}
          </span>
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-1 text-xs font-bold text-white">
            <Star size={12} className="fill-[#F5D8CC] text-[#F5D8CC]" />
            {movie.rating}
          </span>
        </button>

        <div className="p-4">
          <h3 className="min-h-12 font-bold leading-6">{movie.title}</h3>
          <p className={`mt-2 line-clamp-2 text-sm ${theme.muted}`}>
            {genreNames.join(' · ') || movie.overview}
          </p>

          <div className={`mt-4 flex items-center justify-between border-t pt-3 ${theme.line}`}>
            <button
              onClick={() => toggleWatchlist(movie)}
              className={`flex items-center gap-2 text-xs font-semibold ${isSaved(movie) ? 'text-[#B76E79]' : theme.muted}`}
            >
              <Bookmark size={15} fill={isSaved(movie) ? 'currentColor' : 'none'} />
              {isSaved(movie) ? 'Saved' : 'Watchlist'}
            </button>
            <button
              onClick={() => {
                setSelectedMovie(movie)
                setPage('Movie Night')
              }}
              className={`rounded-lg px-3 py-2 text-xs font-bold ${theme.accent}`}
            >
              Plan night
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.page}`}>
      <header className={`sticky top-0 z-30 border-b backdrop-blur-xl ${theme.header}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <button onClick={() => goTo('Home')} className="flex shrink-0 items-center gap-2">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.soft}`}>
              <Clapperboard size={23} />
            </span>
            <span className="text-xl font-black tracking-tight">
              MOVIE<span className="text-[#B76E79]">SLY</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 xl:flex">
            {NAV_ITEMS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => goTo(label)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${page === label ? theme.soft : `hover:bg-current/5 ${theme.muted}`}`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>

          <button
            onClick={() => setDark((value) => !value)}
            aria-label={dark ? 'Switch to Light Mode' : 'Switch to Night Mode'}
            title={dark ? 'Light Mode' : 'Night Mode'}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${theme.line}`}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <nav className={`flex gap-1 overflow-x-auto border-t px-3 py-2 xl:hidden ${theme.line}`}>
          {NAV_ITEMS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => goTo(label)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${page === label ? theme.soft : theme.muted}`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
        <div role="status" className={`mb-6 rounded-xl border px-4 py-3 text-sm ${theme.card}`}>
          <span className={apiConnected ? 'text-emerald-600' : theme.muted}>{apiStatus}</span>
        </div>

        {page === 'Home' && (
          <>
            <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="py-4 lg:py-10">
                <div className={`mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${theme.soft}`}>
                  <Sparkles size={15} />
                  Your next favourite film starts here
                </div>

                <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  Every mood has a <span className="text-[#B76E79]">movie.</span>
                </h1>

                <p className={`mt-5 max-w-xl text-base leading-7 sm:text-lg ${theme.muted}`}>
                  Discover stories, find your mood match, and plan a movie night that fits your time, your people, and your vibe.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    onClick={() => goTo('Discover')}
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold ${theme.accent}`}
                  >
                    <Compass size={18} />
                    Explore catalogue
                    <ChevronRight size={17} />
                  </button>

                  <button
                    onClick={() => goTo('Movie Night')}
                    className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-semibold ${theme.line}`}
                  >
                    <CalendarDays size={17} />
                    Plan a movie night
                  </button>

                  <button
                    onClick={surpriseMovie}
                    className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-semibold ${theme.line}`}
                  >
                    <Sparkles size={17} />
                    Surprise
                  </button>
                </div>

                <div className={`mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm ${theme.muted}`}>
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} />
                    Mood-based picks
                  </span>
                  <span className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    Smarter planning
                  </span>
                  <span className="flex items-center gap-2">
                    <Bookmark size={16} />
                    Your watchlist
                  </span>
                </div>
              </div>

              <div className={`relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-3xl border p-6 sm:p-8 ${theme.card}`}>
                <div className={`absolute -right-12 -top-12 h-52 w-52 rounded-full blur-3xl ${dark ? 'bg-[#D8B4FE]/10' : 'bg-[#F5D8CC]'}`} />
                <div className="relative flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1.5 text-xs font-bold tracking-widest ${theme.soft}`}>
                    YOUR NEXT MOVIE NIGHT
                  </span>
                  <Clapperboard size={24} className="text-[#B76E79]" />
                </div>

                <div className="relative py-8 text-center">
                  <div className="text-8xl sm:text-9xl">🎬</div>
                  <p className="mt-5 text-2xl font-black sm:text-3xl">Make it a movie night.</p>
                  <p className={`mt-2 text-sm ${theme.muted}`}>
                    Great stories. Good company. Your kind of evening.
                  </p>
                </div>

                <button
                  onClick={() => goTo('Movie Night')}
                  className={`relative flex items-center justify-between rounded-2xl border p-4 text-left ${theme.line}`}
                >
                  <div>
                    <p className={`text-xs font-medium ${theme.muted}`}>START PLANNING</p>
                    <p className="mt-1 font-bold">One perfect evening</p>
                  </div>
                  <CalendarCheck size={23} className="text-[#B76E79]" />
                </button>
              </div>
            </section>

            <section className="mt-16">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#B76E79]">
                    The collection
                  </p>
                  <h2 className="mt-2 text-3xl font-black sm:text-4xl">Find your next watch</h2>
                </div>
                <button onClick={() => goTo('Discover')} className={`text-sm font-bold ${theme.muted}`}>
                  View all →
                </button>
              </div>

              <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {CATEGORIES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCategory(item.id)
                      goTo('Discover')
                    }}
                    className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${theme.card}`}
                  >
                    <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${theme.soft}`}>
                      <Clapperboard size={19} />
                    </span>
                    <span className="block font-bold">{item.label}</span>
                    <span className={`mt-1 block text-xs ${theme.muted}`}>
                      {item.id === 'shorts'
                        ? 'Short-form stories under 40 minutes when known'
                        : item.id === 'documentaries'
                          ? 'Documentary films'
                          : item.id === 'animation'
                            ? 'Animated films and anime'
                            : item.id === 'series'
                              ? 'Episodic TV content'
                              : 'Feature-length films'}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {['Discover', 'Mood Matcher', 'Watchlist'].includes(page) && (
          <section>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#B76E79]">
              {page === 'Watchlist' ? 'Your saved titles' : 'Explore stories'}
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              {page === 'Discover'
                ? 'Discover movies and series'
                : page === 'Mood Matcher'
                  ? 'Find a movie for your mood'
                  : 'Your watchlist'}
            </h1>
            <p className={`mt-2 ${theme.muted}`}>
              {page === 'Mood Matcher'
                ? `Currently matching your ${mood.toLowerCase()} mood.`
                : page === 'Watchlist'
                  ? 'Keep your next watches in one place.'
                  : 'Filter the catalogue by category, language and genre.'}
            </p>

            {page !== 'Watchlist' && (
              <>
                <div className="mb-5 mt-7 flex flex-wrap gap-2">
                  {CATEGORIES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCategory(item.id)}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold ${category === item.id ? theme.accent : theme.card}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {page === 'Mood Matcher' && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {MOODS.map((item) => (
                      <button
                        key={item}
                        onClick={() => setMood(item)}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold ${mood === item ? theme.accent : theme.card}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}

                <div className={`mb-5 rounded-2xl border p-4 sm:p-5 ${theme.card}`}>
                  <div className="mb-4 flex items-center gap-2 font-bold">
                    <SlidersHorizontal size={18} />
                    Refine your catalogue
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className={labelClass}>
                      Language
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className={inputClass}
                      >
                        {LANGUAGES.map(([name, code]) => (
                          <option key={name} value={code}>{name}</option>
                        ))}
                      </select>
                    </label>

                    <label className={labelClass}>
                      Multiple genre matching
                      <select
                        value={genreMode}
                        onChange={(e) => setGenreMode(e.target.value)}
                        className={inputClass}
                      >
                        <option value="any">Match any selected genre</option>
                        <option value="all">Match all selected genres</option>
                      </select>
                    </label>
                  </div>

                  <p className={`mb-2 mt-4 text-sm font-semibold ${theme.muted}`}>
                    Select multiple genres
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {GENRES.map(([name, id]) => (
                      <button
                        key={id}
                        onClick={() => toggleGenre(String(id))}
                        className={`rounded-full border px-3 py-2 text-xs font-semibold ${selectedGenres.includes(String(id)) ? theme.accent : theme.line}`}
                      >
                        {selectedGenres.includes(String(id)) ? '✓ ' : ''}{name}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className={`text-xs ${theme.muted}`}>
                      {selectedGenres.length} genres selected · {genreMode === 'all' ? 'all must match' : 'any can match'}
                    </p>
                    <button
                      onClick={() => {
                        setLanguage('')
                        setSelectedGenres([])
                        setGenreMode('any')
                        setSearch('')
                      }}
                      className={`rounded-lg border px-3 py-2 text-xs font-bold ${theme.line}`}
                    >
                      Clear filters
                    </button>
                  </div>
                </div>

                <label className={`mb-7 flex items-center gap-3 rounded-xl border px-4 py-3 ${theme.card}`}>
                  <Search size={18} className={theme.muted} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search titles or descriptions…"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </label>
              </>
            )}

            {page === 'Watchlist' && (
              <div className="mb-6">
                <button
                  onClick={() => goTo('Discover')}
                  className={`rounded-xl px-4 py-3 text-sm font-bold ${theme.accent}`}
                >
                  Discover more titles
                </button>
              </div>
            )}

            {loading ? (
              <div className={`rounded-2xl border p-12 text-center ${theme.card}`}>
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Loading titles…
              </div>
            ) : visibleMovies.length ? (
              <>
                <p className={`mb-4 text-sm ${theme.muted}`}>
                  {currentCategory} · {visibleMovies.length} titles
                </p>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {visibleMovies.map((movie) => (
                    <MovieCard key={`${movie.mediaType}-${movie.id}`} movie={movie} />
                  ))}
                </div>
              </>
            ) : (
              <div className={`rounded-2xl border p-12 text-center ${theme.card}`}>
                <Search size={34} className={`mx-auto ${theme.muted}`} />
                <h2 className="mt-4 text-xl font-bold">
                  {page === 'Watchlist' ? 'Your watchlist is empty' : 'No matching titles found'}
                </h2>
                <p className={`mt-2 text-sm ${theme.muted}`}>
                  Try changing your language, genre, category or search.
                </p>
              </div>
            )}
          </section>
        )}

        {page === 'Movie Night' && (
          <section>
            <button
              onClick={() => goTo('Discover')}
              className={`mb-5 flex items-center gap-2 text-sm font-semibold ${theme.muted}`}
            >
              <ArrowLeft size={16} />
              Back to catalogue
            </button>

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#B76E79]">
              Your evening, your way
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">Plan your movie night</h1>
            <p className={`mt-2 max-w-2xl ${theme.muted}`}>
              Build a schedule around your chosen title, snacks, transport, available time and bedtime.
            </p>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
              <div className="space-y-6">
                <div className={`rounded-2xl border p-5 sm:p-6 ${theme.card}`}>
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <Play size={20} />
                    1. Choose your title
                  </h2>

                  {selectedMovie ? (
                    <div className={`mt-4 flex items-center gap-4 rounded-xl border p-3 ${theme.line}`}>
                      {selectedMovie.poster && (
                        <img src={selectedMovie.poster} alt="" className="h-20 w-14 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold">{selectedMovie.title}</p>
                        <p className={`mt-1 text-sm ${theme.muted}`}>
                          {selectedMovie.year} · ⭐ {selectedMovie.rating}
                        </p>
                        <p className={`text-xs ${theme.muted}`}>
                          Runtime used: {selectedMovie.duration || 120} minutes (estimated if unavailable)
                        </p>
                      </div>
                      <button
                        onClick={() => goTo('Discover')}
                        className={`rounded-lg px-3 py-2 text-xs font-bold ${theme.accent}`}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <label className={labelClass}>Search a title</label>
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Type a title…"
                        className={inputClass}
                      />
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {movies
                          .filter((movie) => movie.title.toLowerCase().includes(search.toLowerCase()))
                          .slice(0, 6)
                          .map((movie) => (
                            <button
                              key={movie.id}
                              onClick={() => {
                                setSelectedMovie(movie)
                                setSearch('')
                              }}
                              className={`rounded-xl border p-3 text-left text-sm font-semibold ${theme.line}`}
                            >
                              {movie.title}
                              <span className={theme.muted}> · {movie.year}</span>
                            </button>
                          ))}
                      </div>
                      <button
                        onClick={() => goTo('Discover')}
                        className={`mt-3 text-sm font-bold ${theme.muted}`}
                      >
                        Browse all categories →
                      </button>
                    </div>
                  )}
                </div>

                <div className={`rounded-2xl border p-5 sm:p-6 ${theme.card}`}>
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <Users size={20} />
                    2. Your preferences
                  </h2>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className={labelClass}>
                      Who is watching?
                      <select value={companions} onChange={(e) => setCompanions(e.target.value)} className={inputClass}>
                        {COMPANIONS.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>

                    <label className={labelClass}>
                      Your mood
                      <select value={mood} onChange={(e) => setMood(e.target.value)} className={inputClass}>
                        {MOODS.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>

                    <label className={labelClass}>
                      Movie night date
                      <input type="date" value={plan.date} onChange={(e) => updatePlan('date', e.target.value)} className={inputClass} />
                    </label>

                    <label className={labelClass}>
                      Maximum budget (₹)
                      <input type="number" min="0" value={plan.budget} onChange={(e) => updatePlan('budget', e.target.value)} className={inputClass} />
                    </label>
                  </div>
                </div>

                <div className={`rounded-2xl border p-5 sm:p-6 ${theme.card}`}>
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <House size={20} />
                    3. Where are you watching?
                  </h2>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updatePlan('location', 'home')}
                      className={`rounded-xl border p-4 text-left ${plan.location === 'home' ? theme.accent : theme.line}`}
                    >
                      <House size={23} />
                      <p className="mt-2 font-bold">At home</p>
                      <p className="mt-1 text-xs opacity-75">Snacks, breaks and bedtime</p>
                    </button>

                    <button
                      onClick={() => updatePlan('location', 'theatre')}
                      className={`rounded-xl border p-4 text-left ${plan.location === 'theatre' ? theme.accent : theme.line}`}
                    >
                      <Ticket size={23} />
                      <p className="mt-2 font-bold">At a theatre</p>
                      <p className="mt-1 text-xs opacity-75">Enter verified showtime manually</p>
                    </button>
                  </div>

                  {plan.location === 'home' ? (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <label className={labelClass}>
                        Movie start time
                        <input type="time" value={plan.startTime} onChange={(e) => updatePlan('startTime', e.target.value)} className={inputClass} />
                      </label>

                      <label className={labelClass}>
                        Snack plan
                        <select value={plan.snackMode} onChange={(e) => updatePlan('snackMode', e.target.value)} className={inputClass}>
                          <option value="prepare">Prepare at home</option>
                          <option value="delivery">Order delivery</option>
                        </select>
                      </label>

                      <label className={labelClass}>
                        {plan.snackMode === 'delivery' ? 'Delivery estimate (minutes)' : 'Preparation time (minutes)'}
                        <input
                          type="number"
                          min="0"
                          value={plan.snackMode === 'delivery' ? plan.deliveryMinutes : plan.snackMinutes}
                          onChange={(e) => updatePlan(plan.snackMode === 'delivery' ? 'deliveryMinutes' : 'snackMinutes', e.target.value)}
                          className={inputClass}
                        />
                      </label>

                      <label className={labelClass}>
                        Break duration
                        <select value={plan.breakMinutes} onChange={(e) => updatePlan('breakMinutes', e.target.value)} className={inputClass}>
                          {['0', '25', '30', '35', '40', '45'].map((item) => (
                            <option key={item} value={item}>
                              {item === '0' ? 'No break' : `${item} minutes`}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <label className={labelClass}>
                        Cinema name
                        <input value={plan.cinema} onChange={(e) => updatePlan('cinema', e.target.value)} placeholder="Cinema name" className={inputClass} />
                      </label>

                      <label className={labelClass}>
                        Confirmed showtime
                        <input type="time" value={plan.showtime} onChange={(e) => updatePlan('showtime', e.target.value)} className={inputClass} />
                      </label>

                      <label className={labelClass}>
                        Transport
                        <select value={plan.transport} onChange={(e) => updatePlan('transport', e.target.value)} className={inputClass}>
                          <option value="public">Bus / train</option>
                          <option value="car">Car / taxi</option>
                          <option value="walk">Walk</option>
                        </select>
                      </label>

                      <label className={labelClass}>
                        Travel to cinema (minutes)
                        <input type="number" min="0" value={plan.travelTo} onChange={(e) => updatePlan('travelTo', e.target.value)} className={inputClass} />
                      </label>

                      <label className={labelClass}>
                        Return travel (minutes)
                        <input type="number" min="0" value={plan.travelBack} onChange={(e) => updatePlan('travelBack', e.target.value)} className={inputClass} />
                      </label>

                      <label className={labelClass}>
                        Arrival buffer (minimum 5)
                        <input type="number" min="5" value={plan.arrivalBuffer} onChange={(e) => updatePlan('arrivalBuffer', e.target.value)} className={inputClass} />
                      </label>

                      {plan.transport === 'public' && (
                        <label className={labelClass}>
                          Boarding / transfer buffer
                          <input type="number" min="0" value={plan.boardingBuffer} onChange={(e) => updatePlan('boardingBuffer', e.target.value)} className={inputClass} />
                        </label>
                      )}

                      <label className={labelClass}>
                        Interval duration
                        <select value={plan.intervalMinutes} onChange={(e) => updatePlan('intervalMinutes', e.target.value)} className={inputClass}>
                          <option value="0">No interval</option>
                          <option value="10">10 minutes</option>
                          <option value="15">15 minutes</option>
                          <option value="20">20 minutes</option>
                        </select>
                      </label>

                      <p className={`sm:col-span-2 text-xs ${theme.muted}`}>
                        MOVIESLY does not yet retrieve live theatre showtimes. Enter a confirmed time from the cinema or ticket provider.
                      </p>
                    </div>
                  )}
                </div>

                <div className={`rounded-2xl border p-5 sm:p-6 ${theme.card}`}>
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <Utensils size={20} />
                    4. Snack list
                  </h2>
                  <p className={`mt-2 text-sm ${theme.muted}`}>Choose snacks to include in your plan.</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {SNACKS.map((snack) => (
                      <button
                        key={snack}
                        onClick={() => toggleSnack(snack)}
                        className={`rounded-xl border px-3 py-2 text-sm font-semibold ${plan.snacks.includes(snack) ? theme.accent : theme.line}`}
                      >
                        {plan.snacks.includes(snack) && '✓ '}{snack}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`rounded-2xl border p-5 sm:p-6 ${theme.card}`}>
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <Clock3 size={20} />
                    5. Your time limits
                  </h2>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className={labelClass}>
                      Must finish by
                      <input type="time" value={plan.availableUntil} onChange={(e) => updatePlan('availableUntil', e.target.value)} className={inputClass} />
                    </label>

                    <label className={labelClass}>
                      Desired bedtime
                      <input type="time" value={plan.bedtime} onChange={(e) => updatePlan('bedtime', e.target.value)} className={inputClass} />
                    </label>

                    <label className={`${labelClass} sm:col-span-2`}>
                      Tomorrow's wake-up / college / work time
                      <input type="time" value={plan.nextDayTime} onChange={(e) => updatePlan('nextDayTime', e.target.value)} className={inputClass} />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={makeTimeline}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-4 font-bold ${theme.accent}`}
                  >
                    <CalendarCheck size={19} />
                    {editingPlanId !== null ? 'Save changes to this plan' : 'Generate & save my movie-night plan'}
                  </button>

                  {editingPlanId !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlanId(null)
                        setPage('My Plans')
                      }}
                      className={`rounded-xl border px-5 py-4 font-semibold ${theme.line}`}
                    >
                      Cancel editing
                    </button>
                  )}
                </div>
              </div>

              <aside className={`h-fit rounded-2xl border p-5 sm:p-6 lg:sticky lg:top-32 ${theme.card}`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="text-[#B76E79]" size={21} />
                  <h2 className="text-xl font-bold">Your plan at a glance</h2>
                </div>

                <div className={`mt-5 rounded-xl p-4 ${theme.soft}`}>
                  <p className="text-xs font-bold uppercase tracking-wider">MOVIE NIGHT</p>
                  <p className="mt-2 text-lg font-black">{selectedMovie?.title || 'Choose a title'}</p>
                  <p className="mt-1 text-sm">{companions} · {mood}</p>
                  <p className="mt-2 text-sm">{plan.location === 'home' ? '🏠 At home' : '🎟️ At a theatre'}</p>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <CalendarDays size={18} className={theme.muted} />
                    <div>
                      <p className="text-sm font-semibold">Date</p>
                      <p className={`text-sm ${theme.muted}`}>{plan.date}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Utensils size={18} className={theme.muted} />
                    <div>
                      <p className="text-sm font-semibold">Snacks</p>
                      <p className={`text-sm ${theme.muted}`}>
                        {plan.snacks.length ? plan.snacks.join(', ') : 'None selected'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Heart size={18} className={theme.muted} />
                    <div>
                      <p className="text-sm font-semibold">Budget</p>
                      <p className={`text-sm ${theme.muted}`}>₹{plan.budget || 0} maximum</p>
                    </div>
                  </div>
                </div>

                <div className={`mt-6 rounded-xl border p-4 ${theme.line}`}>
                  <p className="text-sm font-bold">What happens next?</p>
                  <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>
                    Generate your plan to calculate preparation, movie, interval, travel and return-home times. The timeline is saved in My Plans.
                  </p>
                </div>
              </aside>
            </div>
          </section>
        )}

        {page === 'My Plans' && (
          <section>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#B76E79]">Your evenings</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">My movie-night plans</h1>
            <p className={`mt-2 ${theme.muted}`}>Your saved plans stay in this browser.</p>

            {!savedPlans.length ? (
              <div className={`mt-8 rounded-2xl border p-12 text-center ${theme.card}`}>
                <CalendarDays size={35} className={`mx-auto ${theme.muted}`} />
                <h2 className="mt-4 text-xl font-bold">No plans yet</h2>
                <p className={`mt-2 text-sm ${theme.muted}`}>Choose a title and generate your first plan.</p>
                <button
                  onClick={() => goTo('Movie Night')}
                  className={`mt-5 rounded-xl px-4 py-3 font-bold ${theme.accent}`}
                >
                  Start planning
                </button>
              </div>
            ) : (
              <div className="mt-8 space-y-6">
                {savedPlans.map((saved) => (
                  <article key={saved.id} className={`rounded-2xl border p-5 sm:p-6 ${theme.card}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${theme.badge}`}>
                          {saved.location === 'home' ? <House size={13} /> : <Ticket size={13} />}
                          {saved.location === 'home' ? 'HOME MOVIE NIGHT' : 'THEATRE MOVIE NIGHT'}
                        </span>
                        <h2 className="mt-3 text-xl font-black">{saved.movie.title}</h2>
                        <p className={`mt-1 text-sm ${theme.muted}`}>
                          {saved.date} · {saved.companions} · {saved.mood}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editSavedPlan(saved)}
                          className={`rounded-lg border px-3 py-2 text-sm font-semibold ${theme.line}`}
                          title={`Edit ${saved.movie.title}`}
                        >
                          <SlidersHorizontal size={15} className="mr-1 inline" />
                          Edit plan
                        </button>

                        <button
                          onClick={() => {
                            setSavedPlans((current) => current.filter((item) => item.id !== saved.id))
                            if (editingPlanId === saved.id) setEditingPlanId(null)
                          }}
                          className={`rounded-lg p-2 ${theme.muted}`}
                          title="Delete plan"
                          aria-label="Delete plan"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {(saved.late || saved.pastBedtime) && (
                      <div className={`mt-4 rounded-xl border p-3 text-sm ${theme.soft}`}>
                        <p className="flex items-center gap-2 font-bold">
                          <Clock3 size={16} />
                          Schedule notice
                        </p>
                        {saved.late && <p className="mt-1">Your plan ends after your selected available time.</p>}
                        {saved.pastBedtime && <p className="mt-1">Your plan ends after your desired bedtime.</p>}
                      </div>
                    )}

                    <div className="mt-6">
                      <h3 className="font-bold">Your timeline</h3>
                      <div className="mt-4 space-y-4">
                        {saved.events.map((event, index) => (
                          <div key={`${saved.id}-${index}`} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <span className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${theme.soft}`}>
                                {index === 0 ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}
                              </span>
                              {index < saved.events.length - 1 && (
                                <span className={`mt-1 min-h-5 w-px flex-1 border-l ${theme.line}`} />
                              )}
                            </div>

                            <div className="min-w-0 flex-1 pb-3">
                              <p className={`text-sm font-bold ${theme.muted}`}>
                                {formatTime(new Date(event.time))}
                              </p>
                              <p className="mt-1 font-semibold">{event.title}</p>
                              {event.details && <p className={`mt-1 text-sm ${theme.muted}`}>{event.details}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`mt-4 rounded-xl p-4 ${theme.soft}`}>
                      <p className="text-xs font-bold uppercase tracking-wider">Estimated arrival / finish</p>
                      <p className="mt-1 text-lg font-black">{formatDateTime(new Date(saved.ending))}</p>
                      <p className="mt-2 text-sm">
                        Snacks: {saved.snacks.length ? saved.snacks.join(', ') : 'None'} · Budget: ₹{saved.budget}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {selectedMovie && page !== 'Movie Night' && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
            onClick={() => setSelectedMovie(null)}
          >
            <div
              className={`my-auto w-full max-w-lg rounded-2xl border p-5 sm:p-7 ${theme.card}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#B76E79]">Title details</p>
                  <h2 className="mt-2 text-2xl font-black">{selectedMovie.title}</h2>
                  <p className={`mt-2 text-sm ${theme.muted}`}>{selectedMovie.year} · ⭐ {selectedMovie.rating}</p>
                </div>
                <button
                  onClick={() => setSelectedMovie(null)}
                  className={`rounded-lg p-2 ${theme.soft}`}
                  aria-label="Close details"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 h-64 overflow-hidden rounded-xl sm:h-72">
                <PosterArt movie={selectedMovie} className="h-full w-full object-cover object-center" />
              </div>

              <p className={`mt-5 text-sm leading-6 ${theme.muted}`}>{selectedMovie.overview}</p>
              <p className={`mt-3 text-xs ${theme.muted}`}>
                Original language: {LANGUAGES.find((item) => item[1] === selectedMovie.language)?.[0] || selectedMovie.language || 'Not listed'}
                {' · '}
                Type: {selectedMovie.mediaType === 'tv' ? 'TV series' : 'Movie'}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => toggleWatchlist(selectedMovie)}
                  className={`rounded-xl border px-4 py-3 font-semibold ${theme.line}`}
                >
                  <Bookmark size={16} className="mr-2 inline" />
                  {isSaved(selectedMovie) ? 'Remove from watchlist' : 'Add to watchlist'}
                </button>

                <button
                  onClick={() => goTo('Movie Night')}
                  className={`rounded-xl px-4 py-3 font-bold ${theme.accent}`}
                >
                  Plan this title
                  <ChevronRight size={16} className="ml-1 inline" />
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className={`mt-16 border-t py-8 text-center text-sm ${theme.line} ${theme.muted}`}>
          © {new Date().getFullYear()} MOVIESLY · Every mood has a movie.
        </footer>
      </main>
    </div>
  )
}

export default App