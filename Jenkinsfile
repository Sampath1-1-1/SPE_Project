pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'aaradhyaghota'
        GIT_REPO_URL = 'https://github.com/Aaradhyaghota/Major_Project_spe.git'
        EMAIL_RECIPIENT = 'aaradhyaghota@gmail.com'
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo 'Checking out code from GitHub...'
                git url: "${GIT_REPO_URL}", branch: 'main'
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running automated tests...'
                dir('tests') {
                    sh 'python3 test_app.py'
                }
            }
        }

        stage('Build and Push Docker Images') {
            steps {
                echo 'Building Docker images...'

                echo 'Listing frontend directory contents...'
                dir('frontend') {
                    sh 'ls -la'
                    sh 'docker build -t ${DOCKERHUB_USERNAME}/frontend:latest . || { echo "Frontend build failed"; exit 1; }'
                }

                echo 'Listing Backend/MiddleWare directory contents...'
                dir('Backend/MiddleWare') {
                    sh 'ls -la'
                    sh 'docker build -t ${DOCKERHUB_USERNAME}/middleware:latest . || { echo "Middleware build failed"; exit 1; }'
                }

                echo 'Listing Backend/Model-service directory contents...'
                dir('Backend/Model-service') {
                    sh 'ls -la'
                    sh 'docker build -t ${DOCKERHUB_USERNAME}/model-service:latest . || { echo "Model-service build failed"; exit 1; }'
                }

                echo 'Logging into Docker Hub...'
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_USERNAME --password-stdin'

                echo 'Pushing Docker images to Docker Hub...'
                sh 'docker push ${DOCKERHUB_USERNAME}/frontend:latest'
                sh 'docker push ${DOCKERHUB_USERNAME}/middleware:latest'
                sh 'docker push ${DOCKERHUB_USERNAME}/model-service:latest'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to Kubernetes using Ansible...'
                dir('ansible') {
                    echo 'Listing Backend/Kubernates directory contents...'
                    sh 'ls -la ../Backend/Kubernates/'
                    sh 'ansible-playbook -i inventory.yml deploy.yml'
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Verifying deployment...'
                sh 'kubectl get pods'
                sh 'kubectl get svc'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
            mail to: "${EMAIL_RECIPIENT}",
                 subject: "✅ Jenkins Pipeline Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "The pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER} completed successfully.\nCheck the build at ${env.BUILD_URL}"
        }

        failure {
            echo 'Pipeline failed!'
            mail to: "${EMAIL_RECIPIENT}",
                 subject: "❌ Jenkins Pipeline Failure: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "The pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER} failed.\nCheck the build at ${env.BUILD_URL}"
        }

        always {
            echo 'Cleaning up Docker images to free space...'
            sh 'docker rmi ${DOCKERHUB_USERNAME}/frontend:latest || true'
            sh 'docker rmi ${DOCKERHUB_USERNAME}/middleware:latest || true'
            sh 'docker rmi ${DOCKERHUB_USERNAME}/model-service:latest || true'
        }
    }
}