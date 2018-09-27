@Library ('folio_jenkins_shared_libs@run_script') _

buildNPM {
  publishModDescriptor = 'yes'
  runLint = 'yes'
  runScripts = [
      'test:core':'--karma.singleRun --karma.browsers ChromeDocker --karma.reporters mocha junit --coverage',
      'test:webpack':'' ]
}
