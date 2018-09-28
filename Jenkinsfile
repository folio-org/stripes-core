@Library ('folio_jenkins_shared_libs@folio-1407b') _

buildNPM {
  publishModDescriptor = 'yes'
  runLint = 'yes'
  runScripts = [
   'test:core':'--karma.singleRun --karma.browsers ChromeDocker --karma.reporters mocha junit --coverage',
   'test:webpack':'--reporter mocha-junit-reporter --reporter-options mochaFile=./artifacts/runTest/webpack-results.xml' ]
}
