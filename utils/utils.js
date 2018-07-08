const { JSDOM } = require('jsdom')
const githubUrlRegex = /(https?:\/\/)((www.)?github.com\/)(\S*?\/)(\S*?\/)(\S*)(\/?|#[-\d\w._]+?)/gmi

/* eslint-disable no-unused-vars */
const updateLinksHtml = async html => {
  const dom = JSDOM.fragment(html)
  const isEmail = !!dom.querySelectorAll('.email-fragment').length
  if (!isEmail) {
    const anchorNodes = dom.querySelectorAll('a')
    for (let a of anchorNodes) {
      if (a && a.href && a.href === a.innerHTML && githubUrlRegex.test(a.href)) {
        try {
          const dom = JSDOM.fragment((await JSDOM.fromURL(a.href)).serialize())
          const nodeList = dom.querySelectorAll('a.js-permalink-shortcut')
          if (nodeList.length && nodeList[0] && nodeList[0].href) {
            a.href = a.innerHTML = `https://github.com${nodeList[0].href}`
          }
        } catch (e) {
          console.log(e.message)
          return html
        }
      };
    }
  }
  return dom.firstChild.outerHTML
}
/* eslint-enable no-unused-vars */

const updateLinksText = async text => {
  const promises = []
  text.replace(githubUrlRegex, (match) => {
    promises.push(JSDOM.fromURL(match))
    return match
  })

  try {
    const replacement = await Promise.all(promises)
    let currentIdx = 0
    return text.replace(githubUrlRegex, (match) => {
      const dom = JSDOM.fragment(replacement[currentIdx++].serialize())
      const nodeList = dom.querySelectorAll('a.js-permalink-shortcut')
      if (nodeList.length && nodeList[0] && nodeList[0].href) {
        return `https://github.com${nodeList[0].href}`
      }

      return match
    })
  } catch (e) {
    console.log(e.message)
  }

  return text
}

module.exports = exports = {
  updateLinksText
}
