# README

This README would normally document whatever steps are necessary to get your application up and running.

### Gitflow commands

- Initializing gitflow
  git flow init -d

- Creating a feature branch
  git flow feature start feature_branch

- Finishing a feature branch
  git flow feature finish feature_branch

- Creating a release branch
  git flow release start 0.1.0

- Finishing a release branch
  git flow release finish '0.1.0'

- Creating a hotfix branch
  git flow hotfix start hotfix_branch

- Finishing a hotfix branch
  git flow hotfix finish hotfix_branch

- for reference go to https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow

- Track local branch to remote branch
git branch --set-upstream-to=origin/<branch> <localbranch>

- to remove recent local commit
git reset --soft HEAD~1

- to add below packages
npm i express body-parser compression express-fileupload http path exceljs fs xls-to-json-lc xlsx-to-json-lc moment regenerator-runtime swagger-ui-express swagger-autogen validatorjs nodemailer mimemessage