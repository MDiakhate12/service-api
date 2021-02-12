node('faas-cloud-backend') {
    checkout scm 
    
    stage('commit current changes') {
        dir('/home/dmouhammad/provisionning-available-resources') {
            sh "git add ."
            sh "git commit -m 'before pulling external changes'"
        }
    }
    
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
