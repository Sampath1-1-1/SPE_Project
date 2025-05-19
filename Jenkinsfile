pipeline {
    agent none
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'aaradhyaghota'
        GIT_REPO_URL = 'https://github.com/Aaradhyaghota/Major_Project_spe.git'
        EMAIL_RECIPIENT = 'aaradhyaghota@gmail.com'
    }
    stages {
        stage('Checkout Code') {
            agent {
                docker {
                    image 'python:3.11.12-slim'
                    args '-u root'
                }
            }
            steps {
                echo 'Checking out code from GitHub...'
                git url: "${GIT_REPO_URL}", branch: 'main'
            }
        }

        stage('Run Tests') {
            agent {
                docker {
                    image 'python:3.11.12-slim'
                    args '-u root'
                }
            }
            steps {
                echo 'Running automated tests...'
                dir('Backend/Model-service') {
                    sh '''
                        export PATH=$PATH:/root/.local/bin
                        python3 -m pip install --user -r requirements.txt
                        pip3 list | grep -i flask-cors || echo "flask-cors not found in pip list"
                        python3 --version
                        pytest --version || echo "pytest not found"
                        # Create the directory and copy model.pkl to the expected location
                        mkdir -p /var/lib/mlService/ml-model
                        cp model.pkl /var/lib/mlService/ml-model/model.pkl
                    '''
                    sh 'ls -la | grep model.pkl'
                }
                dir('tests') {
                    sh 'pwd'
                    sh 'ls -la ../Backend/Model-service'
                    sh '''
                        export PATH=$PATH:/root/.local/bin
                        export PYTHONPATH=$PYTHONPATH:$(pwd)/../Backend/Model-service
                        pytest test_app.py --verbose || { echo "Tests failed"; exit 1; }
                    '''
                }
            }
        }

        stage('Clean Existing Docker Images') {
            agent {
                docker {
                    image 'docker:20.10'
                    args '-v /var/run/docker.sock:/var/run/docker.sock -u root'
                }
            }
            steps {
                echo 'Removing existing Docker images if they exist...'
                sh '''
                    docker rmi ${DOCKERHUB_USERNAME}/frontend:latest || true
                    docker rmi ${DOCKERHUB_USERNAME}/middleware:latest || true
                    docker rmi ${DOCKERHUB_USERNAME}/model-service:latest || true
                '''
            }
        }

        stage('Build and Push Docker Images') {
            agent {
                docker {
                    image 'docker:20.10'
                    args '-v /var/run/docker.sock:/var/run/docker.sock -u root'
                }
            }
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
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_USERNAME --password-stdin || { echo "Docker login failed"; exit 1; }'

                echo 'Pushing Docker images to Docker Hub...'
                sh 'docker push ${DOCKERHUB_USERNAME}/frontend:latest || { echo "Frontend push failed"; exit 1; }'
                sh 'docker push ${DOCKERHUB_USERNAME}/middleware:latest || { echo "Middleware push failed"; exit 1; }'
                sh 'docker push ${DOCKERHUB_USERNAME}/model-service:latest || { echo "Model-service push failed"; exit 1; }'
            }
        }

        stage('Deploy to Kubernetes') {
            agent any
            steps {
                echo 'Deploying to Kubernetes using Ansible...'
                dir('ansible/kubernetes') {
                    echo 'Listing Backend/Kubernates directory contents...'
                    sh 'ls -la ../../Backend/Kubernates/'
                    sh '''
                        ansible-galaxy collection install kubernetes.core
                        ansible-playbook -i inventory.yml deploy.yml --vault-password-file vault-pass.txt
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            agent any
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
                 subject: "Jenkins Pipeline Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "The pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER} completed successfully.\nCheck the build at ${env.BUILD_URL}"
        }
        failure {
            echo 'Pipeline failed!'
            mail to: "${EMAIL_RECIPIENT}",
                 subject: "Jenkins Pipeline Failure: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "The pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER} failed.\nCheck the build at ${env.BUILD_URL}"
        }
    }
}


// pipeline {
//     agent any
//     environment {
//         DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
//         DOCKERHUB_USERNAME = 'aaradhyaghota'
//         GIT_REPO_URL = 'https://github.com/Aaradhyaghota/Major_Project_spe.git'
//         EMAIL_RECIPIENT = 'aaradhyaghota@gmail.com'
//     }
//     stages {
//         stage('Checkout Code') {
//             steps {
//                 echo 'Checking out code from GitHub...'
//                 git url: "${GIT_REPO_URL}", branch: 'main'
//             }
//         }
//         stage('Run Tests') {
//             steps {
//                 echo 'Running automated tests...'
//                 dir('tests') {
//                     sh 'python3 test_app.py'
//                 }
//             }
//         }
//         stage('Build and Push Docker Images') {
//             steps {
//                 echo 'Building Docker images...'
//                 echo 'Listing frontend directory contents...'
//                 dir('Frontend') {
//                     sh 'ls -la'
//                     sh 'docker build -t ${DOCKERHUB_USERNAME}/frontend:latest . || { echo "Frontend build failed"; exit 1; }'
//                 }
//                 echo 'Listing Backend/MiddleWare directory contents...'
//                 dir('Backend/MiddleWare') {
//                     sh 'ls -la'
//                     sh 'docker build -t ${DOCKERHUB_USERNAME}/middleware:latest . || { echo "Middleware build failed"; exit 1; }'
//                 }
//                 echo 'Listing Backend/Model directory contents...'
//                 dir('Backend/Model') {
//                     sh 'ls -la'
//                     sh 'docker build -t ${DOCKERHUB_USERNAME}/model-service:latest . || { echo "Model-service build failed"; exit 1; }'
//                 }
//                 echo 'Logging into Docker Hub...'
//                 sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_USERNAME --password-stdin'
//                 echo 'Pushing Docker images to Docker Hub...'
//                 sh 'docker push ${DOCKERHUB_USERNAME}/frontend:latest'
//                 sh 'docker push ${DOCKERHUB_USERNAME}/middleware:latest'
//                 sh 'docker push ${DOCKERHUB_USERNAME}/model-service:latest'
//             }
//         }
//         stage('Deploy to Docker Compose') {
//             steps {
//                 echo 'Deploying to Docker Compose using Ansible...'
//                 dir('ansible/Docker-compose') {
//                     echo 'Listing ansible/Docker-compose directory contents...'
//                     sh 'ls -la'
//                     sh 'ansible-playbook -i inventory.yml deploy.yml'
//                 }
//             }
//         }
//         stage('Verify Deployment') {
//             steps {
//                 echo 'Verifying Docker Compose deployment...'
//                 dir('ansible/Docker-compose') {
//                     sh 'docker-compose -f deploy/docker-compose.yml ps'
//                     sh 'docker ps -a'
//                 }
//             }
//         }
//     }
//     post {
//         success {
//             echo 'Pipeline completed successfully!'
//             mail to: "${EMAIL_RECIPIENT}",
//                  subject: " Jenkins Pipeline Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
//                  body: "The pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER} completed successfully.\nCheck the build at ${env.BUILD_URL}"
//         }
//         failure {
//             echo 'Pipeline failed!'
//             mail to: "${EMAIL_RECIPIENT}",
//                  subject: " Jenkins Pipeline Failure: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
//                  body: "The pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER} failed.\nCheck the build at ${env.BUILD_URL}"
//         }
//         always {
//             echo 'Cleaning up Docker images to free space...'
//             sh 'docker rmi ${DOCKERHUB_USERNAME}/frontend:latest || true'
//             sh 'docker rmi ${DOCKERHUB_USERNAME}/middleware:latest || true'
//             sh 'docker rmi ${DOCKERHUB_USERNAME}/model-service:latest || true'
//         }
//     }
// }
