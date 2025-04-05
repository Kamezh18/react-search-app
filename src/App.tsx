import React, { useState, useEffect } from 'react'
import './App.css'
import { fetchArticles } from './services/api'

// Defining the type of an Article object
type Article = {
	title: string
	snippet?: string
	pageid?: number
	[key: string]: any
}

function App() {
	// State hooks
	const [query, setQuery] = useState<string>('')
	const [results, setResults] = useState<Article[]>([])
	const [page, setPage] = useState<number>(1)
	const [loading, setLoading] = useState<boolean>(false)
	const RESULTS_PER_PAGE = 10 // Number of items to show per page

	// Fetching articles and update the state + browser history
	const fetchAndSetResults = async (
		searchQuery: string,
		searchPage: number = 1,
		skipHistory: boolean = false
	) => {
		setLoading(true)
		const articles = await fetchArticles(searchQuery)
		setResults(articles)
		setPage(searchPage)
		setLoading(false)

		// Pushing search state to browser history
		if (!skipHistory) {
			window.history.pushState(
				{ query: searchQuery, page: searchPage }, '', `?query=${encodeURIComponent(searchQuery)}&page=${searchPage}`
			)
		}
	}

	//Search trigger
	const handleSearch = () => {
		if (!query.trim()) return
		fetchAndSetResults(query, 1)
	}

	// To clear the search
	const handleClearSearch = () => {
		setQuery('')
		setResults([])
		setPage(1)
		window.history.pushState({}, '', '/')
	}

	// Will help to search while Enter
	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
		handleSearch()
		}
	}

	// Redirect to specific page number on click
	const handlePageClick = (newPage: number) => {
		setPage(newPage)
		window.history.pushState(
			{ query, page: newPage }, '', `?query=${encodeURIComponent(query)}&page=${newPage}`
		)
	}

	// Got to previous page
	const handlePrevPage = () => {
		if (page > 1) handlePageClick(page - 1)
	}

	// Go to next page
	const handleNextPage = () => {
		const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE)
		if (page < totalPages) handlePageClick(page + 1)
	}

	//Check if there's search state in the URL or in the  history during first load
	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const savedQuery = params.get('query')
		const savedPage = parseInt(params.get('page') || '1', 10)

		if (savedQuery) {
			setQuery(savedQuery)
			fetchAndSetResults(savedQuery, savedPage, true)
		}

		//Browser back/forward navigation
		const handlePopState = (e: PopStateEvent) => {
			const state = e.state
			if (state && state.query) {
				setQuery(state.query)
				fetchAndSetResults(state.query, state.page || 1, true)
			}
		}

		window.addEventListener('popstate', handlePopState)
		return () => window.removeEventListener('popstate', handlePopState)
	}, [])

	//Reset if the search bar is empty
	useEffect(() => {
		if (query.trim() === '') {
			setResults([])
			setPage(1)
			window.history.pushState({}, '', '/')
		}
	}, [query])

	//Pagination for search results
	const paginatedResults = results.slice(
		(page - 1) * RESULTS_PER_PAGE,
		page * RESULTS_PER_PAGE
	)
	const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE)
	// const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

	const getVisiblePageNumbers = () => {
		const maxVisiblePages = 3
		const half = Math.floor(maxVisiblePages / 2)
		let start = Math.max(1, page - half)
		let end = Math.min(totalPages, start + maxVisiblePages - 1)
	
		// Readjust start if we are near the end
		start = Math.max(1, end - maxVisiblePages + 1)
	
		const visiblePages = []
		for (let i = start; i <= end; i++) {
			visiblePages.push(i)
		}
		return visiblePages
	}
	const pageNumbers = getVisiblePageNumbers()

	// UI rendering and styling 
	return (
		<>
			<style>{`html, body { background-color: #D7EBF5; margin: 0; padding: 0; }`}</style>

			<div className="app-container">
				<div className="content-wrapper">
					<h2 className="title">Search Help Article</h2>
					<div className="search-box">
						<input type="text" placeholder="Type here to search..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyPress} className="search-input"/>
						{query && ( <button onClick={handleClearSearch} className="clear-btn">✕</button> )}
						<button onClick={handleSearch} className="search-btn">Search
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="white" viewBox="0 0 16 16">
								<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85ZM12 6.5A5.5 5.5 0 1 1 1 6.5a5.5 5.5 0 0 1 11 0Z" />
							</svg>
						</button>
					</div>

					<div>
						{loading ? (
							<p style={{ textAlign: 'center' }}>Loading...</p>
						) : results.length === 0 && query ? (
							<p style={{ textAlign: 'center' }}>No results found</p>
						) : (
							<ul className="results-list">
								{paginatedResults.map((article, i) => (
									<li key={i} className="result-item">
										<div className="result-title">{article.title}</div>
										{(article.snippet || article.content) && (
											<p className="result-snippet">
												<span dangerouslySetInnerHTML={{ __html: article.snippet || '', }} />
												{article.content && (<>{article.snippet ? ' ' : ''}<span>{article.content}</span></>)}
											</p>
										)}
									</li>
								))}
							</ul>
						)}
					</div>

					{results.length > 0 && (
						<div className="pagination">
							<button disabled={page === 1} onClick={handlePrevPage} className={`pagination-btn ${page === 1 ? 'disabled' : ''}`}>←</button>
							{pageNumbers.map((p) => (
								<button key={p} onClick={() => handlePageClick(p)} className={`pagination-btn ${page === p ? 'active' : ''}`}>{p}</button>
							))}
							<button disabled={page === totalPages} onClick={handleNextPage} className={`pagination-btn ${page === totalPages ? 'disabled' : ''}`}>→</button>
						</div>
					)}
				</div>
			</div>
		</>
	)
}

export default App;
