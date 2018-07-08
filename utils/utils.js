const { JSDOM } = require('jsdom')
const githubUrlRegex = /(https?):\/\/(www.)?(github.com\/)(.*?\/)(.*?\/)(.*?)(\/?|#[-\d\w._]+?)(\/)?$/gmi

const updateLinksHtml = async html => {
  const dom = JSDOM.fragment(html)
  const isEmail = !!dom.querySelectorAll('.email-fragment').length
  if (!isEmail) {
    const anchorNodes = dom.querySelectorAll('a')
    for (let a of anchorNodes) {
      if (a && a.href && a.href === a.innerHTML && githubUrlRegex.test(a.href)) {
        try {
          const dom = JSDOM.fragment((await JSDOM.fromURL(a.href)).serialize())
          console.log(dom.querySelectorAll('a.js-permalink-shortcut')[0].href)
          a.href = a.innerHTML = `https://github.com${dom.querySelectorAll('a.js-permalink-shortcut')[0].href}`
        } catch (e) {}
      };
    }
  }
  return dom.firstChild.outerHTML
}

const updateLinksText = async text => {
  const promises = []
  text.replace(githubUrlRegex, (match) => {
    promises.push(JSDOM.fromURL(match))
    return match
  })

  const replacement = await Promise.all(promises)
  let currentIdx = 0
  return text.replace(githubUrlRegex, (match) => {
    const dom = JSDOM.fragment(replacement[currentIdx++].serialize())
    console.log(dom.querySelectorAll('a.js-permalink-shortcut')[0].href);
    return `https://github.com${dom.querySelectorAll('a.js-permalink-shortcut')[0].href}`
  })
}

module.exports = exports = {
  updateLinksText
}
