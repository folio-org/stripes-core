@Library ('folio_jenkins_shared_libs@FOLIO-1596') _

buildNPM {
  publishModDescriptor = true
  runLint = true
  runSonarqube = true
  runScripts = [
   ['test:core':'--karma.singleRun --karma.browsers ChromeDocker --karma.reporters mocha junit --coverage'],
   ['test:webpack':'--reporter mocha-junit-reporter --reporter-options mochaFile=./artifacts/runTest/webpack-results.xml'] 
  ]
}
