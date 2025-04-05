	import React from 'react'
	import './SearchResults.css'


	//Settng the article type
	type Article = {
		title: string
		[key: string]: any
	}

	interface Props {
		results: Article[]
	}

	function SearchResults(props: Props) {
		var results = props.results

		//Displying "No results found" if there is no match of a search results
		if (results.length === 0) {
			return React.createElement('p', null, 'No results found.')
		}

		//Creating array to have the list items
		var items = []
		for (var i = 0; i < results.length; i++) {
			var item = results[i]
			var content = ''


			if (item.title) {
				content = item.title
			} else {
				content = JSON.stringify(item)
			}

			items.push(
				React.createElement(
					'li',
					{ key: i, className: 'result-item' },
					content
				)
			)
		}

		//Retruning the list items with results
		return React.createElement('ul', { className: 'search-results' }, items)
	}

	export default SearchResults
