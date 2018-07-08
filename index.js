const { updateLinksText } = require('./utils/utils')

/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = exports = app => {
  app.log('The app was loaded!')

  app.on('commit_comment', async context => {
    // TODO:
    app.log('A commit comment!')
  })

  // TODO:
  // const events = [
  //   'pull_request_review',
  //   'pull_request_review_comment'
  // ]

  app.on(['issues.opened', 'issues.edited'], async context => {
    if (!context.payload.changes || context.payload.changes.body.from !== context.payload.issue.body) {
      context.github.issues.edit(context.issue({body: await updateLinksText(context.payload.issue.body)}))
    }
  })

  app.on(['issue_comment.created', 'issue_comment.edited'], async context => {
    const {id: comment_id, body} = context.payload.comment
    if (!context.payload.changes || context.payload.changes.body.from !== body) {
      context.github.issues.editComment({...context.repo(), comment_id, body: await updateLinksText(body)})
    }
  })

  app.on(['pull_request.opened', 'pull_request.edited'], async context => {
    const {number, title, state, base, maintainer_can_modify, body} = context.payload.pull_request
    if (!context.payload.changes || context.payload.changes.body.from !== body) {
      context.github.pullRequests.update({...context.repo(), number, title, state, base, maintainer_can_modify, body: await updateLinksText(body)})
    }
  })
}
