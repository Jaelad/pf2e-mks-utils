export default class $$strings {
	static withTemplate = (template, vars = {}) => {
		const handler = new Function('vars', [
			'const tagged = ( ' + Object.keys(vars).join(', ') + ' ) =>',
			'`' + template + '`',
			'return tagged(...Object.values(vars))'
		].join('\n'))

		return handler(vars)
	}

	static escapeHtml(html) {
		const text = document.createTextNode(html)
		const p = document.createElement('p')
		p.appendChild(text)
		return p.innerHTML
	}

	static camelize(str, initialUpper = true) {
		return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
			return !initialUpper && index === 0  ? word.toLowerCase() : word.toUpperCase()
		}).replace(/\s+/g, '')
	}
}