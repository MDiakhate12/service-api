node('faas-cloud-backend') {
    checkout scm 
    
    stage('pull github changes') {
        dir('/home/dmouhammad/provisionning-available-resources') {
            sh "git pull origin master"
        }
    }
    
    stage('build') {
        dir('/home/dmouhammad/provisionning-available-resources') {
            sh "npm install"
        }
    }
    
    stage('deploy') {
        sh "pm2 reload index"
    }
}
