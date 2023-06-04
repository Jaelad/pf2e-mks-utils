export default class $$strings {
	static GENERATE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

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
		return str
			.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => !initialUpper && index === 0  ? word.toLowerCase() : word.toUpperCase())
			.replace(/\s+/g, '')
	}

	static underscored(str, uppercase = true) {
		const result = str
			.replace(/\.?([A-Z])/g, (x,y) => "_" + y.toLowerCase())
			.replace(/^_/, "")
		return uppercase ? result.toUpperCase() : result
	}

	static generate(length) {
		let result = ''
		for (let i = 0; i < length; i++ )
			result += $$strings.GENERATE_CHARS.charAt(Math.floor(Math.random() * $$strings.GENERATE_CHARS.length))

		return result
	}

	static generateUUID() { // Public Domain/MIT
		let d = new Date().getTime();//Timestamp
		let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0 //Time in microseconds since page-load or 0 if unsupported
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			let r = Math.random() * 16 //random number between 0 and 16
			if (d > 0) { //Use timestamp until depleted
				r = (d + r)%16 | 0
				d = Math.floor(d/16)
			}
			else { //Use microseconds since page-load if supported
				r = (d2 + r)%16 | 0
				d2 = Math.floor(d2/16)
			}
			return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
		})
	}
}