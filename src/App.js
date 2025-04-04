import React, { useState, useEffect } from "react"

function App() {
	const [query, setQuery] = useState("")
	const [results, setResults] = useState([])
	const [page, setPage] = useState(1)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [offset, setOffset] = useState(0)
	const [totalHits, setTotalHits] = useState(0)

	const RESULTS_PER_PAGE = 10
	const BATCH_SIZE = 300

	function fetchResults(searchQuery, newOffset) {
		if (searchQuery.trim() === "") return

		setLoading(true)
		setError(null)

		fetch(
			`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&sroffset=${newOffset}&srlimit=${BATCH_SIZE}&format=json&origin=*`
		)
			.then((response) => {
				if (!response.ok) throw new Error("Failed to fetch data")
				return response.json()
			})
			.then((data) => {
				if (newOffset === 0) {
					setResults(data.query.search)
				} else {
					setResults((prevResults) => prevResults.concat(data.query.search))
				}
				setOffset(newOffset)
				setTotalHits(data.query.searchinfo.totalhits || 0)
			})
			.catch((err) => {
				setError(err.message)
			})
			.finally(() => {
				setLoading(false)
			})
	}

	function handleSearch() {
		setPage(1)
		setOffset(0)
		fetchResults(query, 0)
	}

	function handleKeyPress(event) {
		if (event.key === "Enter") {
			handleSearch()
		}
	}

	function handleClearSearch() {
		setQuery("")
		setResults([])
		setPage(1)
		setOffset(0)
		setTotalHits(0)
		setError(null)
	}

	useEffect(() => {
		function handlePopState(event) {
			if (event.state && event.state.query) {
				setQuery(event.state.query)
				fetchResults(event.state.query, 0)
			}
		}
		window.addEventListener("popstate", handlePopState)
		return () => {
			window.removeEventListener("popstate", handlePopState)
		}
	}, [])

	const maxPage = Math.ceil(totalHits / RESULTS_PER_PAGE)

	function handlePageClick(newPage) {
		setPage(newPage)
		const totalRequired = newPage * RESULTS_PER_PAGE
		if (totalRequired > results.length && results.length < totalHits) {
			const nextOffset = offset + BATCH_SIZE
			if (nextOffset < totalHits) {
				fetchResults(query, nextOffset)
			}
		}
		window.scrollTo({ top: 0, behavior: "smooth" })
	}

	function handleNextPage() {
		if (page < maxPage) handlePageClick(page + 1)
	}

	function handlePrevPage() {
		if (page > 1) handlePageClick(page - 1)
	}

	const start = (page - 1) * RESULTS_PER_PAGE
	const end = page * RESULTS_PER_PAGE
	const paginatedResults = results.slice(start, end)

	// Limit pagination to ±1 from current page
	let pageWindowStart = Math.max(1, page - 1)
	let pageWindowEnd = pageWindowStart + 2

	if (pageWindowEnd > maxPage) {
		pageWindowEnd = maxPage
		pageWindowStart = Math.max(1, pageWindowEnd - 2)
	}
	const pageNumbers = []
	for (let i = pageWindowStart; i <= pageWindowEnd; i++) {
		pageNumbers.push(i)
	}

	// Set body background globally
	useEffect(() => {
		document.body.style.backgroundColor = "#D7EBF5"
		document.body.style.margin = "0"
		document.body.style.scrollBehavior = "smooth"
		return () => {
			document.body.style.backgroundColor = ""
			document.body.style.margin = ""
			document.body.style.scrollBehavior = ""
		}
	}, [])

	return (
		<div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#D7EBF5", color: "black", fontFamily: "Arial, sans-serif", paddingTop: "20px", minHeight: "100vh", }}>
			<div style={{ width: "100%", maxWidth: "800px", padding: "0 20px" }}>
				<h2 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", marginBottom: "20px", color: "#2563EB", }}>Search</h2>
				<div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: "25px", padding: "10px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", }}>
					<input type="text" placeholder="Type here to search..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyPress} style={{ flex: 1, border: "none", outline: "none", fontSize: "16px", padding: "10px", borderRadius: "25px", background: "transparent", }}/>
					{query && (
						<button onClick={handleClearSearch} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px", marginRight: "10px", }}>✕</button>
					)}
					<button onClick={handleSearch} style={{ background: "#2563EB", color: "white", border: "none", padding: "10px 20px", borderRadius: "25px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px", transition: "background 0.3s ease", }} onMouseOver={(e) => e.target.style.background = "#3B82F6"} onMouseOut={(e) => e.target.style.background = "#2563EB"}>Search
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16">
							<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85ZM12 6.5A5.5 5.5 0 1 1 1 6.5a5.5 5.5 0 0 1 11 0Z"/>
						</svg>
					</button>
				</div>

				{loading && <p>Loading...</p>}
				{error && <p style={{ color: "red" }}>{error}</p>}

				<ul style={{ marginTop: "20px", padding: "0", listStyle: "none" }}>
					{paginatedResults.map((article) => (
						<li key={article.pageid} style={{ padding: "15px", borderBottom: "1px solid #ddd" }}>
							<a href={`https://en.wikipedia.org/wiki/${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer">
								<strong style={{ fontSize: "18px" }}>{article.title}</strong>
							</a>
							<p dangerouslySetInnerHTML={{ __html: article.snippet }} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0, }}></p>
						</li>
					))}
				</ul>

				{results.length > 0 && (
					<div style={{ marginTop: "20px", textAlign: "center", display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
						<button disabled={page === 1} onClick={handlePrevPage} style={{ background: page === 1 ? "#ddd" : "#2563EB", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: "16px", transition: "background 0.3s ease", }}>←</button>

						{pageNumbers.map((p) => (
							<button key={p} onClick={() => handlePageClick(p)} style={{ background: page === p ? "#1E40AF" : "#fff", color: page === p ? "white" : "#2563EB", border: "1px solid #2563EB", padding: "8px 16px", borderRadius: "25px", cursor: "pointer", fontSize: "16px", fontWeight: page === p ? "bold" : "normal", transition: "all 0.2s ease", }}>{p}</button>
						))}

						<button disabled={page === maxPage || maxPage <= 1} onClick={handleNextPage} style={{ background: page === maxPage || maxPage <= 1 ? "#ddd" : "#2563EB", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: page === maxPage || maxPage <= 1 ? "not-allowed" : "pointer", fontSize: "16px", transition: "background 0.3s ease", }}>→</button>
					</div>
				)}
			</div>
		</div>
	)
}

export default App
